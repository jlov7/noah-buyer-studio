# Noah Buyer Studio (PWA)

A clean, mobile‑friendly PWA for Noah (Austin Realtor) to capture a 3‑minute buyer intake, explore Austin map overlays, and build a smart tour with realistic ETAs — all with zero external API keys. Shareable via a public GitHub Codespaces port.

## Why it matters
- Faster discovery: turn a quick intake into a concise Buyer Brief with priorities and next steps.
- Context at a glance: FEMA flood overlays + local oak wilt / code cases samples on a familiar Austin map.
- Realistic tours: pick 4–6 listings, compute a drive‑time order (OSRM) and export an ICS calendar to share.

## One‑minute setup (Codespaces)
- Open in GitHub Codespaces
- Install: `npm ci`
- Start: `npm run dev`
- In the Ports panel, set port `3000` to Public and copy the URL to share.

## How to use
1) Intake (/) — Fill the form (≈3 minutes) or click “Use sample”, then “Generate Brief”. The server calls GitHub Models with structured JSON (validated via Zod). The summary auto‑includes the TREC price disclosure when applicable. Links for TXSchools/TEA provided.
2) Map (/map) — Toggle overlays (FEMA WMS + sample GeoJSON) and select 4–6 homes. Select one home to see commute chips (Downtown, UT, Domain). Route preview shows a polyline with total drive time and distance. Optionally “Pick start on map” to place a draggable S pin; preview updates accordingly.
3) Tour (/tour) — Adjust dwell/buffer, choose start (Downtown, first listing, custom, current, or map start), add per‑stop notes, reorder stops (drag or arrow keys), then export the .ics calendar. Use “Share via email” to send a plain‑text plan.

## Walkthrough (2 min)
- Watch: https://www.loom.com/share/your-video-id-here
- Script: docs/WALKTHROUGH.md
- Optional GIFs (drop files here and update links):
  - Intake: docs/media/intake.gif
  - Map: docs/media/map.gif
  - Tour: docs/media/tour.gif

## Scripts
- Install: `npm ci`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Test: `npm test`

## Zero‑key design
- LLM: GitHub Models REST (`https://models.github.ai/inference/chat/completions`) using the Codespace `GITHUB_TOKEN` server‑side only. JSON schema responses validated with Zod. Free prototyping; quotas may apply. The token is never sent to the browser.
- Routing: OSRM demo server (Table + Route). Matrices ≤ 10 points with exponential backoff and a haversine fallback. In‑memory caching helps avoid throttling.
- Map: MapLibre GL JS + OpenStreetMap raster tiles. Demo only — respect OSM’s Tile Usage Policy; attribution is visible.

## Compliance and caveats
- TREC §535.17 disclosure appears under price content and is appended to brief summaries including pricing.
- School info uses neutral language and links to TXSchools/TEA (no subjective ratings).
- NAR/MLS note: Before touring, many MLSs now require a written buyer agreement; broker compensation is not displayed in the MLS and is negotiated outside the MLS.
- Google Distance Matrix/Places are not used with a non‑Google map due to Google’s terms of service.

## Architecture (high level)
- App Router + TS, Tailwind for styling
- LLM client: `lib/llm/githubModels.ts`
- Routing helpers: `lib/osrm.ts`, ordering heuristic: `lib/tour/order.ts`
- Calendar: `lib/ics.ts`
- Map overlays: `lib/maps/addFemaWms.ts`, `lib/maps/addAustinLayers.ts`

## CI
GitHub Actions run lint, typecheck, and tests on push/PR.

## Share it
Make port 3000 Public in Codespaces and share the URL. Buyers can use it on mobile and even add it to their home screen (PWA). In the app, click “Share this app” (copies the URL) or “How to share” for quick steps.
