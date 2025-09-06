"use client";
import { useMemo, useState, useEffect } from 'react';
import MapClient from '@/components/MapClient';
import listingsData from '@/data/listings.json';
import Link from 'next/link';
import Price from '@/components/Price';
import Section from '@/components/ui/Section';

type Listing = typeof listingsData[number];

export default function MapPage() {
  const listings = useMemo(() => listingsData as Listing[], []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [commutes, setCommutes] = useState<{ label: string; minutes: number | null }[]>([
    { label: 'Downtown', minutes: null },
    { label: 'UT Austin', minutes: null },
    { label: 'The Domain', minutes: null },
  ]);
  const [overlayMeta, setOverlayMeta] = useState<{ id: string; name: string; docs?: string }[]>([]);
  const [overlays, setOverlays] = useState<Record<string, boolean>>({
    'fema-nfhl': true,
    'oak-wilt': false,
    'code-cases': false,
  });
  const [femaOpacity, setFemaOpacity] = useState<number>(0.65);
  const [showRoute, setShowRoute] = useState(true);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any | null>(null);
  const [totalDrive, setTotalDrive] = useState<number | null>(null);
  const [totalDistanceKm, setTotalDistanceKm] = useState<number | null>(null);
  const [orderIds, setOrderIds] = useState<string[] | null>(null);
  const [osrmStatus, setOsrmStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [startCoord, setStartCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [pickStart, setPickStart] = useState(false);

  const toggle = (id: string) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const query = selectedIds.length ? `?ids=${selectedIds.join(',')}` : '';

  // Simple commute chips using OSRM (no key). Gracefully ignore failures.
  async function computeCommute(from: Listing) {
    const destinations = [
      { label: 'Downtown', lat: 30.2672, lng: -97.7431 },
      { label: 'UT Austin', lat: 30.2849, lng: -97.7341 },
      { label: 'The Domain', lat: 30.4021, lng: -97.7265 },
    ];
    const results: { label: string; minutes: number | null }[] = [];
    for (const d of destinations) {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${d.lng},${d.lat}?overview=false`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('OSRM unreachable');
        const json = await res.json();
        const sec = json?.routes?.[0]?.duration ?? null;
        results.push({ label: d.label, minutes: sec ? Math.round(sec / 60) : null });
      } catch {
        results.push({ label: d.label, minutes: null });
      }
    }
    setCommutes(results);
  }

  // Update commutes when exactly one listing selected
  const single = useMemo(() => listings.find((l) => selectedIds.length === 1 && l.id === selectedIds[0]), [selectedIds, listings]);

  useEffect(() => {
    if (single) void computeCommute(single);
  }, [single]);

  // Fetch overlay metadata
  useEffect(() => {
    async function loadMeta() {
      try {
        const res = await fetch('/api/overlays');
        const json = await res.json();
        setOverlayMeta(json.overlays || []);
      } catch {
        setOverlayMeta([
          { id: 'fema-nfhl', name: 'FEMA NFHL Flood (WMS)' },
          { id: 'oak-wilt', name: 'Oak Wilt (sample)', docs: 'https://www.austintexas.gov/page/oak-wilt' },
          { id: 'code-cases', name: 'Code Cases (sample)', docs: 'https://data.austintexas.gov/' },
        ]);
      }
    }
    loadMeta();
  }, []);

  // Persist selections and overlay toggles
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedSel = window.localStorage.getItem('nbs:selectedIds');
    const storedOver = window.localStorage.getItem('nbs:overlays');
    const storedFema = window.localStorage.getItem('nbs:femaOpacity');
    const routeVis = window.localStorage.getItem('nbs:showRoute');
    const storedStart = window.localStorage.getItem('nbs:startCoord');
    if (storedSel) setSelectedIds(JSON.parse(storedSel));
    if (storedOver) setOverlays(JSON.parse(storedOver));
    if (storedFema) setFemaOpacity(parseFloat(storedFema));
    if (routeVis) setShowRoute(routeVis === 'true');
    if (storedStart) setStartCoord(JSON.parse(storedStart));
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('nbs:selectedIds', JSON.stringify(selectedIds));
  }, [selectedIds, startCoord]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('nbs:overlays', JSON.stringify(overlays));
  }, [overlays]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('nbs:showRoute', showRoute ? 'true' : 'false');
  }, [showRoute]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('nbs:femaOpacity', String(femaOpacity));
  }, [femaOpacity]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (startCoord) window.localStorage.setItem('nbs:startCoord', JSON.stringify(startCoord));
    else window.localStorage.removeItem('nbs:startCoord');
  }, [startCoord]);

  // Tour preview: fetch route geometry + total drive
  useEffect(() => {
    async function preview() {
      try {
        if (selectedIds.length < 2) {
          setRouteGeoJSON(null);
          setTotalDrive(null);
          setOsrmStatus('idle');
          return;
        }
        const res = await fetch('/api/tour', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds, startCoord }),
        });
        const json = await res.json();
        if (res.ok) {
          setRouteGeoJSON(json.route || null);
          setTotalDrive(json.totalDriveMinutes || null);
          setOrderIds(json.order || null);
          setTotalDistanceKm(json.totalDistanceKm || null);
          setOsrmStatus('ok');
        } else {
          setRouteGeoJSON(null);
          setTotalDrive(null);
          setOrderIds(null);
          setTotalDistanceKm(null);
          setOsrmStatus('error');
        }
      } catch {
        setRouteGeoJSON(null);
        setTotalDrive(null);
        setOrderIds(null);
        setTotalDistanceKm(null);
        setOsrmStatus('error');
      }
    }
    preview();
  }, [selectedIds, startCoord]);

  return (
    <div className="space-y-4">
      <Section
        title="Map & Overlays"
        subtitle="Explore context and pick 4–6 homes for a smart tour. Toggle FEMA flood (WMS), Oak Wilt and Code Cases samples. Single-selection shows commute chips."
      >
        <ul className="list-disc pl-5 text-sm text-gray-200">
          <li>Basemap uses OSM raster tiles via MapLibre (demo use; attribution visible)</li>
          <li>FEMA NFHL WMS draws raster overlays; opacity set in code</li>
          <li>Tour preview shows a route polyline and total drive time</li>
        </ul>
      </Section>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <MapClient
            listings={listings}
            selectedIds={selectedIds}
            showFema={overlays['fema-nfhl']}
            showOakWilt={overlays['oak-wilt']}
            showCodeCases={overlays['code-cases']}
            routeGeoJSON={routeGeoJSON}
            showRoute={showRoute}
            routeOrderIds={orderIds || undefined}
            femaOpacity={femaOpacity}
            onSelect={toggle}
          />
        </div>
        <div className="space-y-3">
          <div className="card">
            <div className="mb-2 font-medium">Overlays</div>
            <div className="space-y-2 text-sm">
              {overlayMeta.map((o) => (
                <label key={o.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    aria-label={`Toggle ${o.name}`}
                    checked={!!overlays[o.id]}
                    onChange={(e) => setOverlays((prev) => ({ ...prev, [o.id]: e.target.checked }))}
                  />
                  <span className="flex items-center gap-2">
                    {o.name}
                    {o.docs && (
                      <a className="text-brand underline" href={o.docs} target="_blank" rel="noreferrer">Learn more</a>
                    )}
                  </span>
                </label>
              ))}
              {overlays['fema-nfhl'] && (
                <div className="ml-6 flex items-center gap-2">
                  <span>Opacity</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(femaOpacity * 100)}
                    onChange={(e) => setFemaOpacity(Number(e.target.value) / 100)}
                  />
                  <span>{Math.round(femaOpacity * 100)}%</span>
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="mb-2 font-medium">Data notes</div>
            <ul className="list-disc pl-5 text-sm text-gray-200">
              <li>FEMA NFHL is a live WMS raster overlay. Visual contrast can vary; adjust opacity as needed.</li>
              <li>Oak Wilt and Code Cases here are sample GeoJSONs; see the linked Austin sources for live data.</li>
              <li>OSM tiles are for demo use. For production traffic, swap to a paid tiles provider.</li>
            </ul>
          </div>
          <div className="card">
            <div className="mb-2 font-medium">Listings</div>
            <div className="max-h-[40vh] space-y-2 overflow-auto pr-2">
              {listings.map((l) => (
                <label key={l.id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    aria-label={`Select ${l.address}`}
                    checked={selectedIds.includes(l.id)}
                    onChange={() => toggle(l.id)}
                  />
                  <span className="space-y-1">
                    <div className="font-medium">{l.address}</div>
                    <div className="text-gray-300">{l.beds} bd · {l.baths} ba</div>
                    <Price value={l.price} />
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-300">Select 4–6 homes</div>
              <Link href={{ pathname: '/tour', query: selectedIds.length ? { ids: selectedIds.join(',') } : {} }} className="btn">Build Tour</Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <button className="btn" onClick={() => setSelectedIds(listings.slice(0, 4).map((l) => l.id))}>Select 4 recommended</button>
              <button className="btn bg-white/10 hover:bg-white/20" onClick={() => setSelectedIds([])}>Clear selection</button>
              <button
                className="btn bg-white/10 hover:bg-white/20"
                onClick={() => {
                  const count = Math.floor(Math.random() * 3) + 4; // 4-6
                  const shuffled = [...listings].sort(() => Math.random() - 0.5);
                  setSelectedIds(shuffled.slice(0, count).map((l) => l.id));
                }}
              >
                Surprise me
              </button>
            </div>
          </div>
          <div className="card">
            <div className="mb-2 font-medium">Tour Preview</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showRoute} onChange={(e) => setShowRoute(e.target.checked)} /> Show route polyline
            </label>
            {selectedIds.length < 2 ? (
              <div className="mt-2 text-sm text-gray-300">Pick at least two homes to preview a route.</div>
            ) : osrmStatus === 'error' ? (
              <div className="mt-2 text-sm text-red-300">
                Routing server is busy. Try again in a moment.
                <button className="ml-2 underline" onClick={() => setSelectedIds([...selectedIds])}>Try again</button>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-300">
                Total drive time: {totalDrive ? `${Math.round(totalDrive)} min` : '–'}
                {typeof totalDistanceKm === 'number' && <span> · Total distance: {(totalDistanceKm * 0.621371).toFixed(1)} mi</span>}
              </div>
            )}
            <div className="mt-3 space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={pickStart} onChange={(e) => setPickStart(e.target.checked)} /> Pick start on map
              </label>
              <div className="text-gray-300">
                Start: {startCoord ? `${startCoord.lat.toFixed(4)}, ${startCoord.lng.toFixed(4)}` : 'Downtown (default)'}
                <button className="ml-2 underline" onClick={() => setStartCoord(null)}>Use Downtown</button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="mb-2 font-medium">Legend</div>
            <ul className="list-disc pl-5 text-sm text-gray-200">
              <li>Numbered pins: tour order</li>
              <li>Blue line: route preview (OSRM)</li>
              <li>Badges on single selection: commute to Downtown, UT, Domain</li>
            </ul>
          </div>
          {single && (
            <div className="card">
              <div className="mb-2 font-medium">Commute (from selected)</div>
              <div className="flex flex-wrap gap-2 text-sm">
                {commutes.map((c) => (
                  <span key={c.label} className="badge">
                    {c.label}: {c.minutes ? `${c.minutes}m` : '–'}
                  </span>
                ))}
              </div>
              <button className="mt-2 btn" onClick={() => computeCommute(single)}>Refresh commute</button>
            </div>
          )}
          <div className="text-xs text-gray-400">
            Routing uses the public OSRM demo server. If it is throttled/unavailable, we gracefully fall back to approximate ETAs.
            Google Distance Matrix is not used here because Google prohibits using it with non-Google maps in their TOS.
          </div>
        </div>
      </div>
    </div>
  );
}
