import { getDb } from "./db";
import { makeId } from "./ids";
import { createSeedState } from "./seed";
import type { DemoState } from "./types";
import type { PilotLead as FormLead } from "./storage";

export const HEARTLAND_ID = "heartland";

export type CarrierRow = {
  id: string;
  usdot: string | null;
  legal_name: string;
  city: string | null;
  state: string | null;
  power_units: number | null;
  drivers: number | null;
  safety_rating: string | null;
  source: string;
  last_agent_run_at: string | null;
  created_at: string;
};

export function upsertCarrier(row: Omit<CarrierRow, "created_at"> & { created_at?: string }) {
  const db = getDb();
  db.prepare(
    `INSERT INTO carriers (id, usdot, legal_name, city, state, power_units, drivers, safety_rating, source, last_agent_run_at, created_at)
     VALUES (@id, @usdot, @legal_name, @city, @state, @power_units, @drivers, @safety_rating, @source, @last_agent_run_at, @created_at)
     ON CONFLICT(id) DO UPDATE SET
       usdot=excluded.usdot, legal_name=excluded.legal_name, city=excluded.city, state=excluded.state,
       power_units=excluded.power_units, drivers=excluded.drivers, safety_rating=excluded.safety_rating,
       source=excluded.source, last_agent_run_at=excluded.last_agent_run_at`,
  ).run({
    ...row,
    created_at: row.created_at ?? new Date().toISOString(),
  });
}

export function getCarrier(id: string) {
  return getDb().prepare("SELECT * FROM carriers WHERE id = ?").get(id) as CarrierRow | undefined;
}

export function listCarriers() {
  return getDb().prepare("SELECT * FROM carriers ORDER BY created_at DESC").all() as CarrierRow[];
}

export function saveState(carrierId: string, state: DemoState) {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare("UPDATE carriers SET last_agent_run_at = ? WHERE id = ?").run(state.lastAgentRunAt ?? null, carrierId);
    for (const table of ["trucks", "alerts", "decisions", "work_orders", "notifications", "escalations", "audit"]) {
      db.prepare(`DELETE FROM ${table} WHERE carrier_id = ?`).run(carrierId);
    }
    const insertTruck = db.prepare(
      `INSERT INTO trucks VALUES (@id,@carrier_id,@unit,@vin,@year,@make,@model,@type,@driver,@location,@status,@miles)`,
    );
    for (const truck of state.trucks) {
      insertTruck.run({ ...truck, carrier_id: carrierId });
    }
    const insertAlert = db.prepare(
      `INSERT INTO alerts VALUES (@id,@carrier_id,@truck_id,@code,@title,@detail,@category,@severity,@source,@created_at,@status)`,
    );
    for (const alert of state.alerts) {
      insertAlert.run({
        id: alert.id,
        carrier_id: carrierId,
        truck_id: alert.truckId,
        code: alert.code,
        title: alert.title,
        detail: alert.detail,
        category: alert.category,
        severity: alert.severity,
        source: alert.source,
        created_at: alert.createdAt,
        status: alert.status,
      });
    }
    const insertDec = db.prepare(
      `INSERT INTO decisions VALUES (@id,@carrier_id,@alert_id,@action,@reason,@confidence,@recommended_plan,@decided_at)`,
    );
    for (const decision of state.decisions) {
      insertDec.run({
        id: decision.id,
        carrier_id: carrierId,
        alert_id: decision.alertId,
        action: decision.action,
        reason: decision.reason,
        confidence: decision.confidence,
        recommended_plan: decision.recommendedPlan,
        decided_at: decision.decidedAt,
      });
    }
    const insertWo = db.prepare(
      `INSERT INTO work_orders VALUES (@id,@carrier_id,@alert_id,@truck_id,@title,@notes,@priority,@assignee,@shop,@eta_hours,@status,@created_at)`,
    );
    for (const wo of state.workOrders) {
      insertWo.run({
        id: wo.id,
        carrier_id: carrierId,
        alert_id: wo.alertId,
        truck_id: wo.truckId,
        title: wo.title,
        notes: wo.notes,
        priority: wo.priority,
        assignee: wo.assignee,
        shop: wo.shop,
        eta_hours: wo.etaHours,
        status: wo.status,
        created_at: wo.createdAt,
      });
    }
    const insertNtf = db.prepare(
      `INSERT INTO notifications VALUES (@id,@carrier_id,@channel,@dest,@subject,@body,@sent_at,@related_alert_id)`,
    );
    for (const item of state.notifications) {
      insertNtf.run({
        id: item.id,
        carrier_id: carrierId,
        channel: item.channel,
        dest: item.to,
        subject: item.subject,
        body: item.body,
        sent_at: item.sentAt,
        related_alert_id: item.relatedAlertId,
      });
    }
    const insertEsc = db.prepare(
      `INSERT INTO escalations VALUES (@id,@carrier_id,@alert_id,@decision_id,@risk,@recommended_plan,@status,@resolved_at,@resolver_note)`,
    );
    for (const item of state.escalations) {
      insertEsc.run({
        id: item.id,
        carrier_id: carrierId,
        alert_id: item.alertId,
        decision_id: item.decisionId,
        risk: item.risk,
        recommended_plan: item.recommendedPlan,
        status: item.status,
        resolved_at: item.resolvedAt ?? null,
        resolver_note: item.resolverNote ?? null,
      });
    }
    const insertAud = db.prepare(
      `INSERT INTO audit VALUES (@id,@carrier_id,@at,@actor,@type,@message,@alert_id)`,
    );
    for (const item of state.audit) {
      insertAud.run({
        id: item.id,
        carrier_id: carrierId,
        at: item.at,
        actor: item.actor,
        type: item.type,
        message: item.message,
        alert_id: item.alertId ?? null,
      });
    }
  });
  tx();
}

