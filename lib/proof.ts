import { truckById } from "./seed";
import type { Alert, DemoState } from "./types";

/** Events an insurer, safety director, or shipper will ask about in 2026. */
export const PROOF_CODES = new Set([
  "BRAKE_FAULT",
  "OVERHEAT",
  "AIR_LEAK",
  "HOS_CRIT",
  "COLLISION",
  "CAMERA_DISTRACT",
  "FOLLOW_DIST",
  "REEFER_TEMP",
]);

export function isProofEvent(alert: Alert) {
  return PROOF_CODES.has(alert.code) || alert.category === "safety" || alert.severity === "critical";
}

export function isCoachOnly(alert: Alert) {
  return ["IDLE_HIGH", "SEATBELT", "CAMERA_DISTRACT", "FOLLOW_DIST"].includes(alert.code);
}

export function buildProofPack(state: DemoState) {
  const rows = state.alerts.filter(isProofEvent).map((alert) => {
    const truck = truckById(state.trucks, alert.truckId);
    const decision = state.decisions.find((item) => item.alertId === alert.id);
    const escalation = state.escalations.find((item) => item.alertId === alert.id);
    return {
      alert,
      unit: truck?.unit ?? alert.truckId,
      driver: truck?.driver ?? "—",
      decision,
      escalation,
      closed: alert.status !== "open" && alert.status !== "escalated",
    };
  });

  return {
    rows,
    ready: rows.filter((row) => row.closed).length,
    openCritical: state.alerts.filter((alert) => alert.severity === "critical" && alert.status === "open").length,
    waitingHuman: rows.filter((row) => row.alert.status === "escalated").length,
  };
}
