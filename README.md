# FleetClose

Turn the telematics mid-market fleets already pay for into closed work and a 2026 proof file.

This is a **real Next.js server** (not a static export): SQLite, API routes, persisted work orders, and FMCSA open-data ingest.

## Run

```bash
npm install
npm test
npm run dev
```

- http://localhost:3000/ — marketing
- http://localhost:3000/dashboard — Heartland demo (server + DB)
- http://localhost:3000/live — real USDOT ingest (then open that carrier in the ops console)
- http://localhost:3000/how — how the backend works
- http://localhost:3000/api/health — server + SQLite check
- `public/sample-alerts.csv` — drop this on the dashboard if you do not have a fleet export yet

`npm run build && npm start` is the production Node server. Host on Vercel or any Node host. GitHub Pages cannot run this.

## What is real today

| Piece | Status |
| --- | --- |
| Next.js API + SQLite | Yes |
| Agent run / approve / reset persisted | Yes |
| FMCSA census + roadside violations | Yes (public USDOT) |
| Telematics CSV ingest | Yes |
| Work orders marked complete | Yes |
| Multi-carrier ops console | Yes |
| Pilot leads stored | Yes |
| Samsara / Motive / Geotab live feed | No — needs the fleet’s token |
| Twilio SMS | Outbox in DB only |

## Out of scope until a paying fleet

Real telematics OAuth, predictive ML, routing, mobile apps, replacing a CMMS.
