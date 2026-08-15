"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { resolveEscalation, runAgent } from "@/lib/agent";
import { Wordmark } from "@/components/brand";
import {
  AGENT_MINUTES,
  BASELINE_HOURS,
  DOWNTIME_PER_HOUR,
  DOWNTIME_PROBABILITY,
  computeRoi,
} from "@/lib/metrics";
import { DEMO_FLEET, DEMO_REGION, createSeedState, truckById } from "@/lib/seed";
import { SEVERITY_LABEL, TRUCK_TYPE_LABEL, formatMoney, formatPct, formatRelative } from "@/lib/ids";
import type { Alert, DemoState, Escalation, Severity } from "@/lib/types";

const severityClass: Record<Severity, string> = {
  routine: "bg-paper/10 text-paper/80",
  urgent: "bg-amber/20 text-amber-2",
  critical: "bg-danger/20 text-red-200",
};

function truckStatusClass(status: string) {
  if (status === "oos") return "text-red-300";
  if (status === "shop") return "text-amber-2";
  if (status === "en_route") return "text-teal-200";
  return "text-paper/60";
}

export function OpsDashboard() {
  const [state, setState] = useState<DemoState>(() => createSeedState());
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const metrics = useMemo(() => computeRoi(state), [state]);
  const selectedAlert = state.alerts.find((alert) => alert.id === selectedAlertId) ?? state.alerts[0];
  const selectedTruck = selectedAlert ? truckById(state.trucks, selectedAlert.truckId) : undefined;
  const selectedDecision = selectedAlert
    ? state.decisions.find((item) => item.alertId === selectedAlert.id)
    : undefined;
  const pending = state.escalations.filter((item) => item.status === "pending");

  async function handleRun() {
    if (busy) return;
    const open = state.alerts.filter((alert) => alert.status === "open");
    if (open.length === 0) return;
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setState((current) => runAgent(current));
    setBusy(false);
  }

  function handleReset() {
    const next = createSeedState();
    setState(next);
    setSelectedAlertId(next.alerts[0]?.id ?? null);
    setNotes({});
  }

  function handleResolve(escalation: Escalation, action: "approved" | "rejected") {
    setState((current) => resolveEscalation(current, escalation.id, action, notes[escalation.id]));
    setNotes((current) => {
      const next = { ...current };
      delete next[escalation.id];
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#071421] text-paper">
      <header className="sticky top-0 z-20 border-b border-paper/10 bg-[#071421]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Wordmark tone="dark" />
            </Link>
            <div className="hidden h-8 w-px bg-paper/10 md:block" />
            <div className="hidden md:block">
              <p className="text-sm font-medium">{DEMO_FLEET}</p>
              <p className="mono text-[11px] text-paper/45">{DEMO_REGION}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-paper/15 px-4 py-2 text-sm text-paper/80 hover:bg-paper/5"
            >
              Reset demo
            </button>
            <button
              type="button"
              onClick={handleRun}
              disabled={busy || metrics.openAlerts === 0}
              className="rounded-full bg-amber px-4 py-2 text-sm font-semibold text-navy hover:bg-amber-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Agent running…" : metrics.openAlerts === 0 ? "Agent caught up" : "Run agent"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-4 px-4 py-4">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Open alerts" value={String(metrics.openAlerts)} hint="Still sitting in the feed" />
          <Kpi
            label="Auto-resolve"
            value={metrics.processedAlerts === 0 ? "—" : formatPct(metrics.autoResolvePct)}
            hint={`${metrics.autoResolved} closed · ${metrics.escalated} to humans`}
          />
          <Kpi
            label="Time-to-action"
            value={metrics.processedAlerts === 0 ? "—" : `${metrics.avgTimeToActionMinutes}m`}
            hint={`Baseline today: ${BASELINE_HOURS}h average`}
          />
          <Kpi
            label="Est. savings"
            value={metrics.processedAlerts === 0 ? "—" : formatMoney(metrics.estimatedSavings)}
            hint={`${formatMoney(DOWNTIME_PER_HOUR)}/hr × ${Math.round(DOWNTIME_PROBABILITY * 100)}% downtime risk`}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel title="Open alerts feed" meta={`${state.alerts.length} total · mock Samsara / Geotab / ELD`}>
            <div className="dash-scroll max-h-[520px] overflow-auto">
              {state.alerts.map((alert) => {
                const truck = truckById(state.trucks, alert.truckId);
                const active = selectedAlert?.id === alert.id;
                return (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => setSelectedAlertId(alert.id)}
                    className={`grid w-full grid-cols-[88px_1fr_auto] gap-3 border-b border-paper/8 px-4 py-3 text-left hover:bg-paper/4 ${
                      active ? "bg-paper/7" : ""
                    }`}
                  >
                    <span className={`mono self-start rounded px-2 py-1 text-[10px] uppercase ${severityClass[alert.severity]}`}>
                      {SEVERITY_LABEL[alert.severity]}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{alert.title}</span>
                      <span className="mt-1 block text-xs text-paper/50">
                        {truck?.unit} · {truck?.driver} · {alert.source} · {formatRelative(alert.createdAt)}
                      </span>
                    </span>
                    <StatusPill status={alert.status} />
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Decision detail" meta="Reason · confidence · recommended plan">
            {selectedAlert ? (
              <div className="space-y-4 px-4 py-4">
                <div>
                  <p className="mono text-[11px] uppercase tracking-[0.16em] text-paper/40">{selectedAlert.code}</p>
                  <h3 className="mt-1 text-lg font-semibold">{selectedAlert.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper/70">{selectedAlert.detail}</p>
                </div>
                {selectedTruck ? (
                  <p className="text-sm text-paper/55">
                    {selectedTruck.unit} · {selectedTruck.year} {selectedTruck.make} {selectedTruck.model} ·{" "}
                    {TRUCK_TYPE_LABEL[selectedTruck.type]} · {selectedTruck.location}
                  </p>
                ) : null}
                {selectedDecision ? (
                  <div className="rounded-xl border border-paper/10 bg-paper/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">
                        {selectedDecision.action === "escalate" ? "Escalated to human" : "Auto work order"}
                      </p>
                      <p className="mono text-xs text-amber-2">
                        {Math.round(selectedDecision.confidence * 100)}% confidence
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-paper/70">{selectedDecision.reason}</p>
                    <p className="mt-3 text-sm leading-relaxed text-paper/85">{selectedDecision.recommendedPlan}</p>
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-paper/15 px-4 py-6 text-sm text-paper/50">
                    This alert is still sitting. Hit <span className="text-amber-2">Run agent</span> to decide, create
                    work, and notify — or escalate if it&apos;s unsafe.
                  </p>
                )}
              </div>
            ) : null}
          </Panel>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel
            title="Human escalation queue"
            meta={`${pending.length} waiting · critical / safety only`}
          >
            {pending.length === 0 ? (
              <p className="px-4 py-8 text-sm text-paper/50">
                {state.escalations.length === 0
                  ? "Run the agent. Unsafe alerts will land here instead of auto-closing."
                  : "Queue clear. Approved and rejected cases stay in the audit trail."}
              </p>
            ) : (
              <div className="space-y-3 p-4">
                {pending.map((escalation) => {
                  const alert = state.alerts.find((item) => item.id === escalation.alertId);
                  const truck = alert ? truckById(state.trucks, alert.truckId) : undefined;
                  return (
                    <article key={escalation.id} className="rounded-xl border border-danger/30 bg-danger/8 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{alert?.title}</p>
                          <p className="mt-1 text-xs text-paper/50">
                            {truck?.unit} · {truck?.driver} · {truck?.location}
                          </p>
                        </div>
                        <span className="mono text-[10px] uppercase text-red-200">Needs human</span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-paper/80">{escalation.recommendedPlan}</p>
                      <textarea
                        value={notes[escalation.id] ?? ""}
                        onChange={(event) =>
                          setNotes((current) => ({ ...current, [escalation.id]: event.target.value }))
                        }
                        placeholder="Optional manager note"
                        className="mt-3 w-full rounded-lg border border-paper/10 bg-[#071421] px-3 py-2 text-sm outline-none focus:border-amber"
                        rows={2}
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleResolve(escalation, "approved")}
                          className="rounded-full bg-amber px-3 py-1.5 text-xs font-semibold text-navy"
                        >
                          Approve plan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolve(escalation, "rejected")}
                          className="rounded-full border border-paper/20 px-3 py-1.5 text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel title="Work orders" meta={`${state.workOrders.length} created this session`}>
            {state.workOrders.length === 0 ? (
              <p className="px-4 py-8 text-sm text-paper/50">
                Routine alerts become shop tickets automatically. Critical ones wait for your approval.
              </p>
            ) : (
              <div className="dash-scroll max-h-[420px] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-[#10283f] text-[11px] uppercase tracking-wide text-paper/45">
                    <tr>
                      <th className="px-4 py-2 font-medium">WO</th>
                      <th className="px-4 py-2 font-medium">Unit</th>
                      <th className="px-4 py-2 font-medium">Job</th>
                      <th className="px-4 py-2 font-medium">Pri</th>
                      <th className="px-4 py-2 font-medium">Shop</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.workOrders.map((wo) => {
                      const truck = truckById(state.trucks, wo.truckId);
                      return (
                        <tr key={wo.id} className="border-t border-paper/8">
                          <td className="mono px-4 py-2 text-xs text-paper/55">{wo.id.slice(0, 14)}</td>
                          <td className="px-4 py-2">{truck?.unit}</td>
                          <td className="px-4 py-2">{wo.title}</td>
                          <td className="px-4 py-2 uppercase">{wo.priority}</td>
                          <td className="px-4 py-2 text-paper/65">{wo.shop}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
          <Panel title="Notification log" meta="SMS · email · radio">
            <LogEmpty empty={state.notifications.length === 0} label="Notifications fire when work is created or a case is escalated.">
              <ul className="dash-scroll max-h-[280px] divide-y divide-paper/8 overflow-auto">
                {state.notifications.map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <p className="text-sm">
                      <span className="mono text-[10px] uppercase text-amber-2">{item.channel}</span>{" "}
                      <span className="text-paper/80">→ {item.to}</span>
                    </p>
                    <p className="mt-1 text-xs text-paper/55">{item.subject}</p>
                  </li>
                ))}
              </ul>
            </LogEmpty>
          </Panel>

          <Panel title="Audit trail" meta="Every decision is explainable">
            <LogEmpty empty={state.audit.length === 0} label="Agent and human actions land here.">
              <ul className="dash-scroll max-h-[280px] divide-y divide-paper/8 overflow-auto">
                {state.audit.map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <p className="text-xs text-paper/45">
                      <span className="mono uppercase">{item.actor}</span> · {formatRelative(item.at)}
                    </p>
                    <p className="mt-1 text-sm text-paper/80">{item.message}</p>
                  </li>
                ))}
              </ul>
            </LogEmpty>
          </Panel>

          <Panel title="Fleet strip" meta="24 simulated trucks">
            <ul className="dash-scroll grid max-h-[280px] grid-cols-2 gap-2 overflow-auto p-3">
              {state.trucks.map((truck) => (
                <li key={truck.id} className="rounded-lg border border-paper/8 px-2 py-2">
                  <p className="text-xs font-medium">{truck.unit}</p>
                  <p className={`mono text-[10px] uppercase ${truckStatusClass(truck.status)}`}>
                    {truck.status.replace("_", " ")}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </section>

        <p className="pb-6 text-center text-xs text-paper/35">
          ROI math for the pitch: closed work × ({BASELINE_HOURS}h baseline − {AGENT_MINUTES}m agent) ×{" "}
          {Math.round(DOWNTIME_PROBABILITY * 100)}% chance the delay becomes downtime × {formatMoney(DOWNTIME_PER_HOUR)}
          /hour. Conservative on purpose.
        </p>
      </main>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-2xl border border-paper/10 bg-[#10283f] px-4 py-4">
      <p className="mono text-[11px] uppercase tracking-[0.16em] text-paper/40">{label}</p>
      <p className="display mt-2 text-3xl">{value}</p>
      <p className="mt-1 text-xs text-paper/45">{hint}</p>
    </article>
  );
}

function Panel({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-paper/10 bg-[#0c2236]">
      <header className="flex items-end justify-between gap-3 border-b border-paper/10 px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mono text-[10px] uppercase tracking-wide text-paper/35">{meta}</p>
      </header>
      {children}
    </section>
  );
}

function StatusPill({ status }: { status: Alert["status"] }) {
  const label: Record<Alert["status"], string> = {
    open: "Open",
    auto_closed: "Auto-closed",
    escalated: "Escalated",
    approved: "Approved",
    rejected: "Rejected",
  };
  return (
    <span className="self-start rounded-full border border-paper/10 px-2 py-1 text-[10px] uppercase tracking-wide text-paper/60">
      {label[status]}
    </span>
  );
}

function LogEmpty({
  empty,
  label,
  children,
}: {
  empty: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (empty) {
    return <p className="px-4 py-8 text-sm text-paper/50">{label}</p>;
  }
  return children;
}
