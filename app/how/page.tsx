import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function HowPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber">How it works</p>
        <h1 className="display mt-3 text-4xl md:text-5xl">Simple version: no hidden server. Rules close the work in the browser.</h1>
        <p className="mt-5 text-ink/70">
          This MVP is a working demo you can sell a pilot with. It is not yet plugged into a live Samsara account or a
          database. That is on purpose — we prove the loop first.
        </p>

        <section className="mt-12">
          <h2 className="display text-3xl">What it does so far</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-ink/80">
            <li>Loads a fake Midwest fleet (24 trucks, 20 alerts sitting for hours).</li>
            <li>
              You hit <strong>Run agent</strong>. A rules engine — not a live LLM — reads each alert.
            </li>
            <li>Routine PM → work order + text/email to shop and driver. Alert closes.</li>
            <li>Camera / idle / seatbelt noise → coaching note. No fake shop ticket.</li>
            <li>Brakes, air, overheat, HOS, crash, serious camera events → human queue with a recommended plan.</li>
            <li>You approve or reject. Only real mechanical/crash events mark a truck out of service.</li>
            <li>A proof pack + ROI numbers update so you can show an insurer or an owner.</li>
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="display text-3xl">“Backend” today</h2>
          <p className="mt-3 text-ink/70">
            There is no login, no database, and no Samsara API key. The site is a static Next.js app. The brains live in{" "}
            <code className="mono text-sm">lib/agent.ts</code>.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink/80">
            <li>
              — <strong>Seed data</strong> (<code className="mono">lib/seed.ts</code>) is the fake company.
            </li>
            <li>
              — <strong>Rules</strong> decide escalate vs auto-close vs coach-only.
            </li>
            <li>
              — <strong>Your browser</strong> keeps the demo in session storage so leaving the page does not wipe a run.
            </li>
            <li>
              — <strong>Pilot form</strong> opens a prefilled email. It does not write to our servers.
            </li>
          </ul>
          <p className="mt-4 text-sm text-ink/60">
            We test those rules with <code className="mono">npm test</code> (20 alerts processed, 13 auto / 7 human, no
            shop ticket on camera coaching, crash parks the truck, phone clip does not).
          </p>
        </section>

        <section className="mt-12">
          <h2 className="display text-3xl">What a paid pilot adds later</h2>
          <p className="mt-3 text-ink/70">
            After someone pays $3,500, week 1 is still mostly their export + our rules. Live OAuth is a follow-on, not
            day one.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink/80">
            <li>— Map their trucks and last 2 weeks of alerts into this same loop</li>
            <li>— Tune “what must go to a human” to their safety policy</li>
            <li>— Send the proof pack once a week (email/PDF)</li>
            <li>— Only then: read-only webhook or CSV drop from Samsara / Motive / Geotab</li>
          </ul>
        </section>

        <section id="data" className="scroll-mt-24 mt-12">
          <h2 className="display text-3xl">Data you need from a company to start</h2>
          <p className="mt-3 text-ink/70">
            Ask for this on the first call. You can start a 30-day pilot with the “must have” column. Do not ask for
            driver SSNs, bank info, or a full customer list.
          </p>

          <h3 className="mt-8 text-lg font-semibold">Must have (to start)</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink/80">
            <li>— Company name, terminals, truck count, mix (van / reefer / flatbed)</li>
            <li>— Buyer name, role, email, phone (fleet / ops / maintenance manager)</li>
            <li>— What they already pay for: Samsara, Motive, Geotab, other</li>
            <li>— How alerts get handled today (email, Slack, CMMS name, spreadsheet)</li>
            <li>— Who can park a truck (safety / maintenance) and who gets the shop ticket</li>
            <li>— Last 2 weeks of alerts as a CSV or screenshot export (unit, time, type, what they did)</li>
            <li>— One pain they will measure: downtime hours, missed loads, or unanswered camera events</li>
          </ul>

          <h3 className="mt-8 text-lg font-semibold">Need to deliver the 30 days</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink/80">
            <li>— Unit list: truck number, type, home shop (VIN optional)</li>
            <li>— Notify list: shop lead, safety, dispatcher emails/phones — not every driver’s personal phone on day 1</li>
            <li>— Their escalate list in writing (“brakes / air / crash / HOS always human”)</li>
            <li>— Shop hours and after-hours vendor</li>
            <li>— Insurance renewal month (so the proof pack has a date to aim at)</li>
            <li>— Reefer? Then: who gets a temp excursion (shipper vs shop)</li>
          </ul>

          <h3 className="mt-8 text-lg font-semibold">Later (not required to take the check)</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink/80">
            <li>— Read-only API or webhook from their telematics vendor</li>
            <li>— CMMS write access (or we keep emailing a WO they paste)</li>
            <li>— Driver phone numbers, if they want SMS coaching</li>
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/dashboard/" className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-paper">
            Run the demo
          </Link>
          <Link href="/playbook/" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm">
            Sales playbook
          </Link>
          <Link href="/pilot/" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm">
            Pilot form
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
