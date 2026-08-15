import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="mono text-[12px] uppercase tracking-[0.22em] text-amber">404</p>
        <h1 className="display mt-3 text-4xl">That page isn&apos;t on this truck.</h1>
        <p className="mt-4 text-ink/70">Use one of these — every screen in the MVP lives here.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-paper">
            Marketing
          </Link>
          <Link href="/dashboard/" className="rounded-full bg-amber px-5 py-3 text-sm font-semibold text-navy">
            Live ops demo
          </Link>
          <Link href="/pilot/" className="rounded-full border border-[var(--line)] px-5 py-3 text-sm">
            Book pilot
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
