# FleetClose

Turn telematics and maintenance alerts into closed work — so mid-market fleets keep trucks running and ops teams stop chasing dashboards.

## Working product

| Page | What it does |
| --- | --- |
| `/` | Marketing: problem, who it’s for, pricing |
| `/dashboard/` | Live ops demo: 24 trucks, Run agent, work orders, escalation, ROI |
| `/pilot/` | Paid pilot request ($3,500 / 30 days / 100 trucks) |

Every button on those pages goes somewhere real. Logo → home. **Live demo** → dashboard. **Book pilot** → intake form that opens a prefilled email.

## Run locally

```bash
npm install
npm run dev
```

Then open:

- http://localhost:3000/
- http://localhost:3000/dashboard/
- http://localhost:3000/pilot/

`npm run build` writes a static site to `out/`. `npm start` serves that folder on port 3000.

## Live site

After this repo’s GitHub Pages workflow runs on `main`:

**https://yashwanth123.github.io/FleetClose/**

Or [deploy on Vercel](https://vercel.com/new/clone?repository-url=https://github.com/yashwanth123/FleetClose) — no extra config.

## 5-minute demo

1. Open `/dashboard/`.
2. Show alerts sitting for hours.
3. Hit **Run agent**.
4. Routine alerts become work orders + notifications.
5. Approve/reject the red safety queue.
6. Point at auto-resolve %, time-to-action, and estimated savings.
7. Send them to `/pilot/` for the $3,500 offer.

## Out of scope (on purpose)

- Real Samsara / Geotab OAuth (the feed is mocked)
- Predictive failure ML
- Routing / load optimization
- Mobile apps
- Replacing a full CMMS
