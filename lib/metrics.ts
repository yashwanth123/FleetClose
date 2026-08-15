import type { DemoState, RoiMetrics } from "./types";

/** Conservative mid-market unplanned downtime, used only for the demo ROI story. */
export const DOWNTIME_PER_HOUR = 175;
export const BASELINE_HOURS = 4.5;
export const AGENT_MINUTES = 3;
/** Share of sitting alerts that would have become real downtime if ignored. */
export const DOWNTIME_PROBABILITY = 0.32;

export function computeRoi(state: DemoState, now = Date.now()): RoiMetrics {
  const openAlerts = state.alerts.filter((alert) => alert.status === "open").length;
  const autoResolved = state.alerts.filter((alert) => alert.status === "auto_closed").length;
  const escalated = state.alerts.filter((alert) =>
    ["escalated", "approved", "rejected"].includes(alert.status),
  ).length;
  const processedAlerts = autoResolved + escalated;
  const autoResolvePct = processedAlerts === 0 ? 0 : (autoResolved / processedAlerts) * 100;

  const acted = state.alerts.filter((alert) => alert.status !== "open");
  const actionTimes = acted.map((alert) => {
    const decision = state.decisions.find((item) => item.alertId === alert.id);
    const start = new Date(alert.createdAt).getTime();
    const end = decision ? new Date(decision.decidedAt).getTime() : now;
    return Math.max(AGENT_MINUTES, Math.round((end - start) / 60_000));
  });

  const avgTimeToActionMinutes =
    actionTimes.length === 0
      ? 0
      : Math.round(actionTimes.reduce((sum, value) => sum + value, 0) / actionTimes.length);

  const closedForSavings = state.alerts.filter((alert) =>
    ["auto_closed", "approved"].includes(alert.status),
  ).length;
  const hoursSaved = closedForSavings * (BASELINE_HOURS - AGENT_MINUTES / 60) * DOWNTIME_PROBABILITY;
  const estimatedSavings = Math.round(hoursSaved * DOWNTIME_PER_HOUR);

  return {
    openAlerts,
    processedAlerts,
    autoResolved,
    escalated,
    autoResolvePct,
    avgTimeToActionMinutes,
    baselineHours: BASELINE_HOURS,
    estimatedSavings,
    hoursSaved,
  };
}
