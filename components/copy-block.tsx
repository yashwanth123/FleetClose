"use client";

import { useState } from "react";

export function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-paper-2">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2">
        <p className="mono text-[11px] uppercase tracking-wide text-ink/45">{label}</p>
        <button
          type="button"
          onClick={copy}
          className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-paper"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="dash-scroll max-h-[320px] overflow-auto whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed text-ink/80">
        {text}
      </pre>
    </div>
  );
}
