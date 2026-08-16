import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

test("Heartland seed persists through SQLite", async () => {
  const dbFile = path.join(os.tmpdir(), `fleetclose-test-${Date.now()}.db`);
  process.env.FLEETCLOSE_DB = dbFile;
  const { runAgent } = await import("./agent");
  const { resetDbCache } = await import("./db");
  const { HEARTLAND_ID, ensureHeartland, loadState, saveState } = await import("./repo");
  resetDbCache();
  ensureHeartland();
  const first = loadState(HEARTLAND_ID);
  assert.ok(first);
  assert.equal(first.alerts.length, 20);
  const after = runAgent(first);
  saveState(HEARTLAND_ID, after);
  const reloaded = loadState(HEARTLAND_ID);
  assert.ok(reloaded);
  assert.equal(reloaded.alerts.filter((alert) => alert.status === "open").length, 0);
  assert.ok(reloaded.workOrders.length > 0);
  resetDbCache();
  fs.rmSync(dbFile, { force: true });
  fs.rmSync(`${dbFile}-wal`, { force: true });
  fs.rmSync(`${dbFile}-shm`, { force: true });
});

test("FMCSA rows that share an inspection id still persist", async () => {
  const dbFile = path.join(os.tmpdir(), `fleetclose-fmcsa-${Date.now()}.db`);
  process.env.FLEETCLOSE_DB = dbFile;
  const { resetDbCache } = await import("./db");
  const { stateFromViolations } = await import("./fmcsa-map");
  const { saveState, loadState, upsertCarrier } = await import("./repo");
  resetDbCache();
  upsertCarrier({
    id: "usdot-test",
    usdot: "638655",
    legal_name: "Test",
    city: "Des Moines",
    state: "IA",
    power_units: 1,
    drivers: 1,
    safety_rating: null,
    source: "fmcsa",
    last_agent_run_at: null,
  });
  const seeded = stateFromViolations("Test", "Des Moines", "IA", [
    { unique_id: "shared", viol_code: "39347E", section_desc: "Brake tubing", group_desc: "Brakes", basic_desc: "Vehicle Maintenance" },
    { unique_id: "shared", viol_code: "39375A3", section_desc: "Tires - leaking", group_desc: "Tires", basic_desc: "Vehicle Maintenance" },
  ]);
  saveState("usdot-test", seeded);
  const loaded = loadState("usdot-test");
  assert.ok(loaded);
  assert.equal(loaded.trucks.length, 2);
  assert.equal(new Set(loaded.trucks.map((truck) => truck.id)).size, 2);
  resetDbCache();
  fs.rmSync(dbFile, { force: true });
  fs.rmSync(`${dbFile}-wal`, { force: true });
  fs.rmSync(`${dbFile}-shm`, { force: true });
});
