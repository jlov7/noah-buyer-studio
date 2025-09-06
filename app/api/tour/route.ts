import { NextRequest, NextResponse } from 'next/server';
import listingsData from '@/data/listings.json';
import { getTable, fallbackMatrix, type LngLat, getRouteGeoJSON, getRouteDetails, haversineMinutes } from '@/lib/osrm';
import { nearestNeighborOrder } from '@/lib/tour/order';
import { generateICS } from '@/lib/ics';

export const runtime = 'nodejs';

type Listing = typeof listingsData[number];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      ids: string[];
      startTime?: string; // ISO
      dwellMinutes?: number;
      bufferMinutes?: number;
      startCoord?: { lat: number; lng: number } | null;
      notes?: Record<string, string> | undefined;
      orderIds?: string[] | undefined;
    };
    const uniqueIds = Array.from(new Set(body.ids || []));
    if (uniqueIds.length < 2) {
      return NextResponse.json({ error: 'Pick at least two listings' }, { status: 400 });
    }
    if (uniqueIds.length > 10) {
      return NextResponse.json({ error: 'Max 10 listings per tour' }, { status: 400 });
    }
    const selected: Listing[] = listingsData.filter((l) => uniqueIds.includes(l.id)).slice(0, 10);
    if (selected.length < 2) {
      return NextResponse.json({ error: 'No listings selected' }, { status: 400 });
    }

    const dwell = Math.max(5, Math.min(120, Math.round(body.dwellMinutes ?? 20)));
    const buffer = Math.max(0, Math.min(30, Math.round(body.bufferMinutes ?? 5)));
    const startISO = body.startTime || new Date().toISOString();
    // Validate startCoord if provided
    if (body.startCoord) {
      const { lat, lng } = body.startCoord;
      if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return NextResponse.json({ error: 'Invalid start coordinate' }, { status: 400 });
      }
    }

    const stopCoords: LngLat[] = selected.map((l) => ({ lng: l.lng, lat: l.lat }));
    const hasStart = !!body.startCoord;
    const coords: LngLat[] = hasStart && body.startCoord ? [body.startCoord, ...stopCoords] : stopCoords;
    let matrix = await getTable(coords);
    if (!matrix) matrix = fallbackMatrix(coords);

    // Determine stop order
    let stopOrderIdx: number[] | null = null;
    if (body.orderIds && body.orderIds.length === selected.length && new Set(body.orderIds).size === selected.length) {
      // Map provided order IDs to indices
      const idToIndex = new Map(selected.map((s, i) => [s.id, i] as const));
      const mapped = body.orderIds.map((id) => idToIndex.get(id)).filter((v) => v !== undefined) as number[];
      if (mapped.length === selected.length) stopOrderIdx = mapped;
    }
    if (!stopOrderIdx) {
      const nn = nearestNeighborOrder(matrix, 0);
      // Remove start index if present and map to stop indices
      stopOrderIdx = nn.filter((i) => i !== 0).map((i) => (hasStart ? i - 1 : i));
    }
    const ordered = stopOrderIdx.map((i) => selected[i]);

    // Schedule
    const schedule: Array<{
      id: string;
      address: string;
      eta: string;
      etd: string;
      travelMinutes: number;
      visitMinutes: number;
    }> = [];
    let t = new Date(startISO);
    let totalDrive = 0;
    const legDurations: number[] = [];
    const legPairs: Array<[number, number]> = [];
    for (let i = 0; i < ordered.length; i++) {
      const cur = ordered[i];
      const prevStopIdx = i === 0 ? null : stopOrderIdx[i - 1];
      const thisStopIdx = stopOrderIdx[i];
      const fromIdx = hasStart ? (i === 0 ? 0 : (prevStopIdx! + 1)) : (prevStopIdx ?? -1);
      const toIdx = hasStart ? (thisStopIdx + 1) : thisStopIdx;
      const travel = i === 0 ? (hasStart ? matrix[0][toIdx] : 0) : matrix[fromIdx][toIdx];
      legDurations.push(travel || 0);
      legPairs.push([fromIdx, toIdx]);
      totalDrive += travel || 0;
      // advance by travel
      t = new Date(t.getTime() + (travel + buffer) * 60 * 1000);
      const eta = new Date(t);
      const etd = new Date(eta.getTime() + dwell * 60 * 1000);
      schedule.push({ id: cur.id, address: cur.address, eta: eta.toISOString(), etd: etd.toISOString(), travelMinutes: travel, visitMinutes: dwell });
      t = etd;
    }

    const events = schedule.map((s, i) => {
      const note = body.notes?.[s.id]?.trim();
      const desc = 'Tour coordinated by Noah. Drive times via OSRM (demo).' + (note ? `\nNotes: ${note}` : '');
      return {
        start: new Date(s.eta),
        end: new Date(s.etd),
        title: `Showing ${i + 1}: ${s.address}`,
        description: desc,
        location: s.address,
      };
    });
    const ics = generateICS(events);

    // Build route geometry for map display
    const routeCoords: LngLat[] = [];
    if (hasStart) routeCoords.push(coords[0]);
    for (const idx of stopOrderIdx) routeCoords.push({ lng: selected[idx].lng, lat: selected[idx].lat });
    const details = await getRouteDetails(routeCoords);
    const route = details?.geometry || null;
    const legDistances = details?.legs?.map((l) => l.distance_km) ?? [];
    const totalDistanceKm = details?.total_km ?? computeFallbackKm(routeCoords);

    return NextResponse.json({
      order: ordered.map((x) => x.id),
      schedule,
      ics,
      route,
      totalDriveMinutes: totalDrive,
      legDistancesKm: legDistances,
      totalDistanceKm,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to build tour' }, { status: 500 });
  }
}

function computeFallbackKm(coords: LngLat[]): number {
  let km = 0;
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1];
    const b = coords[i];
    const minutes = haversineMinutes(a, b, 60); // 60km/h
    km += (minutes / 60) * 60; // inverse, approximate
  }
  return km;
}
