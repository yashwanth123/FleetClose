import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

const steps = [
  {
    n: "01",
    title: "Alerts already fire",
    body: "Samsara, Motive, Geotab, ELD, and the shop already ping. In 2026 the fleet paid for cameras. We do not replace that stack — we take the feed (mocked in this MVP) so nobody copy-pastes into Slack.",
  },
  {
    n: "02",
    title: "Agent decides",
    body: "Routine PM and policy events auto-close with a reason and a confidence score. Camera AI that is just coaching does not become a shop ticket. Brakes, air, overheat, HOS, and crashes escalate.",
  },
  {
    n: "03",
    title: "Work or coaching happens",
    body: "A work order and a text go out — or a coaching note hits the safety file. The truck either rolls, goes to the shop, or is marked out of service on purpose.",
  },
  {
    n: "04",
    title: "You can prove it",
    body: "Every close lands in a proof pack: who decided, why, and what was sent. That is the 2026 insurance / CSA / shipper question. Dashboards cannot answer it. A closed loop can.",
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <section className="relative overflow-hidden bg-navy text-paper">
        <div className="grid-fade pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1.2fr_0.8fr] md:py-28">
          <div>
            <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber-2">
              Mid-market trucking · 2026
            </p>
            <h1 className="display mt-5 max-w-3xl text-4xl leading-[1.05] md:text-6xl">
              You already bought the cameras. You still can&apos;t prove you closed the work.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/75">
              FleetClose turns Samsara / Motive / shop alerts into work orders, coaching, and a paper trail — so 50–500
              truck fleets keep rolling and can answer the insurer, not just stare at a dashboard.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/"
                className="rounded-full bg-amber px-5 py-3 text-sm font-semibold text-navy hover:bg-amber-2"
              >
                Run the 5-minute demo
              </Link>
              <Link
                href="/playbook/"
                className="rounded-full border border-paper/20 px-5 py-3 text-sm text-paper hover:bg-paper/5"
              >
                Sales playbook
              </Link>
            </div>
            <p className="mt-6 text-sm text-paper/50">
              Pilot $3,500 / 30 days / 100 trucks. Then ~$12 per truck / month.
            </p>
          </div>

          <aside className="rounded-2xl border border-paper/10 bg-navy-2/80 p-6 shadow-2xl">
            <p className="mono text-[11px] uppercase tracking-[0.18em] text-paper/45">The 2026 bind</p>
            <dl className="mt-5 space-y-4">
              <div className="flex items-end justify-between border-b border-paper/10 pb-3">
                <dt className="text-sm text-paper/65">What fleets already pay for</dt>
                <dd className="display text-2xl">Cameras + ELD</dd>
              </div>
              <div className="flex items-end justify-between border-b border-paper/10 pb-3">
                <dt className="text-sm text-paper/65">What still happens to alerts</dt>
                <dd className="display text-2xl">They sit</dd>
              </div>
              <div className="flex items-end justify-between">
                <dt className="text-sm text-paper/65">What renewal now asks</dt>
                <dd className="display text-2xl text-amber-2">“Show the close”</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-paper/55">
              Nuclear-verdict years made insurers picky. Camera AI made the feed louder. Headcount did not go up.
            </p>
          </aside>
        </div>
      </section>

      <section id="problem" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-20">
        <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber">The 2026 problem</p>
        <h2 className="display mt-3 max-w-3xl text-3xl md:text-5xl">
          Visibility was last year&apos;s purchase. Liability is this year&apos;s bill.
        </h2>
        <p className="mt-5 max-w-3xl text-ink/70">
          A 80-truck regional carrier in 2026 typically has inward/outward cams, ELD, TPMS, and a shop inbox. They do
          not have a second maintenance coordinator. Camera AI (phone, seatbelt, following distance) multiplied events.
          The shop still finds out from a driver text. The safety file is a shared drive. At renewal, the question is
          not “do you have Samsara?” It is “what did you do after the clip?”
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Alert flood",
              body: "Cams + ELD + fault codes land in one tired inbox. Routine oil and a following-distance event look the same until someone reads them.",
            },
            {
              title: "Copy-paste ops",
              body: "A human pastes into a CMMS, Slack, or a spreadsheet — hours later. Shop labor is scarce. The next load does not wait.",
            },
            {
              title: "No proof of action",
              body: "Insurers, CSA, and food shippers want a close: who decided, what was sent, did the truck stay in service. A green dashboard is not a file.",
            },
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
          <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber-2">What FleetClose does</p>
          <h2 className="display mt-3 max-w-3xl text-3xl md:text-5xl">Close the loop. Keep the stack you paid for.</h2>
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
            See Heartland Freight close an August 2026 day
          </Link>
        </div>
      </section>

      <section id="who" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-20">
        <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber">Who buys</p>
        <h2 className="display mt-3 text-3xl md:text-5xl">The manager who owns uptime and the renewal.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { title: "Buyer", body: "Fleet, ops, or maintenance manager at a regional carrier. Sometimes the owner who just opened the insurance invoice." },
            { title: "Fit", body: "About 50–500 trucks. Dry van, reefer, flatbed, construction, food. Already on Samsara, Motive, or Geotab." },
            { title: "Not day one", body: "Amazon/UPS control towers, replacing the CMMS, predictive-failure science, or routing the load." },
          ].map((item) => (
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
              Enough time to catch a real shop week and a safety event. You leave with closed work, a human queue for
              unsafe cases, and a proof pack you can forward to the owner or the agent.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink/80">
              <li>— Auto work orders on routine PM</li>
              <li>— Coaching close on camera/policy noise</li>
              <li>— Human queue for brakes, air, crash, HOS</li>
              <li>— ROI + proof pack for the 2026 renewal story</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-navy p-8 text-paper">
            <p className="text-sm text-paper/60">After the pilot</p>
            <p className="display mt-2 text-5xl">~$12</p>
            <p className="mt-1 text-paper/70">per truck / month</p>
            <p className="mt-6 text-sm leading-relaxed text-paper/60">
              180 trucks ≈ $2,160 / month — less than one missed reefer, one after-hours tow, or a single ugly
              conversation with the insurance desk.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/pilot/"
                className="inline-flex rounded-full bg-amber px-5 py-3 text-sm font-semibold text-navy hover:bg-amber-2"
              >
                Request the pilot
              </Link>
              <Link href="/playbook/" className="inline-flex rounded-full border border-paper/20 px-5 py-3 text-sm text-paper">
                Copy the outreach
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber">Out of this MVP</p>
            <h2 className="display mt-3 text-3xl">We sit on the stack you already bought.</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              Real OAuth connectors, failure-prediction ML, routing, and a driver app are later. The job now is the
              gap between alert and a file you can show.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              "Real Samsara / Motive / Geotab OAuth (mock first)",
              "Predictive failure ML",
              "Routing or load optimization",
              "Driver mobile apps",
              "Replacing your full CMMS",
            ].map((item) => (
              <li key={item} className="rounded-xl border border-[var(--line)] bg-paper-2 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-navy text-paper">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <h2 className="display text-3xl md:text-5xl">Five minutes. Then ask for the check.</h2>
          <p className="mx-auto mt-4 max-w-xl text-paper/70">
            Run the agent, approve the red queue, open the proof pack, send the playbook.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/"
              className="inline-flex rounded-full bg-amber px-6 py-3 text-sm font-semibold text-navy hover:bg-amber-2"
            >
              Open the live demo
            </Link>
            <Link
              href="/playbook/"
              className="inline-flex rounded-full border border-paper/20 px-6 py-3 text-sm text-paper"
            >
              Open the playbook
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
