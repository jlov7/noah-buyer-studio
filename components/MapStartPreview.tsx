"use client";
import { useEffect, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapStartPreview({ coord }: { coord: { lat: number; lng: number } | null }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
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
          layers: [{ id: 'osm-raster', type: 'raster', source: 'osm' }],
        },
        center: coord ? [coord.lng, coord.lat] : [-97.7431, 30.2672],
        zoom: coord ? 13 : 11,
      });
      mapRef.current = map;
      if (coord) {
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center w-7 h-7 rounded-full bg-yellow-400 text-black text-xs font-bold border border-black shadow';
        el.textContent = 'S';
        new mod.Marker({ element: el }).setLngLat([coord.lng, coord.lat]).addTo(map);
      }
    })();
    return () => {
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = null;
    };
  }, [coord]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !coord) return;
    map.flyTo({ center: [coord.lng, coord.lat], zoom: 13, duration: 500 });
  }, [coord]);

  return <div ref={ref} className="h-48 w-full rounded-md border border-white/10" />;
}
