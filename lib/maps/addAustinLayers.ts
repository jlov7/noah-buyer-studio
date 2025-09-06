// Loads two local GeoJSON overlays (Oak Wilt and Code Cases).
// For production, replace with official Austin ArcGIS services.
// TODO: Oak Wilt ArcGIS item: https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/
// TODO: Code Cases ArcGIS item: https://data.austintexas.gov/ or relevant ArcGIS item page
import type maplibregl from 'maplibre-gl';

export async function addAustinOverlays(map: maplibregl.Map) {
  await addGeoJson(map, 'oak-wilt', '/data/oak_wilt.geojson', '#f59f00');
  await addGeoJson(map, 'code-cases', '/data/code_cases.geojson', '#e03131');
}

async function addGeoJson(
  map: maplibregl.Map,
  id: string,
  url: string,
  color: string
) {
  const srcId = `${id}-src`;
  if (map.getSource(srcId)) return;
  const res = await fetch(url);
  const data = await res.json();
  map.addSource(srcId, {
    type: 'geojson',
    data,
  } as any);
  map.addLayer({
    id: `${id}-fill`,
    type: 'fill',
    source: srcId,
    paint: {
      'fill-color': color,
      'fill-opacity': 0.25,
    },
  });
  map.addLayer({
    id: `${id}-line`,
    type: 'line',
    source: srcId,
    paint: {
      'line-color': color,
      'line-width': 1.5,
    },
  });
}

