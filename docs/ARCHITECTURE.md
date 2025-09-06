# Architecture

## Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS
- MapLibre GL JS + OSM raster tiles (demo‑scale, respect OSM tile policy)
- Zod for runtime validation
- Vitest for unit tests
- ESLint/Prettier for linting/formatting

## Zero‑key Design
- LLM via GitHub Models REST API (`https://models.github.ai/inference/chat/completions`) using the Codespace `GITHUB_TOKEN` on the server only.
- Routing via public OSRM demo (`router.project-osrm.org`) for table and route. Matrices limited to ≤10 points, with backoff and fallback.
- Maps via MapLibre + OSM tiles. Overlays include FEMA NFHL WMS and local sample GeoJSONs for Oak Wilt and Code Cases.

## Modules
- `lib/llm/githubModels.ts`: small server‑side client wrapping GitHub Models with `response_format: json_schema` and Zod validation. Token never leaves the server.
- `lib/osrm.ts`: OSRM table/route helpers with simple backoff; haversine fallback.
- `lib/tour/order.ts`: nearest‑neighbor heuristic over a time matrix.
- `lib/ics.ts`: ICS generator for calendar export.
- `lib/maps/*`: FEMA WMS and sample Austin overlays.

## Swap‑outs (paid providers later)
- LLM: Replace model with `google/gemini-1.5-pro` or similar via GitHub Models when available; or swap to Vertex AI/OpenAI with a single client module change.
- Maps/tiles: Swap the OSM raster source for Mapbox/MapTiler with token; MapLibre works with multiple providers.
- Routing: Swap OSRM with Mapbox Directions/Matrix or other vendors by updating `lib/osrm.ts` only.

## Notes
- We avoid Google Distance Matrix/Places with a non‑Google basemap due to Google’s TOS restrictions on using their services with non‑Google maps.

