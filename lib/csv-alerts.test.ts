import assert from "node:assert/strict";
import { test } from "node:test";
import { applyCsvAlerts, emptyState, parseAlertCsv } from "./csv-alerts";
import { runAgent } from "./agent";

const SAMPLE = `unit,code,title,detail,category,severity,source,driver,location
HF-107,BRAKE_FAULT,ABS / brake circuit fault,Low air warning,safety,critical,Samsara,Andre Cole,I-35
HF-101,OIL_DUE,Oil change window opened,PM due,maintenance,routine,Samsara,Marcus Hale,Iowa City
HF-122,CAMERA_DISTRACT,Handheld phone while rolling,Clip flagged,telematics,urgent,Motive,Ben Walker,St. Joseph
`;

test("parses a telematics-style alert CSV", () => {
  const rows = parseAlertCsv(SAMPLE);
  assert.equal(rows.length, 3);
  assert.equal(rows[0]?.code, "BRAKE_FAULT");
  assert.equal(rows[2]?.source, "Motive");
});

test("CSV alerts become trucks and a runnable agent state", () => {
  const rows = parseAlertCsv(SAMPLE);
  const seeded = applyCsvAlerts(emptyState("csv test"), rows, "csv-test");
  assert.equal(seeded.trucks.length, 3);
  assert.equal(new Set(seeded.trucks.map((truck) => truck.id)).size, 3);
  const after = runAgent(seeded);
  assert.equal(after.alerts.filter((alert) => alert.status === "open").length, 0);
  assert.ok(after.workOrders.length >= 1);
  assert.ok(after.escalations.length >= 1);
});
