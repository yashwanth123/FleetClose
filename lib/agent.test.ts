import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveEscalation, runAgent, shouldEscalate } from "./agent";
import { computeRoi } from "./metrics";
import { buildProofPack, isCoachOnly } from "./proof";
import { createSeedState } from "./seed";

test("seed starts with 24 trucks and 20 open alerts", () => {
  const state = createSeedState();
  assert.equal(state.trucks.length, 24);
  assert.equal(state.alerts.length, 20);
  assert.ok(state.alerts.every((alert) => alert.status === "open"));
});

test("agent closes every open alert and never leaves a decision without a reason", () => {
  const after = runAgent(createSeedState());
  assert.equal(after.alerts.filter((alert) => alert.status === "open").length, 0);
  assert.equal(after.decisions.length, 20);
  for (const decision of after.decisions) {
    assert.ok(decision.reason.length > 20);
    assert.ok(decision.recommendedPlan.length > 20);
    assert.ok(decision.confidence > 0 && decision.confidence <= 1);
  }
});

test("routine work auto-closes; unsafe and camera-risk events escalate", () => {
  const after = runAgent(createSeedState());
  const auto = after.alerts.filter((alert) => alert.status === "auto_closed");
  const escalated = after.alerts.filter((alert) => alert.status === "escalated");

  assert.equal(auto.length, 13);
  assert.equal(escalated.length, 7);
  assert.ok(auto.every((alert) => !shouldEscalate(alert)));
  assert.ok(escalated.every((alert) => shouldEscalate(alert)));

  const codes = new Set(escalated.map((alert) => alert.code));
  for (const code of ["BRAKE_FAULT", "OVERHEAT", "AIR_LEAK", "HOS_CRIT", "COLLISION", "CAMERA_DISTRACT", "FOLLOW_DIST"]) {
    assert.ok(codes.has(code), `missing escalation ${code}`);
  }
});

test("camera and idle coaching do not create shop work orders", () => {
  const after = runAgent(createSeedState());
  const coachAlerts = after.alerts.filter((alert) => isCoachOnly(alert) && alert.status === "auto_closed");
  assert.ok(coachAlerts.length >= 2);
  for (const alert of after.alerts.filter(isCoachOnly)) {
    assert.equal(after.workOrders.some((wo) => wo.alertId === alert.id), false);
  }
  assert.equal(after.workOrders.length, 11);
  assert.ok(after.notifications.length > 0);
});

test("approving a crash parks the truck; approving a phone clip does not", () => {
  let state = runAgent(createSeedState());
  const crash = state.escalations.find((item) => {
    const alert = state.alerts.find((row) => row.id === item.alertId);
    return alert?.code === "COLLISION";
  });
  const phone = state.escalations.find((item) => {
    const alert = state.alerts.find((row) => row.id === item.alertId);
    return alert?.code === "CAMERA_DISTRACT";
  });
  assert.ok(crash && phone);

  state = resolveEscalation(state, crash.id, "approved", "Park it. Review dashcam.");
  const crashAlert = state.alerts.find((alert) => alert.code === "COLLISION");
  const crashTruck = state.trucks.find((truck) => truck.id === crashAlert?.truckId);
  assert.equal(crashAlert?.status, "approved");
  assert.equal(crashTruck?.status, "oos");
  assert.ok(state.workOrders.some((wo) => wo.alertId === crashAlert?.id));

  state = resolveEscalation(state, phone.id, "approved", "Coached. Clip in the file.");
  const phoneAlert = state.alerts.find((alert) => alert.code === "CAMERA_DISTRACT");
  const phoneTruck = state.trucks.find((truck) => truck.id === phoneAlert?.truckId);
  assert.equal(phoneAlert?.status, "approved");
  assert.notEqual(phoneTruck?.status, "oos");
  assert.equal(state.workOrders.some((wo) => wo.alertId === phoneAlert?.id), false);
});

test("rejecting an escalation leaves no work order and still writes an audit row", () => {
  let state = runAgent(createSeedState());
  const follow = state.escalations.find((item) => {
    const alert = state.alerts.find((row) => row.id === item.alertId);
    return alert?.code === "FOLLOW_DIST";
  });
  assert.ok(follow);
  state = resolveEscalation(state, follow.id, "rejected", "Already coached yesterday.");
  const alert = state.alerts.find((row) => row.code === "FOLLOW_DIST");
  assert.equal(alert?.status, "rejected");
  assert.equal(state.workOrders.some((wo) => wo.alertId === alert?.id), false);
  assert.ok(state.audit.some((row) => row.type === "human.reject" && row.alertId === alert?.id));
});

test("ROI and proof pack move after the agent runs", () => {
  const before = createSeedState();
  assert.equal(computeRoi(before).processedAlerts, 0);
  assert.equal(buildProofPack(before).ready, 0);

  const after = runAgent(before);
  const roi = computeRoi(after);
  const proof = buildProofPack(after);
  assert.equal(roi.processedAlerts, 20);
  assert.ok(roi.autoResolvePct > 50);
  assert.ok(roi.estimatedSavings > 0);
  assert.ok(proof.rows.length >= 7);
  assert.ok(proof.waitingHuman >= 1);
});
