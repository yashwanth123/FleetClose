import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { PilotForm } from "@/components/pilot-form";

export default function PilotPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber">30-day paid pilot</p>
          <h1 className="display mt-3 text-4xl md:text-5xl">$3,500. Up to 100 trucks. Closed work, not another dashboard.</h1>
          <p className="mt-5 text-ink/70">
            For fleet / ops / maintenance managers at regional carriers. We turn the alerts you already have into work
            orders, notifications, and a human queue for unsafe cases — then show ROI.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ink/80">
            <li>— 30 days, up to 100 trucks</li>
            <li>— Then ~$12 per truck / month if it earns its keep</li>
            <li>— No Samsara/Geotab rip-and-replace in the pilot</li>
            <li>— You keep your CMMS</li>
          </ul>
        </div>
        <PilotForm />
      </main>
      <SiteFooter />
    </div>
  );
}
