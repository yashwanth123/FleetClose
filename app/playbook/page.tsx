import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { CopyBlock } from "@/components/copy-block";

const email = `Subject: You already pay for the cameras — who closes the alerts?

Hi {{first_name}},

Most 80–200 truck shops I talk to in 2026 have Samsara or Motive on the windshield and a shared inbox that is two shifts behind.

Camera AI made the feed louder. Insurance now asks what you did after the clip, not whether you have a dashboard.

FleetClose turns those alerts into a work order or a coaching close, escalates only the unsafe ones, and leaves a proof pack you can forward to the agent.

$3,500 for 30 days, up to 100 trucks. Then about $12/truck/month if it earns it.

I can show Heartland Freight (a simulated Midwest fleet) close a real-looking day in five minutes:

{{demo_url}}

Worth 15 minutes this week?

— Yashwanth`;

const linkedin = `You bought Samsara/Motive. The 2026 problem is not another dashboard — it's proving you closed the alert before the load (or the insurer) asked.

I built a 5-min demo for 50–500 truck fleets: auto work orders on routine PM, human queue for brakes/HOS/crashes, proof pack for renewal.

$3,500 / 30-day pilot. Happy to walk it.`;

const callOpen = `You already pay for cameras. In the last renewal, did they ask whether you have dashcams — or what you did after a following-distance or handheld event?

We close that loop: alert → decide → work order or coaching → file. I can show it in five minutes on a 24-truck Midwest demo.`;

export default function PlaybookPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber">Sales playbook · 2026</p>
        <h1 className="display mt-3 text-4xl md:text-5xl">What to say, who to say it to, what to show.</h1>
        <p className="mt-5 text-ink/70">
          Use this when you email a fleet manager, walk a 15-minute call, or post. The product is the demo. This page
          is the words around it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard/" className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-paper">
            Open the demo
          </Link>
          <Link href="/pilot/" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm">
            Pilot form
          </Link>
        </div>

        <section className="mt-14">
          <h2 className="display text-3xl">One-line pitch</h2>
          <p className="mt-3 rounded-2xl bg-navy p-5 text-paper">
            FleetClose turns the telematics you already pay for into closed work and a proof file — so mid-market
            fleets stop chasing dashboards and can answer the 2026 insurer.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="display text-3xl">Who to call this week</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink/80">
            <li>— Maintenance / fleet managers at 50–500 truck regional carriers (Midwest, Southeast, Texas first)</li>
            <li>— Owners who just got a renewal or a “we need your camera program in writing” email</li>
            <li>— Reefer / food fleets that already eat chargebacks on temp excursions</li>
            <li>— Skip: one-truck owner-ops, Amazon/UPS, and anyone shopping a full TMS/CMMS rip-and-replace</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="display text-3xl">Cold email</h2>
          <p className="mt-2 text-sm text-ink/60">Replace the demo URL with your live link after Pages/Vercel is on.</p>
          <CopyBlock label="Email" text={email} />
        </section>

        <section className="mt-12">
          <h2 className="display text-3xl">LinkedIn note</h2>
          <CopyBlock label="LinkedIn" text={linkedin} />
        </section>

        <section className="mt-12">
          <h2 className="display text-3xl">Call open</h2>
          <CopyBlock label="Call open" text={callOpen} />
        </section>

        <section className="mt-12">
          <h2 className="display text-3xl">Five-minute demo script</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-ink/80">
            <li>Home page: “You bought cameras. The 2026 bill is proving you acted.”</li>
            <li>Dashboard: show alerts sitting 4–11 hours. Point at the phone-use and following-distance rows.</li>
            <li>Hit <strong>Run agent</strong>. Routine PM becomes work orders. Seatbelt/idle become coaching, not shop tickets.</li>
            <li>Red queue: brakes, overheat, air, HOS, crash, camera-distract. Approve one. Truck goes OOS only when it should.</li>
            <li>Proof pack: “This is what you forward when the agent asks what you did after the clip.”</li>
            <li>ROI strip, then $3,500 / 30 days. Book on <Link href="/pilot/" className="underline">/pilot</Link>.</li>
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="display text-3xl">Objections</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="rounded-2xl border border-[var(--line)] bg-paper-2 p-4">
              <dt className="font-semibold">“We already have Samsara / Motive.”</dt>
              <dd className="mt-2 text-ink/70">
                Good — we need that feed. They show the alert. They do not create the work order, the coaching close, or
                the file. That is the gap.
              </dd>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-paper-2 p-4">
              <dt className="font-semibold">“We have a CMMS.”</dt>
              <dd className="mt-2 text-ink/70">
                Keep it. We are not replacing TMT / Infor / a shop spreadsheet. We are stopping the 4-hour paste.
              </dd>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-paper-2 p-4">
              <dt className="font-semibold">“AI will hallucinate and park a good truck.”</dt>
              <dd className="mt-2 text-ink/70">
                Rules first. Camera coaching never auto-parks a truck. Brakes, air, overheat, crash wait for a human.
                Every decision has a reason and a confidence score.
              </dd>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-paper-2 p-4">
              <dt className="font-semibold">“$3,500 is a lot to try.”</dt>
              <dd className="mt-2 text-ink/70">
                One missed reefer or one unanswered safety clip costs more. 30 days, 100 trucks, you keep the proof pack
                either way.
              </dd>
            </div>
          </dl>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
