"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Wordmark } from "@/components/brand";
import { apiJson } from "@/lib/client-api";
import {
  AGENT_MINUTES,
  BASELINE_HOURS,
  DOWNTIME_PER_HOUR,
  DOWNTIME_PROBABILITY,
  computeRoi,
} from "@/lib/metrics";
import { DEMO_FLEET, DEMO_REGION, createSeedState, truckById } from "@/lib/seed";
import { SEVERITY_LABEL, TRUCK_TYPE_LABEL, formatMoney, formatPct, formatRelative } from "@/lib/ids";
import { buildProofPack } from "@/lib/proof";
import type { Alert, DemoState, Escalation, Severity, WorkOrderStatus } from "@/lib/types";

type CarrierInfo = {
  id: string;
  usdot: string | null;
  legal_name: string;
  city: string | null;
  state: string | null;
  source: string;
};

const HEARTLAND_ID = "heartland";

type OpsPayload = {
  carrierId: string;
  carrier: CarrierInfo | undefined;
  state: DemoState;
};

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const carrierId = searchParams.get("carrier") || HEARTLAND_ID;
  const [state, setState] = useState<DemoState>(() => createSeedState());
  const [carrier, setCarrier] = useState<CarrierInfo | undefined>();
  const [carriers, setCarriers] = useState<CarrierInfo[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [csvName, setCsvName] = useState("");

  function applyPayload(payload: OpsPayload) {
    setState(payload.state);
    setCarrier(payload.carrier);
  }

  useEffect(() => {
    apiJson<{ carriers: CarrierInfo[] }>("/api/carriers")
      .then((payload) => setCarriers(payload.carriers))
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    apiJson<OpsPayload>(`/api/state?carrierId=${encodeURIComponent(carrierId)}`)
      .then(applyPayload)
      .catch((err: Error) => setError(err.message));
  }, [carrierId]);

  const metrics = useMemo(() => computeRoi(state), [state]);
  const proof = useMemo(() => buildProofPack(state), [state]);
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
    setError("");
    try {
      const payload = await apiJson<OpsPayload>("/api/agent/run", {
        method: "POST",
        body: JSON.stringify({ carrierId }),
      });
      applyPayload(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent run failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    setBusy(true);
    setError("");
    try {
      const payload = await apiJson<OpsPayload>("/api/demo/reset", { method: "POST" });
      applyPayload(payload);
      setSelectedAlertId(payload.state.alerts[0]?.id ?? null);
      setNotes({});
      router.replace("/dashboard/?carrier=heartland");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleResolve(escalation: Escalation, action: "approved" | "rejected") {
    setError("");
    try {
      const payload = await apiJson<OpsPayload>("/api/agent/resolve", {
        method: "POST",
        body: JSON.stringify({
          carrierId,
          escalationId: escalation.id,
          action,
          note: notes[escalation.id],
        }),
      });
      applyPayload(payload);
      setNotes((current) => {
        const next = { ...current };
        delete next[escalation.id];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resolve failed");
    }
  }

  async function handleWorkOrder(workOrderId: string, status: WorkOrderStatus) {
    setError("");
    try {
      const payload = await apiJson<OpsPayload>("/api/work-orders", {
        method: "POST",
        body: JSON.stringify({ carrierId, workOrderId, status }),
      });
      applyPayload(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Work order update failed");
    }
  }

  async function handleCsv(file: File, asNewFleet: boolean) {
    setBusy(true);
    setError("");
    try {
      const csv = await file.text();
      const payload = await apiJson<OpsPayload>("/api/alerts/ingest", {
        method: "POST",
        body: JSON.stringify({
          csv,
          run: true,
          ...(asNewFleet
            ? { fleetName: csvName.trim() || file.name.replace(/\.csv$/i, "") }
            : { carrierId }),
        }),
      });
      applyPayload(payload);
      setSelectedAlertId(payload.state.alerts[0]?.id ?? null);
      const list = await apiJson<{ carriers: CarrierInfo[] }>("/api/carriers");
      setCarriers(list.carriers);
      if (payload.carrierId !== carrierId) {
        router.replace(`/dashboard/?carrier=${encodeURIComponent(payload.carrierId)}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "CSV ingest failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#071421] text-paper">
      <header className="sticky top-0 z-20 border-b border-paper/10 bg-[#071421]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="FleetClose home">
              <Wordmark tone="dark" />
            </Link>
            <div className="hidden h-8 w-px bg-paper/10 md:block" />
            <div className="hidden md:block">
              <label className="sr-only" htmlFor="carrier-switch">
                Carrier
              </label>
              <select
                id="carrier-switch"
                value={carrierId}
                onChange={(event) =>
                  router.replace(`/dashboard/?carrier=${encodeURIComponent(event.target.value)}`)
                }
                className="rounded-lg border border-paper/15 bg-[#071421] px-2 py-1 text-sm"
              >
                {carriers.length === 0 ? (
                  <option value={carrierId}>{carrier?.legal_name ?? DEMO_FLEET}</option>
                ) : (
                  carriers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.legal_name}
                      {item.usdot ? ` · USDOT ${item.usdot}` : ""}
                    </option>
                  ))
                )}
              </select>
              <p className="mono text-[11px] text-paper/45">
                {carrier?.source === "fmcsa"
                  ? `${carrier.city ?? ""}, ${carrier.state ?? ""} · public FMCSA record`
                  : carrier?.source === "csv"
                    ? "Loaded from a telematics CSV"
                    : DEMO_REGION}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="rounded-full border border-paper/15 px-4 py-2 text-sm text-paper/80 hover:bg-paper/5">
              Marketing
            </Link>
            <Link href="/live/" className="rounded-full border border-paper/15 px-4 py-2 text-sm text-paper/80 hover:bg-paper/5">
              Ingest USDOT
            </Link>
            <Link href="/pilot/" className="rounded-full border border-paper/15 px-4 py-2 text-sm text-paper/80 hover:bg-paper/5">
              Book pilot
            </Link>
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
        {error ? (
          <p className="rounded-2xl border border-danger/40 bg-danger/15 px-4 py-3 text-sm">{error}</p>
        ) : null}
        <p className="rounded-2xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-paper/80">
          <span className="font-semibold text-amber-2">Live server + SQLite:</span> Run agent, approve, close a work
          order, or ingest a CSV — then refresh. The close loop stays in the database.
        </p>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
            label="Est. downtime saved"
            value={metrics.processedAlerts === 0 ? "—" : formatMoney(metrics.estimatedSavings)}
            hint={`${formatMoney(DOWNTIME_PER_HOUR)}/hr × ${Math.round(DOWNTIME_PROBABILITY * 100)}% downtime risk`}
          />
          <Kpi
            label="Proof pack ready"
            value={metrics.processedAlerts === 0 ? "—" : `${metrics.proofReady}`}
            hint={`${proof.waitingHuman} waiting on a human · ${metrics.openCritical} critical still open`}
          />
        </section>

        <Panel title="2026 proof pack" meta="What an insurer or safety director asks for at renewal">
          <div className="dash-scroll max-h-[240px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#10283f] text-[11px] uppercase tracking-wide text-paper/45">
                <tr>
                  <th className="px-4 py-2 font-medium">Event</th>
                  <th className="px-4 py-2 font-medium">Unit</th>
                  <th className="px-4 py-2 font-medium">Action</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {proof.rows.map((row) => (
                  <tr key={row.alert.id} className="border-t border-paper/8">
                    <td className="px-4 py-2">{row.alert.title}</td>
                    <td className="px-4 py-2">{row.unit}</td>
                    <td className="px-4 py-2 text-paper/70">
                      {row.decision
                        ? row.decision.action === "escalate"
                          ? "Human review"
                          : "Auto-closed / coached"
                        : "Sitting — no proof yet"}
                    </td>
                    <td className="px-4 py-2">
                      <StatusPill status={row.alert.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel
            title="Open alerts feed"
            meta={`${state.alerts.length} total · ${carrier?.source === "fmcsa" ? "FMCSA SMS" : carrier?.source === "csv" ? "CSV import" : "Heartland seed"}`}
          >
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

          <Panel title="Work orders" meta={`${state.workOrders.length} in SQLite`}>
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
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Close</th>
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
                          <td className="px-4 py-2 uppercase">{wo.status}</td>
                          <td className="px-4 py-2">
                            {wo.status === "completed" || wo.status === "cancelled" ? (
                              <span className="text-xs text-paper/40">Done</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleWorkOrder(wo.id, "completed")}
                                className="rounded-full border border-paper/20 px-2 py-1 text-[11px] hover:bg-paper/10"
                              >
                                Mark complete
                              </button>
                            )}
                          </td>
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

          <Panel title="Fleet strip" meta={`${state.trucks.length} units`}>
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

        <Panel title="Load a real alert CSV" meta="What a fleet can export today without Samsara OAuth">
          <div className="space-y-3 px-4 py-4 text-sm text-paper/75">
            <p>
              Ask for the last two weeks of alerts. Columns we accept:{" "}
              <span className="mono text-xs">unit, code, title, detail, category, severity, source</span>.{" "}
              <a className="underline" href="/sample-alerts.csv" download>
                Download the sample
              </a>
              .
            </p>
            <input
              value={csvName}
              onChange={(event) => setCsvName(event.target.value)}
              placeholder="New fleet name (only if this is a new carrier)"
              className="w-full rounded-lg border border-paper/10 bg-[#071421] px-3 py-2 text-sm outline-none focus:border-amber"
            />
            <label className="block">
              <span className="sr-only">Alert CSV</span>
              <input
                type="file"
                accept=".csv,text/csv"
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleCsv(file, Boolean(csvName.trim()));
                  event.target.value = "";
                }}
                className="text-sm"
              />
            </label>
            <p className="text-xs text-paper/45">
              Leave the name blank to add rows to the carrier you are looking at. Type a name to create a new
              carrier in SQLite, run the agent, and switch the console to it.
            </p>
          </div>
        </Panel>

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
