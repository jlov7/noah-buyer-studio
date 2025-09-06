// OSRM helpers for zero-key routing using the public demo server.
// Why OSRM: no API key, fast matrix and routes for demo purposes. If throttled,
// we backoff and gracefully fall back to haversine-based ETA estimates.
// Note: Avoid Google Distance Matrix with MapLibre/OSM due to Google TOS
// restricting use with non-Google maps.

export type LngLat = { lng: number; lat: number };

const OSRM_BASE = 'https://router.project-osrm.org';

async function fetchWithBackoff(url: string, init?: RequestInit, attempts = 3): Promise<Response> {
  let delay = 400;
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, init);
    if (res.ok) return res;
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
      continue;
    }
    return res;
  }
  return fetch(url, init); // final try
}

const tableCache = new Map<string, { ts: number; durations: number[][] }>();
const routeCache = new Map<string, { ts: number; geometry: any }>();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getTable(coords: LngLat[]): Promise<number[][] | null> {
  if (coords.length === 0) return [];
  const joined = coords.map((c) => `${c.lng},${c.lat}`).join(';');
  const key = `table:${joined}`;
  const now = Date.now();
  const cached = tableCache.get(key);
  if (cached && now - cached.ts < TTL_MS) {
    return cached.durations;
  }
  const url = `${OSRM_BASE}/table/v1/driving/${joined}?annotations=duration`;
  const res = await fetchWithBackoff(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  const durations: number[][] = json?.durations || [];
  // Convert seconds to minutes (floats)
  const mins = durations.map((row: number[]) => row.map((s) => (typeof s === 'number' ? s / 60 : -1)));
  tableCache.set(key, { ts: now, durations: mins });
  return mins;
}

export async function getRouteGeoJSON(coords: LngLat[]): Promise<any | null> {
  if (coords.length < 2) return null;
  const joined = coords.map((c) => `${c.lng},${c.lat}`).join(';');
  const key = `route:${joined}`;
  const now = Date.now();
  const cached = routeCache.get(key);
  if (cached && now - cached.ts < TTL_MS) return cached.geometry;
  const url = `${OSRM_BASE}/route/v1/driving/${joined}?overview=full&geometries=geojson`;
  const res = await fetchWithBackoff(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  const geom = json?.routes?.[0]?.geometry || null;
  if (geom) routeCache.set(key, { ts: now, geometry: geom });
  return geom;
}

export async function getRouteDetails(coords: LngLat[]): Promise<{
  geometry: any | null;
  legs: { distance_km: number; duration_min: number }[];
  total_km: number;
  total_min: number;
} | null> {
  if (coords.length < 2) return null;
  const joined = coords.map((c) => `${c.lng},${c.lat}`).join(';');
  const url = `${OSRM_BASE}/route/v1/driving/${joined}?overview=full&geometries=geojson&steps=false`;
  const res = await fetchWithBackoff(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  const route = json?.routes?.[0];
  if (!route) return null;
  const legs = (route.legs || []).map((leg: any) => ({
    distance_km: (leg.distance ?? 0) / 1000,
    duration_min: (leg.duration ?? 0) / 60,
  }));
  const total_km = (route.distance ?? 0) / 1000;
  const total_min = (route.duration ?? 0) / 60;
  return { geometry: route.geometry || null, legs, total_km, total_min };
}

export function haversineMinutes(a: LngLat, b: LngLat, avgKmh = 35): number {
  const R = 6371; // km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const km = 2 * R * Math.asin(Math.sqrt(h));
  const hours = km / avgKmh;
  return hours * 60;
}

export function fallbackMatrix(coords: LngLat[]): number[][] {
  const n = coords.length;
  const m: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      m[i][j] = i === j ? 0 : haversineMinutes(coords[i], coords[j]);
    }
  }
  return m;
}
