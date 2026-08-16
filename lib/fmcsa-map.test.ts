import assert from "node:assert/strict";
import { test } from "node:test";
import { runAgent } from "./agent";
import { mapCode, mapSeverity, parseInspDate, stateFromViolations } from "./fmcsa-map";

test("parses FMCSA inspection dates", () => {
  assert.equal(parseInspDate("25-MAY-26").startsWith("2026-05-25"), true);
  assert.equal(parseInspDate("31-JUL-24").startsWith("2024-07-31"), true);
});

test("maps tire and brake language to the same codes the agent already knows", () => {
  assert.equal(mapCode("Tires - leaking", "Tires", "Vehicle Maintenance"), "TIRE_PSI");
  assert.equal(mapCode("Brake hose chafing", "Brakes All Others", "Vehicle Maintenance"), "BRAKE_FAULT");
  assert.equal(mapSeverity("true", "2"), "critical");
  assert.equal(mapSeverity("false", "3"), "routine");
});

test("real-shaped violations become a runnable agent state", () => {
  const state = stateFromViolations("NIECE TRUCKING INC", "DES MOINES", "IA", [
    {
      unique_id: "1",
      insp_date: "25-MAY-26",
      viol_code: "39375A3TAOL",
      basic_desc: "Vehicle Maintenance",
      oos_indicator: "true",
      severity_weight: "8",
      section_desc: "Tires - leaking or inflation less than 50%",
      group_desc: "Tires",
    },
    {
      unique_id: "2",
      insp_date: "14-MAY-26",
      viol_code: "39395A",
      basic_desc: "Vehicle Maintenance",
      oos_indicator: "false",
      severity_weight: "2",
      section_desc: "No/discharged/unsecured fire extinguisher",
      group_desc: "Emergency Equipment",
    },
  ]);
  const after = runAgent(state);
  assert.equal(after.alerts.length, 2);
  assert.equal(after.alerts.filter((alert) => alert.status === "open").length, 0);
  assert.equal(after.alerts.find((alert) => alert.code === "TIRE_PSI")?.status, "escalated");
  assert.equal(after.alerts.find((alert) => alert.title.includes("fire extinguisher"))?.status, "auto_closed");
});
