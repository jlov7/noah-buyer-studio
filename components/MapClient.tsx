"use client";
// MapLibre + OSM tiles for demo; please respect OSM Tile Usage Policy.
// Attribution is enabled by default. For heavier usage, swap to a paid tiles provider.
import React, { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { addFemaWms } from '@/lib/maps/addFemaWms';
import { addAustinOverlays } from '@/lib/maps/addAustinLayers';

type Listing = {
  id: string;
  address: string;
  lat: number;
  lng: number;
  beds: number;
  baths: number;
  price: number;
};

type Props = {
  listings: Listing[];
  onSelect?: (id: string) => void;
  selectedIds?: string[];
  showFema?: boolean;
  showOakWilt?: boolean;
  showCodeCases?: boolean;
  routeGeoJSON?: any | null;
  showRoute?: boolean;
  routeOrderIds?: string[] | null;
  femaOpacity?: number; // 0..1
  allowStartPick?: boolean;
  startCoord?: { lat: number; lng: number } | null;
  onStartChange?: (coord: { lat: number; lng: number } | null) => void;
};

export default function MapClient({ listings, selectedIds = [], showFema, showOakWilt, showCodeCases, routeGeoJSON, showRoute, routeOrderIds, femaOpacity = 0.65, allowStartPick, startCoord, onStartChange, onSelect }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const startMarkerRef = useRef<any | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    let cleanup: (() => void) | undefined;
    (async () => {
      const mod = await import('maplibre-gl');
      const map = new mod.Map({
        container: ref.current!,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [
            { id: 'osm-raster', type: 'raster', source: 'osm' },
          ],
        },
        center: [-97.7431, 30.2672],
        zoom: 10.5,
      });
      mapRef.current = map;
      map.addControl(new mod.AttributionControl({ compact: true }));
      map.addControl(new mod.NavigationControl({ showCompass: false }), 'top-right');
      map.on('load', async () => {
        if (showFema) addFemaWms(map);
        if (showOakWilt || showCodeCases) await addAustinOverlays(map);
      });
      cleanup = () => {
        map.remove();
        mapRef.current = null;
      };
    })();
    return () => cleanup?.();
  }, [showFema, showOakWilt, showCodeCases]);

  // Ensure overlays are added when toggles are turned on after initial load
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (showFema && !map.getSource('fema-nfhl-src')) addFemaWms(map);
    if ((showOakWilt || showCodeCases) && !map.getSource('oak-wilt-src')) {
      addAustinOverlays(map);
    }
  }, [showFema, showOakWilt, showCodeCases]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    (async () => {
      const mod = await import('maplibre-gl');
      markersRef.current.forEach((m) => m.remove());
      const newMarkers: any[] = [];
      for (const l of listings) {
        const orderIndex = routeOrderIds?.indexOf(l.id);
        const el = document.createElement('div');
        if (orderIndex !== undefined && orderIndex !== null && orderIndex >= 0) {
          el.className = 'flex items-center justify-center w-6 h-6 rounded-full bg-brand text-white text-[11px] font-semibold border border-white shadow ring-2 ring-white/30';
          el.textContent = String(orderIndex + 1);
          el.title = `${orderIndex + 1}. ${l.address}`;
        } else {
          el.className = 'rounded-full bg-brand w-3 h-3 border border-white shadow ring-2 ring-white/30';
        }
        const m = new mod.Marker({ element: el })
          .setLngLat([l.lng, l.lat])
          .setPopup(
            new mod.Popup({ offset: 12 }).setHTML(
              `<strong>${l.address}</strong><br/>${l.beds} bd · ${l.baths} ba`
            )
          )
          .addTo(map);
        el.addEventListener('click', () => onSelect?.(l.id));
        if (selectedIds.includes(l.id)) {
          el.classList.add('ring-4');
        }
        newMarkers.push(m);
      }
      markersRef.current = newMarkers;
      // Fit bounds to selected or all
      const sel = listings.filter((l) => selectedIds.includes(l.id));
      const pts = (sel.length ? sel : listings).map((l) => [l.lng, l.lat]);
      if (pts.length) {
        const b = new mod.LngLatBounds(pts[0] as [number, number], pts[0] as [number, number]);
        for (const p of pts) b.extend(p as [number, number]);
        map.fitBounds(b, { padding: 60, duration: 600 });
      }
    })();
  }, [listings, selectedIds, routeOrderIds, onSelect]);

  // Toggle overlay visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const fema = map.getLayer('fema-nfhl');
    if (fema) map.setLayoutProperty('fema-nfhl', 'visibility', showFema ? 'visible' : 'none');
    if (fema && typeof femaOpacity === 'number') {
      map.setPaintProperty('fema-nfhl', 'raster-opacity', femaOpacity);
    }
    const oakFill = map.getLayer('oak-wilt-fill');
    const oakLine = map.getLayer('oak-wilt-line');
    const codeFill = map.getLayer('code-cases-fill');
    const codeLine = map.getLayer('code-cases-line');
    if (oakFill) map.setLayoutProperty('oak-wilt-fill', 'visibility', showOakWilt ? 'visible' : 'none');
    if (oakLine) map.setLayoutProperty('oak-wilt-line', 'visibility', showOakWilt ? 'visible' : 'none');
    if (codeFill) map.setLayoutProperty('code-cases-fill', 'visibility', showCodeCases ? 'visible' : 'none');
    if (codeLine) map.setLayoutProperty('code-cases-line', 'visibility', showCodeCases ? 'visible' : 'none');
  }, [showFema, femaOpacity, showOakWilt, showCodeCases]);

  // Route layer (polyline)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layerId = 'tour-route';
    const srcId = 'tour-route-src';
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(srcId)) map.removeSource(srcId);
    if (showRoute && routeGeoJSON) {
      map.addSource(srcId, { type: 'geojson', data: { type: 'Feature', geometry: routeGeoJSON } });
      map.addLayer({
        id: layerId,
        type: 'line',
        source: srcId,
        paint: {
          'line-color': '#4dabf7',
          'line-width': 4,
          'line-opacity': 0.9,
        },
      });
    }
  }, [routeGeoJSON, showRoute, routeOrderIds]);

  // Start picker + marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let handler: any = null;
    (async () => {
      const mod = await import('maplibre-gl');
      // manage marker from prop
      function ensureMarker() {
        if (!startCoord) {
          if (startMarkerRef.current) {
            startMarkerRef.current.remove();
            startMarkerRef.current = null;
          }
          return;
        }
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center w-7 h-7 rounded-full bg-yellow-400 text-black text-xs font-bold border border-black shadow';
        el.textContent = 'S';
        if (startMarkerRef.current) startMarkerRef.current.remove();
        const m = new mod.Marker({ element: el, draggable: true }).setLngLat([startCoord.lng, startCoord.lat]).addTo(map);
        m.on('dragend', () => {
          const p = m.getLngLat();
          onStartChange?.({ lat: p.lat, lng: p.lng });
        });
        startMarkerRef.current = m;
      }
      ensureMarker();

      if (allowStartPick) {
        handler = (e: any) => {
          onStartChange?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        };
        map.on('click', handler);
      }
    })();
    return () => {
      if (handler && map) map.off('click', handler);
    };
  }, [allowStartPick, startCoord, onStartChange]);

  return <div ref={ref} className="h-[70vh] w-full rounded-xl border border-white/10" />;
}
