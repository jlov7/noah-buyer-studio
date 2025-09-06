# 2‑Minute Walkthrough (Script)

Use this as a script to record a quick Loom (or screen GIF) showing the end‑to‑end value for Noah.

## Setup
- Start: `npm ci && npm run dev`
- Share: In Codespaces, set port 3000 to Public
- Open: the forwarded URL (mobile width if possible)

## Script Outline (≈2 minutes)
1) Intro (10s)
   - “Welcome to Noah Buyer Studio — a mobile‑friendly PWA for fast buyer intake, Austin map overlays, and an auto‑optimized tour with realistic ETAs. No external API keys needed.”
2) Intake (25s)
   - Go to `/` → click “Use sample” → “Generate Brief”.
   - Call out: JSON‑schema LLM with GitHub Models; neutral school language; TREC disclosure included; Copy JSON; Save as PDF.
3) Map (40s)
   - Go to `/map` → briefly toggle FEMA, show opacity slider → toggle Oak Wilt/Code Cases.
   - Select 4–6 homes; show numbered pins + polyline; show total drive time + distance.
   - Single selection: commute chips (Downtown/UT/Domain). Click “Pick start on map”, place/drag the S pin.
4) Tour (35s)
   - Go to `/tour` → Start from (Map start), adjust dwell/buffer; edit a per‑stop note.
   - Enable “Reorder Stops”, drag to rearrange; “Recompute ETAs” to update schedule and ICS.
   - Download/Copy ICS, Share via email, Print Tour Plan.
5) Close (10s)
   - “That’s the demo. It’s zero‑key, shareable via a public Codespaces link, and ready for buyer conversations.”

## Tips
- Keep pace brisk; focus on outcomes and clarity.
- If OSRM throttles, the UI shows a retry; try again briefly.
- Make sure route and numbered pins are visible before moving to Tour.

## Add the Loom link to README
- Edit README in the Walkthrough section and replace the placeholder Loom URL.
- Optional: drop short GIFs into `docs/media/` and update image links in README.

