import Link from "next/link";
import { Wordmark } from "@/components/brand";

const nav = [
  { href: "/#problem", label: "2026 problem" },
  { href: "/how/", label: "How it works" },
  { href: "/playbook/", label: "Playbook" },
  { href: "/live/", label: "Real USDOT" },
  { href: "/dashboard/", label: "Sim demo" },
];

export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <header
      className={`sticky top-0 z-20 border-b backdrop-blur ${
        dark ? "border-paper/10 bg-[#071421]/95" : "border-[var(--line)] bg-paper/90"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="FleetClose home">
          <Wordmark tone={dark ? "dark" : "light"} />
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={dark ? "text-paper/70 hover:text-paper" : "text-ink/70 hover:text-ink"}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/"
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              dark ? "bg-amber text-navy hover:bg-amber-2" : "bg-navy text-paper hover:bg-navy-2"
            }`}
          >
            Live demo
          </Link>
          <Link
            href="/pilot/"
            className={`hidden rounded-full border px-4 py-2 text-sm sm:inline-flex ${
              dark ? "border-paper/20 text-paper" : "border-[var(--line)] text-ink"
            }`}
          >
            Book pilot
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <footer className={`border-t ${dark ? "border-paper/10 bg-[#071421] text-paper/55" : "border-[var(--line)] text-ink/55"}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm md:flex-row md:items-center md:justify-between">
        <Link href="/" aria-label="FleetClose home">
          <Wordmark tone={dark ? "dark" : "light"} />
        </Link>
        <div className="flex flex-wrap gap-4">
          <Link href="/how/" className="hover:underline">
            How it works
          </Link>
          <Link href="/live/" className="hover:underline">
            Real USDOT
          </Link>
          <Link href="/dashboard/" className="hover:underline">
            Ops demo
          </Link>
          <Link href="/playbook/" className="hover:underline">
            Playbook
          </Link>
          <Link href="/pilot/" className="hover:underline">
            $3,500 pilot
          </Link>
        </div>
        <p>Turn alerts into closed work.</p>
      </div>
    </footer>
  );
}
