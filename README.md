# FleetClose

Turn telematics and maintenance alerts into closed work — so mid-market fleets keep trucks running and ops teams stop chasing dashboards.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the marketing page and [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the live ops demo.

## What this MVP is

A 5-minute pilot demo for fleet / ops / maintenance managers at regional carriers (~50–500 trucks).

1. **Marketing (`/`)** — problem, who it’s for, $3,500 / 30-day pilot (up to 100 trucks), then ~$12 per truck / month.
2. **Ops demo (`/dashboard`)** — Heartland Freight, 24 simulated trucks, 20 open alerts.
3. **Agent (rules)** — routine alerts auto-create a work order + notifications; critical/safety alerts escalate with a recommended plan, reason, and confidence.
4. **ROI strip** — auto-resolve %, time-to-action, estimated savings.

Hit **Run agent**, then approve or reject the unsafe cases in the escalation queue.

## Out of scope (on purpose)

- Real Samsara / Geotab OAuth (the feed is mocked)
- Predictive failure ML
- Routing / load optimization
- Mobile apps
- Replacing a full CMMS

## Stack

Next.js, TypeScript, Tailwind. Agent logic lives in `lib/agent.ts` and is also exposed at `POST /api/agent/run` and `POST /api/agent/resolve`.
