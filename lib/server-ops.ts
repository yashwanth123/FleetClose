import { resolveEscalation, runAgent, updateWorkOrder } from "./agent";
import { applyCsvAlerts, emptyState, parseAlertCsv } from "./csv-alerts";
import { listViolations, lookupCarrier } from "./fmcsa";
import { stateFromViolations } from "./fmcsa-map";
import { computeRoi } from "./metrics";
import {
  HEARTLAND_ID,
  ensureHeartland,
  getCarrier,
  listCarriers,
  loadState,
  resetHeartland,
  saveState,
  upsertCarrier,
} from "./repo";
import type { WorkOrderStatus } from "./types";

export function getHeartlandState() {
  ensureHeartland();
  const state = loadState(HEARTLAND_ID);
  if (!state) throw new Error("Heartland state missing");
  return { carrierId: HEARTLAND_ID, carrier: getCarrier(HEARTLAND_ID), state, metrics: computeRoi(state) };
}

export function runCarrierAgent(carrierId: string) {
  if (carrierId === HEARTLAND_ID) ensureHeartland();
  const current = loadState(carrierId);
  if (!current) throw new Error("Unknown carrier");
  const state = runAgent(current);
  saveState(carrierId, state);
  return { carrierId, carrier: getCarrier(carrierId), state, metrics: computeRoi(state) };
}

export function resolveCarrierEscalation(
  carrierId: string,
  escalationId: string,
  action: "approved" | "rejected",
  note?: string,
) {
  const current = loadState(carrierId);
  if (!current) throw new Error("Unknown carrier");
  const state = resolveEscalation(current, escalationId, action, note);
  saveState(carrierId, state);
  return { carrierId, carrier: getCarrier(carrierId), state, metrics: computeRoi(state) };
}

export async function ingestUsdot(dot: string) {
  const profile = await lookupCarrier(dot);
  if (!profile?.dot_number) throw new Error("No FMCSA census row for that USDOT");
  const violations = await listViolations(profile.dot_number);
  if (violations.length === 0) {
    throw new Error(`${profile.legal_name} is in the census, but this SMS snapshot has no public violations`);
  }
  const carrierId = `usdot-${profile.dot_number}`;
  upsertCarrier({
    id: carrierId,
    usdot: profile.dot_number,
    legal_name: profile.legal_name ?? "Unknown carrier",
    city: profile.phy_city ?? null,
    state: profile.phy_state ?? null,
    power_units: Number(profile.power_units ?? 0) || null,
    drivers: Number(profile.total_drivers ?? 0) || null,
    safety_rating: profile.safety_rating ?? null,
    source: "fmcsa",
    last_agent_run_at: null,
  });
  const seeded = stateFromViolations(
    profile.legal_name ?? "Carrier",
    profile.phy_city ?? "",
    profile.phy_state ?? "",
    violations,
  );
  const state = runAgent(seeded);
  saveState(carrierId, state);
  return { carrierId, carrier: getCarrier(carrierId), state, metrics: computeRoi(state) };
}

export function resetDemo() {
  const state = resetHeartland();
  if (!state) throw new Error("Reset failed");
  return { carrierId: HEARTLAND_ID, carrier: getCarrier(HEARTLAND_ID), state, metrics: computeRoi(state) };
}

export function getCarrierState(carrierId: string) {
  if (carrierId === HEARTLAND_ID) return getHeartlandState();
  const state = loadState(carrierId);
  if (!state) throw new Error("Unknown carrier");
  return { carrierId, carrier: getCarrier(carrierId), state, metrics: computeRoi(state) };
}

export function listOpsCarriers() {
  ensureHeartland();
  return listCarriers();
}

export function ingestAlertCsv(carrierId: string, csv: string, run = true) {
  if (carrierId === HEARTLAND_ID) ensureHeartland();
  const current = loadState(carrierId);
  if (!current) throw new Error("Unknown carrier");
  const rows = parseAlertCsv(csv);
  if (rows.length === 0) throw new Error("CSV needs a header row and at least one alert");
  const seeded = applyCsvAlerts(current, rows, carrierId);
  const state = run ? runAgent(seeded) : seeded;
  saveState(carrierId, state);
  return { carrierId, carrier: getCarrier(carrierId), state, metrics: computeRoi(state) };
}

export function createCarrierFromCsv(name: string, csv: string, run = true) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  const carrierId = `csv-${slug || "fleet"}-${Date.now().toString(36)}`;
  upsertCarrier({
    id: carrierId,
    usdot: null,
    legal_name: name.trim() || "CSV fleet",
    city: null,
    state: null,
    power_units: null,
    drivers: null,
    safety_rating: null,
    source: "csv",
    last_agent_run_at: null,
  });
  saveState(carrierId, emptyState(`Created ${name} from a telematics CSV export.`));
  return ingestAlertCsv(carrierId, csv, run);
}

export function updateCarrierWorkOrder(carrierId: string, workOrderId: string, status: WorkOrderStatus) {
  const current = loadState(carrierId);
  if (!current) throw new Error("Unknown carrier");
  const state = updateWorkOrder(current, workOrderId, status);
  saveState(carrierId, state);
  return { carrierId, carrier: getCarrier(carrierId), state, metrics: computeRoi(state) };
}
