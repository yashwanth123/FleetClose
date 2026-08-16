import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { PilotForm } from "@/components/pilot-form";

export default function PilotPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber">30-day paid pilot · 2026</p>
          <h1 className="display mt-3 text-4xl md:text-5xl">$3,500. Close the alerts you already pay to see.</h1>
          <p className="mt-5 text-ink/70">
            For fleet / ops / maintenance managers who already have Samsara, Motive, or Geotab — and a renewal, a
            shipper, or a shop that is still waiting on a human to paste the ticket.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ink/80">
            <li>— 30 days, up to 100 trucks</li>
            <li>— Work orders + coaching closes + a proof pack</li>
            <li>— Then ~$12 per truck / month if it earns its keep</li>
            <li>— You keep the cameras and the CMMS</li>
          </ul>
        </div>
        <PilotForm />
      </main>
      <SiteFooter />
    </div>
  );
}
