import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { LiveFmcsa } from "@/components/live-fmcsa";

export default function LivePage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-16">
        <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber">Real public data</p>
        <h1 className="display mt-3 text-4xl md:text-5xl">Automation on a real USDOT — not a made-up fleet.</h1>
        <p className="mt-5 max-w-3xl text-ink/70">
          Samsara and Motive are not public. Anyone can read the FMCSA company census and SMS violation files. We pull
          those in the browser, map each roadside defect to a FleetClose decision, and run the same agent.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-ink/55">
          Start with Niece Trucking (USDOT 638655) — 194 power units in Des Moines, public record, for-hire. Or paste
          any USDOT. This is not an endorsement and not a customer list.
        </p>
        <div className="mt-10">
          <LiveFmcsa />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
