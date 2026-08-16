"use client";

import { FormEvent, useMemo, useState } from "react";
import { runAgent } from "@/lib/agent";
import { FEATURED_DOTS, listViolations, lookupCarrier, ratingLabel, searchCarriers, type FmcsaCarrier } from "@/lib/fmcsa";
import { stateFromViolations } from "@/lib/fmcsa-map";
import { computeRoi } from "@/lib/metrics";
import type { DemoState } from "@/lib/types";

export function LiveFmcsa() {
  const [dot, setDot] = useState("638655");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<FmcsaCarrier[]>([]);
  const [carrier, setCarrier] = useState<FmcsaCarrier | null>(null);
  const [state, setState] = useState<DemoState | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const metrics = useMemo(() => (state ? computeRoi(state) : null), [state]);

  async function loadDot(value: string) {
    setBusy(true);
    setError("");
    try {
      const profile = await lookupCarrier(value);
      if (!profile) {
        setError("No active census row for that USDOT.");
        setCarrier(null);
        setState(null);
        return;
      }
      const violations = await listViolations(value);
      if (violations.length === 0) {
        setError(`${profile.legal_name} is real, but this SMS snapshot has no public violations to close.`);
        setCarrier(profile);
        setState(null);
        return;
      }
      const next = stateFromViolations(
        profile.legal_name ?? "Carrier",
        profile.phy_city ?? "",
        profile.phy_state ?? "",
        violations,
      );
      setCarrier(profile);
      setState(runAgent(next));
      setDot(profile.dot_number ?? value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Open-data request failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      setHits(await searchCarriers(query));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="rounded-2xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm">
        Public FMCSA census + SMS violation files via data.transportation.gov. These companies are{" "}
        <strong>not FleetClose customers</strong> and we are not affiliated. We do not call their phone from this page.
      </p>

      <div className="flex flex-wrap gap-2">
        {FEATURED_DOTS.map((item) => (
          <button
            key={item.dot}
            type="button"
            onClick={() => loadDot(item.dot)}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-left text-sm hover:bg-paper-2"
          >
            <span className="font-semibold">USDOT {item.dot}</span>
            <span className="mt-0.5 block text-xs text-ink/55">{item.why}</span>
          </button>
        ))}
      </div>

      <form onSubmit={onSearch} className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a real legal name (min 3 letters)"
          className="rounded-xl border border-[var(--line)] bg-paper-2 px-3 py-2"
        />
        <button type="submit" className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-paper" disabled={busy}>
          Search census
        </button>
      </form>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void loadDot(dot);
        }}
        className="grid gap-3 sm:grid-cols-[1fr_auto]"
      >
        <input
          value={dot}
          onChange={(event) => setDot(event.target.value)}
          placeholder="USDOT number"
          className="rounded-xl border border-[var(--line)] bg-paper-2 px-3 py-2"
        />
        <button type="submit" className="rounded-full bg-amber px-4 py-2 text-sm font-semibold text-navy" disabled={busy}>
          {busy ? "Loading…" : "Load + run agent"}
        </button>
      </form>

      {hits.length > 0 ? (
        <ul className="divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)]">
          {hits.map((hit) => (
            <li key={hit.dot_number}>
              <button
                type="button"
                onClick={() => loadDot(hit.dot_number ?? "")}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-paper-2"
              >
                <span>
                  <span className="font-medium">{hit.legal_name}</span>
                  <span className="mt-1 block text-xs text-ink/55">
                    USDOT {hit.dot_number} · {hit.phy_city}, {hit.phy_state} · {hit.power_units} power units
                  </span>
                </span>
                <span className="text-xs text-ink/45">{ratingLabel(hit.safety_rating)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {carrier ? (
        <section className="rounded-2xl bg-navy p-6 text-paper">
          <p className="mono text-[11px] uppercase tracking-[0.16em] text-amber-2">Real public carrier</p>
          <h2 className="display mt-2 text-3xl">{carrier.legal_name}</h2>
          <p className="mt-2 text-sm text-paper/70">
            USDOT {carrier.dot_number} · {carrier.phy_city}, {carrier.phy_state} · {carrier.power_units} power units ·{" "}
            {carrier.total_drivers} drivers · {ratingLabel(carrier.safety_rating)}
          </p>
          <p className="mt-2 text-xs text-paper/45">{carrier.classdef}</p>
        </section>
      ) : null}

      {state && metrics ? (
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Public violations closed" value={String(metrics.processedAlerts)} />
            <Stat label="Auto-resolved" value={`${Math.round(metrics.autoResolvePct)}%`} />
            <Stat label="Human queue" value={String(metrics.escalated)} />
          </div>
          <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-2 text-[11px] uppercase tracking-wide text-ink/45">
                <tr>
                  <th className="px-3 py-2">Violation</th>
                  <th className="px-3 py-2">Decision</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {state.alerts.map((alert) => {
                  const decision = state.decisions.find((item) => item.alertId === alert.id);
                  return (
                    <tr key={alert.id} className="border-t border-[var(--line)]">
                      <td className="px-3 py-2">
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-xs text-ink/50">{alert.detail}</p>
                      </td>
                      <td className="px-3 py-2 text-ink/70">
                        {decision?.action === "escalate" ? "Escalate" : "Auto-close"}
                        {decision ? ` · ${Math.round(decision.confidence * 100)}%` : ""}
                      </td>
                      <td className="px-3 py-2 uppercase">{alert.status.replace("_", " ")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {state.workOrders.length > 0 ? (
            <p className="text-sm text-ink/65">{state.workOrders.length} work orders opened from public roadside defects.</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-paper-2 px-4 py-3">
      <p className="mono text-[11px] uppercase text-ink/40">{label}</p>
      <p className="display mt-1 text-3xl">{value}</p>
    </article>
  );
}
