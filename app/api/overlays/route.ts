import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    overlays: [
      {
        id: 'fema-nfhl',
        name: 'FEMA NFHL Flood (WMS)',
        type: 'wms',
        source: 'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/WMSServer',
      },
      {
        id: 'oak-wilt',
        name: 'Oak Wilt (sample GeoJSON)',
        type: 'geojson',
        source: '/data/oak_wilt.geojson',
        docs: 'https://www.austintexas.gov/page/oak-wilt',
      },
      {
        id: 'code-cases',
        name: 'Code Cases (sample GeoJSON)',
        type: 'geojson',
        source: '/data/code_cases.geojson',
        docs: 'https://data.austintexas.gov/',
      },
    ],
  });
}

