# Agents Guide

Commands
- Install: `npm ci`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Test: `npm test`

Verification
- Run: `npm run lint && npm run typecheck && npm test`

Notes
- LLM calls use the GitHub Models REST endpoint and the Codespace `GITHUB_TOKEN` server‑side only. Do not expose the token to the browser.
- Routing uses OSRM (no key). Keep matrices ≤ 10 points; there’s backoff and a haversine fallback.
- MapLibre uses OSM raster tiles — demo use only; attribution visible. Respect OSM Tile Usage Policy.

