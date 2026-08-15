import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

const steps = [
  {
    n: "01",
    title: "Alert arrives",
    body: "Telematics, ELD, and shop notes already fire. We ingest the feed — mocked from Samsara/Geotab in this MVP — and stop the copy-paste into Slack and spreadsheets.",
  },
  {
    n: "02",
    title: "Agent decides",
    body: "Rules first: routine work auto-closes with a reason, confidence, and audit trail. Critical and safety cases never auto-close.",
  },
  {
    n: "03",
    title: "Work gets created",
    body: "A work order is opened, the shop and driver are notified, and the truck is scheduled before the next load is missed.",
  },
  {
    n: "04",
    title: "Humans only for risk",
    body: "Brake faults, overheats, air leaks, HOS, collisions — those land in an escalation queue with a recommended plan. Approve or reject in one click.",
  },
];

const buyers = [
  { title: "Who buys", body: "Fleet, ops, and maintenance managers who own uptime — not a CIO program." },
  { title: "Company size", body: "About 50–500 trucks. Regional trucking, delivery, cold-chain, construction." },
  { title: "Not day one", body: "Amazon/UPS-scale control towers, full CMMS replacement, or predictive-failure science projects." },
];

const out = [
  "Real Samsara / Geotab OAuth (mock first)",
  "Predictive failure ML",
  "Routing or load optimization",
  "Driver mobile apps",
  "Replacing your full CMMS",
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <section className="relative overflow-hidden bg-navy text-paper">
        <div className="grid-fade pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1.2fr_0.8fr] md:py-28">
          <div>
            <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber-2">For mid-market trucking</p>
            <h1 className="display mt-5 max-w-3xl text-4xl leading-[1.05] md:text-6xl">
              Alerts don&apos;t move trucks. Closed work does.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/75">
              FleetClose turns telematics and maintenance alerts into work orders, notifications, and a paper trail —
              so 50–500 truck fleets keep running and ops teams stop chasing dashboards.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/"
                className="rounded-full bg-amber px-5 py-3 text-sm font-semibold text-navy hover:bg-amber-2"
              >
                Run the 5-minute demo
              </Link>
              <Link
                href="/pilot/"
                className="rounded-full border border-paper/20 px-5 py-3 text-sm text-paper hover:bg-paper/5"
              >
                Book the $3,500 pilot
              </Link>
            </div>
            <p className="mt-6 text-sm text-paper/50">Then ~$12 per truck / month. No enterprise rollout required.</p>
          </div>

          <aside className="rounded-2xl border border-paper/10 bg-navy-2/80 p-6 shadow-2xl">
            <p className="mono text-[11px] uppercase tracking-[0.18em] text-paper/45">What sitting alerts cost</p>
            <dl className="mt-5 space-y-4">
              <div className="flex items-end justify-between border-b border-paper/10 pb-3">
                <dt className="text-sm text-paper/65">Typical time-to-action today</dt>
                <dd className="display text-3xl">4–8 hrs</dd>
              </div>
              <div className="flex items-end justify-between border-b border-paper/10 pb-3">
                <dt className="text-sm text-paper/65">After FleetClose agent</dt>
                <dd className="display text-3xl text-amber-2">~3 min</dd>
              </div>
              <div className="flex items-end justify-between">
                <dt className="text-sm text-paper/65">Pilot target</dt>
                <dd className="display text-3xl">100 trucks</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-paper/55">
              Humans still own the unsafe cases. Everything else becomes a work order before the next dispatcher
              refresh.
            </p>
          </aside>
        </div>
      </section>

      <section id="problem" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-20">
        <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber">The gap</p>
        <h2 className="display mt-3 max-w-3xl text-3xl md:text-5xl">
          Trucks already send alerts. Action happens hours later.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { title: "Alerts sit", body: "Samsara, Geotab, ELD, and shop notes pile up. Nobody owns the next step." },
            { title: "Humans copy", body: "Someone pastes into a ticket, Slack, or a spreadsheet — if they see it at all." },
            { title: "Loads slip", body: "Downtime, missed appointments, and overtime show up before the next work order does." },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-[var(--line)] bg-paper-2 p-6">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="scroll-mt-24 bg-navy text-paper">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber-2">How FleetClose works</p>
          <h2 className="display mt-3 max-w-3xl text-3xl md:text-5xl">Alert → decide → work order → prove it.</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {steps.map((step) => (
              <article key={step.n} className="border-t border-paper/15 pt-5">
                <p className="mono text-amber-2">{step.n}</p>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">{step.body}</p>
              </article>
            ))}
          </div>
          <Link
            href="/dashboard/"
            className="mt-10 inline-flex rounded-full bg-amber px-5 py-3 text-sm font-semibold text-navy hover:bg-amber-2"
          >
            See the agent close work
          </Link>
        </div>
      </section>

      <section id="who" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-20">
        <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber">Who it&apos;s for</p>
        <h2 className="display mt-3 text-3xl md:text-5xl">Built for the manager who gets the 2 a.m. call.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {buyers.map((item) => (
            <article key={item.title} className="rounded-2xl bg-navy p-6 text-paper">
              <h3 className="text-amber-2">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/75">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pilot" className="scroll-mt-24 border-y border-[var(--line)] bg-paper-2">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2">
          <div>
            <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber">Pilot offer</p>
            <h2 className="display mt-3 text-3xl md:text-5xl">$3,500 for 30 days. Up to 100 trucks.</h2>
            <p className="mt-5 max-w-lg text-ink/70">
              We plug into the alerts you already have (mocked in this demo, live connectors next). You get closed work,
              an escalation queue for unsafe cases, and ROI numbers you can take to the owner.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink/80">
              <li>— Work orders + notify on routine alerts</li>
              <li>— Human queue for critical / safety only</li>
              <li>— Auto-resolve %, time-to-action, estimated savings</li>
              <li>— Audit trail on every decision</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-navy p-8 text-paper">
            <p className="text-sm text-paper/60">After the pilot</p>
            <p className="display mt-2 text-5xl">~$12</p>
            <p className="mt-1 text-paper/70">per truck / month</p>
            <p className="mt-6 text-sm leading-relaxed text-paper/60">
              Example: 180 trucks ≈ $2,160 / month — less than one missed reefer load or a single after-hours breakdown
              on I-80.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/pilot/"
                className="inline-flex rounded-full bg-amber px-5 py-3 text-sm font-semibold text-navy hover:bg-amber-2"
              >
                Request the pilot
              </Link>
              <Link
                href="/dashboard/"
                className="inline-flex rounded-full border border-paper/20 px-5 py-3 text-sm text-paper"
              >
                Watch the demo first
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber">Explicitly out of MVP</p>
            <h2 className="display mt-3 text-3xl">We don&apos;t pretend to be your whole stack.</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              FleetClose sits on top of the systems you already pay for. The job is the gap between alert and action.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {out.map((item) => (
              <li key={item} className="rounded-xl border border-[var(--line)] bg-paper-2 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-navy text-paper">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <h2 className="display text-3xl md:text-5xl">Demo it in five minutes. Sell a paid pilot.</h2>
          <p className="mx-auto mt-4 max-w-xl text-paper/70">
            Open the live ops console, hit Run agent, approve the unsafe cases, and show the ROI strip.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/"
              className="inline-flex rounded-full bg-amber px-6 py-3 text-sm font-semibold text-navy hover:bg-amber-2"
            >
              Open Heartland Freight demo
            </Link>
            <Link
              href="/pilot/"
              className="inline-flex rounded-full border border-paper/20 px-6 py-3 text-sm text-paper"
            >
              Book a 30-day pilot
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
