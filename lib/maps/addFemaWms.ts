// Adds FEMA NFHL WMS raster layer to MapLibre map.
// One helper keeps the WMS URL so swapping layers is trivial.
// Opacity default 0.65.
import type maplibregl from 'maplibre-gl';

export function addFemaWms(map: maplibregl.Map, id = 'fema-nfhl', opacity = 0.65) {
  const sourceId = `${id}-src`;
  if (map.getSource(sourceId)) return; // idempotent
  const wmsBase =
    'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/WMSServer';
  const params =
    'service=WMS&request=GetMap&layers=0&styles=&format=image/png&transparent=true&srs=EPSG:3857&bbox={bbox-epsg-3857}';
  const tiles = [`${wmsBase}?${params}`];
  map.addSource(sourceId, {
    type: 'raster',
    tiles,
    tileSize: 256,
    attribution: 'FEMA NFHL',
  } as any);
  map.addLayer({
    id,
    type: 'raster',
    source: sourceId,
    paint: { 'raster-opacity': opacity },
  });
}