export function loadState(carrierId: string): DemoState | null {
  const db = getDb();
  const carrier = getCarrier(carrierId);
  if (!carrier) return null;
  const trucks = db.prepare("SELECT * FROM trucks WHERE carrier_id = ?").all(carrierId) as Array<Record<string, unknown>>;
  const alerts = db.prepare("SELECT * FROM alerts WHERE carrier_id = ?").all(carrierId) as Array<Record<string, unknown>>;
  const decisions = db.prepare("SELECT * FROM decisions WHERE carrier_id = ?").all(carrierId) as Array<Record<string, unknown>>;
  const workOrders = db.prepare("SELECT * FROM work_orders WHERE carrier_id = ?").all(carrierId) as Array<Record<string, unknown>>;
  const notifications = db.prepare("SELECT * FROM notifications WHERE carrier_id = ?").all(carrierId) as Array<Record<string, unknown>>;
  const escalations = db.prepare("SELECT * FROM escalations WHERE carrier_id = ?").all(carrierId) as Array<Record<string, unknown>>;
  const audit = db.prepare("SELECT * FROM audit WHERE carrier_id = ?").all(carrierId) as Array<Record<string, unknown>>;

  return {
    trucks: trucks.map((row) => ({
      id: String(row.id),
      unit: String(row.unit),
      vin: String(row.vin),
      year: Number(row.year),
      make: String(row.make),
      model: String(row.model),
      type: row.type as DemoState["trucks"][number]["type"],
      driver: String(row.driver),
      location: String(row.location),
      status: row.status as DemoState["trucks"][number]["status"],
      miles: Number(row.miles),
    })),
    alerts: alerts.map((row) => ({
      id: String(row.id),
      truckId: String(row.truck_id),
      code: String(row.code),
      title: String(row.title),
      detail: String(row.detail),
      category: row.category as DemoState["alerts"][number]["category"],
      severity: row.severity as DemoState["alerts"][number]["severity"],
      source: row.source as DemoState["alerts"][number]["source"],
      createdAt: String(row.created_at),
      status: row.status as DemoState["alerts"][number]["status"],
    })),
    decisions: decisions.map((row) => ({
      id: String(row.id),
      alertId: String(row.alert_id),
      action: row.action as DemoState["decisions"][number]["action"],
      reason: String(row.reason),
      confidence: Number(row.confidence),
      recommendedPlan: String(row.recommended_plan),
      decidedAt: String(row.decided_at),
    })),
    workOrders: workOrders.map((row) => ({
      id: String(row.id),
      alertId: String(row.alert_id),
      truckId: String(row.truck_id),
      title: String(row.title),
      notes: String(row.notes),
      priority: row.priority as DemoState["workOrders"][number]["priority"],
      assignee: String(row.assignee),
      shop: String(row.shop),
      etaHours: Number(row.eta_hours),
      status: row.status as DemoState["workOrders"][number]["status"],
      createdAt: String(row.created_at),
    })),
    notifications: notifications.map((row) => ({
      id: String(row.id),
      channel: row.channel as DemoState["notifications"][number]["channel"],
      to: String(row.dest),
      subject: String(row.subject),
      body: String(row.body),
      sentAt: String(row.sent_at),
      relatedAlertId: String(row.related_alert_id),
    })),
    escalations: escalations.map((row) => ({
      id: String(row.id),
      alertId: String(row.alert_id),
      decisionId: String(row.decision_id),
      risk: String(row.risk),
      recommendedPlan: String(row.recommended_plan),
      status: row.status as DemoState["escalations"][number]["status"],
      resolvedAt: row.resolved_at ? String(row.resolved_at) : undefined,
      resolverNote: row.resolver_note ? String(row.resolver_note) : undefined,
    })),
    audit: audit.map((row) => ({
      id: String(row.id),
      at: String(row.at),
      actor: row.actor as DemoState["audit"][number]["actor"],
      type: String(row.type),
      message: String(row.message),
      alertId: row.alert_id ? String(row.alert_id) : undefined,
    })),
    lastAgentRunAt: carrier.last_agent_run_at ?? undefined,
  };
}

export function ensureHeartland() {
  if (getCarrier(HEARTLAND_ID)) return HEARTLAND_ID;
  upsertCarrier({
    id: HEARTLAND_ID,
    usdot: null,
    legal_name: "Heartland Freight (simulated)",
    city: "Des Moines",
    state: "IA",
    power_units: 24,
    drivers: 24,
    safety_rating: null,
    source: "seed",
    last_agent_run_at: null,
  });
  saveState(HEARTLAND_ID, createSeedState());
  return HEARTLAND_ID;
}

export function resetHeartland() {
  upsertCarrier({
    id: HEARTLAND_ID,
    usdot: null,
    legal_name: "Heartland Freight (simulated)",
    city: "Des Moines",
    state: "IA",
    power_units: 24,
    drivers: 24,
    safety_rating: null,
    source: "seed",
    last_agent_run_at: null,
  });
  saveState(HEARTLAND_ID, createSeedState());
  return loadState(HEARTLAND_ID);
}

export function saveLead(lead: FormLead) {
  getDb()
    .prepare(
      `INSERT INTO pilot_leads VALUES (@id,@name,@email,@company,@trucks,@role,@message,@submitted_at)`,
    )
    .run({
      id: makeId("lead"),
      name: lead.name,
      email: lead.email,
      company: lead.company,
      trucks: lead.trucks,
      role: lead.role,
      message: lead.message,
      submitted_at: lead.submittedAt,
    });
}

export function leadCount() {
  const row = getDb().prepare("SELECT COUNT(*) as n FROM pilot_leads").get() as { n: number };
  return row.n;
}

