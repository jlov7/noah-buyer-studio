"use client";
import { useEffect, useMemo, useState } from 'react';
import listingsData from '@/data/listings.json';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Section from '@/components/ui/Section';
import HelpTip from '@/components/ui/HelpTip';
import MapStartPreview from '@/components/MapStartPreview';
import BrandMark from '@/components/BrandMark';

type Listing = typeof listingsData[number];

type TourResponse = {
  order: string[];
  schedule: Array<{
    id: string;
    address: string;
    eta: string; // ISO
    etd: string; // ISO
    travelMinutes: number;
    visitMinutes: number;
  }>;
  ics: string;
  legDistancesKm?: number[];
  totalDistanceKm?: number;
};

export default function TourPage({ searchParams }: { searchParams: { ids?: string } }) {
  const listings = useMemo(() => listingsData as Listing[], []);
  const selected = useMemo(() => {
    let ids = (searchParams?.ids || '').split(',').filter(Boolean);
    if (!ids.length && typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('nbs:selectedIds');
        if (stored) ids = JSON.parse(stored);
      } catch {}
    }
    return listings.filter((l) => ids.includes(l.id)).slice(0, 6);
  }, [searchParams?.ids, listings]);

  const [resp, setResp] = useState<TourResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailLink, setEmailLink] = useState<string>('');

  const defaultStart = useMemo(() => {
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
    return now.toISOString();
  }, []);
  const [startTime, setStartTime] = useState<string>(defaultStart);
  const [dwellMinutes, setDwellMinutes] = useState<number>(20);
  const [bufferMinutes, setBufferMinutes] = useState<number>(5);
  const [startMode, setStartMode] = useState<'first' | 'downtown' | 'custom' | 'current' | 'map'>('downtown');
  const [startLat, setStartLat] = useState<number>(30.2672);
  const [startLng, setStartLng] = useState<number>(-97.7431);
  const [geoStatus, setGeoStatus] = useState<string>('');
  const [mapStart, setMapStart] = useState<{ lat: number; lng: number } | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [manualOrderIds, setManualOrderIds] = useState<string[] | null>(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [buyerName, setBuyerName] = useState<string>('');

  async function buildTour() {
    setError(null);
    setResp(null);
    setLoading(true);
    try {
      let startCoord = startMode === 'first' ? null : { lat: startLat, lng: startLng };
      if (startMode === 'map' && mapStart) startCoord = mapStart;
      const res = await fetch('/api/tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected.map((l) => l.id), startTime, dwellMinutes, bufferMinutes, startCoord, notes, orderIds: reorderMode && manualOrderIds?.length === selected.length ? manualOrderIds : undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to build tour');
      setResp(json);
      setManualOrderIds(json.order);
      try {
        const lines: string[] = [];
        lines.push(`Tour plan`);
        lines.push(`Start: ${new Date(startTime).toLocaleString()}`);
        lines.push('');
        json.schedule.forEach((s: any, i: number) => {
          const eta = new Date(s.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const etd = new Date(s.etd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          lines.push(`${i + 1}. ${s.address}`);
          lines.push(`   ETA ${eta} · ETD ${etd} · Visit ${s.visitMinutes}m · Travel ${Math.round(s.travelMinutes)}m`);
          const note = (notes as any)[s.id];
          if (note) lines.push(`   Notes: ${note}`);
        });
        const subject = encodeURIComponent('Austin Tour Plan (Demo)');
        const body = encodeURIComponent(lines.join('\n'));
        setEmailLink(`mailto:?subject=${subject}&body=${body}`);
      } catch {
        setEmailLink('');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selected.length) buildTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedStart = window.localStorage.getItem('nbs:startCoord');
    if (storedStart) setMapStart(JSON.parse(storedStart));
    const name = window.localStorage.getItem('nbs:intakeName');
    if (name) setBuyerName(name);
  }, []);

  function downloadIcs() {
    if (!resp) return;
    const blob = new Blob([resp.ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'noah-tour.ics';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Section
        title="Smart Tour — Order & ETAs"
        subtitle="We compute drive-time order with OSRM (no key) and add your dwell/buffer to produce realistic ETAs. Export the tour as an ICS file."
      >
        <ul className="list-disc pl-5 text-sm text-gray-200">
          <li>Nearest‑neighbor over OSRM matrix for fast, reasonable ordering</li>
          <li>Download ICS and share with buyers; times are UTC in the file, displayed in your calendar’s timezone</li>
          <li>OSRM can throttle; we fall back to distance-based estimates and continue</li>
        </ul>
      </Section>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-2 font-medium">Start Location Preview</div>
          <MapStartPreview
            coord={
              startMode === 'map' && mapStart
                ? mapStart
                : startMode === 'downtown'
                ? { lat: 30.2672, lng: -97.7431 }
                : startMode === 'first' && selected[0]
                ? { lat: selected[0].lat, lng: selected[0].lng }
                : { lat: startLat, lng: startLng }
            }
          />
          <div className="mt-2 text-xs text-gray-300">Marker S shows where the tour starts.</div>
        </Card>
        <Card>
          <div className="mb-2 font-medium">Reorder Stops</div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={reorderMode} onChange={(e) => setReorderMode(e.target.checked)} /> Enable drag to reorder
          </label>
          {resp && (
            <ul className="mt-2 space-y-2 text-sm">
              {(manualOrderIds || resp.order).map((id, idx) => {
                const l = selected.find((x) => x.id === id);
                if (!l) return null;
                return (
                  <li
                    key={id}
                    draggable={reorderMode}
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedId = e.dataTransfer.getData('text/plain');
                      const current = (manualOrderIds || resp.order).slice();
                      const from = current.indexOf(draggedId);
                      const to = current.indexOf(id);
                      if (from === -1 || to === -1) return;
                      current.splice(to, 0, current.splice(from, 1)[0]);
                      setManualOrderIds(current);
                    }}
                    className={[
                      'flex items-center justify-between rounded-md border border-white/10 bg-white/5 p-2',
                      reorderMode ? 'cursor-move' : 'cursor-default',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2">
                      <span className="badge">{idx + 1}</span>
                      <span className="font-medium">{l.address}</span>
                    </div>
                    {reorderMode && <span className="text-xs text-gray-300">Drag to reorder</span>}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-3 text-right">
            <Button onClick={buildTour} disabled={!selected.length || loading}>
              {loading ? 'Rebuilding…' : 'Recompute ETAs'}
            </Button>
          </div>
          <div className="mt-1 text-xs text-gray-400">After reordering, click Recompute to update times.</div>
        </Card>
      </div>
      {!selected.length && (
        <Card>
          <div className="mb-1 text-lg font-semibold">No homes selected yet</div>
          <div className="text-sm text-gray-300">Pick 4–6 homes on the Map page to build a tour. Your selections are saved automatically.</div>
          <a className="mt-3 inline-flex btn" href="/map">Go to Map</a>
        </Card>
      )}
      <Card className="printable">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-gray-300">Tour Plan</div>
          <BrandMark />
        </div>
        <div className="mb-2 text-lg font-semibold">Smart Tour</div>
        <div className="text-sm text-gray-300">{selected.length} homes selected</div>
        {buyerName && <div className="mt-1 inline-flex items-center gap-2 text-xs"><span className="badge">Buyer</span><span className="opacity-90">{buyerName}</span></div>}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <label className="space-x-2">
            <span>Start:</span>
            <input
              className="input"
              type="datetime-local"
              value={startTime.slice(0, 16)}
              onChange={(e) => setStartTime(new Date(e.target.value).toISOString())}
            />
          </label>
          <label className="flex items-center gap-2">
            <span>Dwell (min)</span>
            <input className="input w-24" type="number" min={5} max={120} value={dwellMinutes} onChange={(e) => setDwellMinutes(Number(e.target.value))} />
            <HelpTip title="Dwell time">
              Time spent at each property (walk-through, questions, etc.).
              This adds to the ETA/ETD for each stop.
            </HelpTip>
          </label>
          <label className="flex items-center gap-2">
            <span>Buffer (min)</span>
            <input className="input w-24" type="number" min={0} max={30} value={bufferMinutes} onChange={(e) => setBufferMinutes(Number(e.target.value))} />
            <HelpTip title="Buffer">
              Extra time added before each stop for parking, getting in/out of the car, or unexpected delays. Helps keep the schedule realistic.
            </HelpTip>
          </label>
          <div className="w-full" />
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm">Start from:</span>
            <label className="flex items-center gap-1"><input type="radio" name="start" checked={startMode==='downtown'} onChange={() => { setStartMode('downtown'); setStartLat(30.2672); setStartLng(-97.7431); }} /> Downtown</label>
            <label className="flex items-center gap-1"><input type="radio" name="start" checked={startMode==='first'} onChange={() => setStartMode('first')} /> First listing</label>
            {mapStart && (
              <label className="flex items-center gap-1"><input type="radio" name="start" checked={startMode==='map'} onChange={() => { setStartMode('map'); setStartLat(mapStart.lat); setStartLng(mapStart.lng); }} /> Map start</label>
            )}
            <label className="flex items-center gap-1"><input type="radio" name="start" checked={startMode==='current'} onChange={() => setStartMode('current')} /> Current location</label>
            <label className="flex items-center gap-1"><input type="radio" name="start" checked={startMode==='custom'} onChange={() => setStartMode('custom')} /> Custom</label>
            {startMode === 'custom' && (
              <>
                <input className="input w-36" placeholder="Lat" type="number" step="0.0001" value={startLat} onChange={(e) => setStartLat(Number(e.target.value))} />
                <input className="input w-36" placeholder="Lng" type="number" step="0.0001" value={startLng} onChange={(e) => setStartLng(Number(e.target.value))} />
              </>
            )}
            {startMode === 'current' && (
              <>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setGeoStatus('Locating…');
                    if (!('geolocation' in navigator)) {
                      setGeoStatus('Geolocation not available');
                      return;
                    }
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setStartLat(pos.coords.latitude);
                        setStartLng(pos.coords.longitude);
                        setGeoStatus('Location set');
                      },
                      (err) => {
                        setGeoStatus(err.message || 'Could not get location');
                      },
                      { enableHighAccuracy: true, timeout: 8000 }
                    );
                  }}
                >
                  Use current location
                </button>
                {geoStatus && <span className="text-xs text-gray-300">{geoStatus}</span>}
              </>
            )}
            <HelpTip title="Start location">
              Choose where your tour begins. If you pick Current location, we’ll use your device geolocation; otherwise Downtown or your first listing works for most buyers.
            </HelpTip>
          </div>
          <Button onClick={buildTour} disabled={!selected.length || loading}>
            {loading ? 'Building…' : 'Rebuild'}
          </Button>
          {resp && (
            <Button onClick={downloadIcs} variant="secondary">
              Download .ics
            </Button>
          )}
          {resp && (
            <Button
              variant="secondary"
              onClick={() => navigator.clipboard?.writeText(resp.ics)}
            >
              Copy .ics
            </Button>
          )}
          {resp && (
            <Button
              variant="secondary"
              onClick={() => typeof window !== 'undefined' && window.print()}
            >
              Print Tour Plan
            </Button>
          )}
        </div>
        {error && <div className="mt-2 text-sm text-red-300">{error}</div>}
      </Card>

      {resp && (
        <Card>
          {resp.legDistancesKm && resp.legDistancesKm.length > 0 && (
            <div className="mb-3 text-sm text-gray-200">
              <div className="font-medium">Route Summary</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {resp.legDistancesKm.map((km: number, i: number) => (
                  <span key={i} className="badge">Leg {i + 1}: {typeof km === 'number' ? (km * 0.621371).toFixed(1) : '–'} mi</span>
                ))}
              </div>
            </div>
          )}
          <div className="mb-2 font-medium">Tour Order & ETAs</div>
          <div className="mb-3 text-sm text-gray-300">
            Total drive time approx: {resp?.schedule?.reduce((sum, s) => sum + (s.travelMinutes || 0), 0) | 0} min · Total distance: {typeof resp.totalDistanceKm === 'number' ? (resp.totalDistanceKm * 0.621371).toFixed(1) : '–'} mi · Stops: {resp.schedule.length}
          </div>
          <ol className="space-y-2 text-sm">
            {resp.schedule.map((s, idx) => {
              const toNextMin = idx < resp.schedule.length - 1 ? Math.round(resp.schedule[idx + 1].travelMinutes || 0) : null;
              let toNextMi: string | null = null;
              if (resp.legDistancesKm && resp.legDistancesKm.length) {
                // Map legs to to-next distances accounting for optional start leg
                const hasStartLeg = resp.legDistancesKm.length === resp.schedule.length;
                const legIndex = hasStartLeg ? idx + 1 : idx; // distance from this stop to next
                const km = idx < resp.schedule.length - 1 ? resp.legDistancesKm[legIndex] : undefined;
                toNextMi = typeof km === 'number' ? (km * 0.621371).toFixed(1) : null;
              }
              return (
                <li
                  key={s.id}
                  className="grid grid-cols-1 gap-2 md:grid-cols-[2rem_1fr]"
                  onKeyDown={(e) => {
                    if (!reorderMode) return;
                    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
                    e.preventDefault();
                    if (!resp) return;
                    const current = (manualOrderIds || resp.order).slice();
                    const id = s.id;
                    const from = current.indexOf(id);
                    const to = e.key === 'ArrowUp' ? Math.max(0, from - 1) : Math.min(current.length - 1, from + 1);
                    if (from === to) return;
                    current.splice(to, 0, current.splice(from, 1)[0]);
                    setManualOrderIds(current);
                  }}
                  tabIndex={reorderMode ? 0 : -1}
                  aria-label={reorderMode ? `Stop ${idx + 1}: ${s.address}. Use up/down arrows to reorder.` : undefined}
                >
                  <div className="text-gray-400">{idx + 1}.</div>
                  <div>
                    <div className="font-medium">{s.address}</div>
                    <div className="text-gray-300">
                      ETA {new Date(s.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·
                      Visit {s.visitMinutes}m · Travel {Math.round(s.travelMinutes)}m
                      {toNextMin !== null && (
                        <>
                          {' '}· To next: {toNextMin}m{toNextMi ? ` · ${toNextMi} mi` : ''}
                        </>
                      )}
                    </div>
                    <textarea
                      className="mt-2 input h-20"
                      placeholder="Notes for this stop (optional)"
                      value={notes[s.id] || ''}
                      onChange={(e) => setNotes((n) => ({ ...n, [s.id]: e.target.value }))}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {emailLink && (
              <a className="btn" href={emailLink}>Share via email</a>
            )}
            <Button
              variant="secondary"
              onClick={() => navigator.clipboard?.writeText(resp.ics)}
            >
              Copy .ics
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-400">Notes are included in the ICS after you click Rebuild.</div>
        </Card>
      )}

      <div className="text-xs text-gray-400">
        ETAs based on OSRM demo server; if unavailable, we approximate using distance heuristics. For school info, see TXSchools/TEA. MLS note: Before touring, many MLSs now require a written buyer agreement; broker compensation is not displayed in the MLS and is negotiated outside the MLS.
      </div>
    </div>
  );
}
