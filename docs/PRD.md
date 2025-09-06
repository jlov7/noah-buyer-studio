# Noah Buyer Studio — PRD

## Goals
- 3‑minute Buyer Intake → Buyer Brief (structured JSON → pretty UI)
- Austin map with overlays (FEMA NFHL WMS, Oak Wilt, Code Cases) + commute hints
- Smart Tour builder: pick demo listings → realistic order/ETAs via OSRM → export ICS

## Users
- Noah (Austin Realtor) sharing a Codespaces public URL with buyers.

## Flows
1) Intake on `/` → Generate Brief via GitHub Models → render summary, priorities, next steps
2) Explore `/map` → Toggle overlays → Select 4–6 listings
3) Build `/tour` → OSRM table → nearest‑neighbor ordering → show ETAs → Download `.ics`

## Non‑Goals
- No MLS feed, no auth, no saving to DB.
- No paid providers or API keys.

## Acceptance Criteria
- Runs in GitHub Codespaces, no external keys.
- PWA: manifest + basic service worker + iOS A2HS tip.
- OSRM fallback if throttled.
- Brief uses JSON schema with validation via Zod.
- CI runs lint, typecheck, and tests.

