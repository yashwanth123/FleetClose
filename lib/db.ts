import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const defaultPath = path.join(process.cwd(), "data", "fleetclose.db");

let cached: Database.Database | null = null;

export function getDb(filePath = process.env.FLEETCLOSE_DB || defaultPath) {
  if (cached && cached.name === filePath) return cached;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS carriers (
      id TEXT PRIMARY KEY,
      usdot TEXT,
      legal_name TEXT NOT NULL,
      city TEXT,
      state TEXT,
      power_units INTEGER,
      drivers INTEGER,
      safety_rating TEXT,
      source TEXT NOT NULL,
      last_agent_run_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS trucks (
      id TEXT PRIMARY KEY,
      carrier_id TEXT NOT NULL,
      unit TEXT, vin TEXT, year INTEGER, make TEXT, model TEXT,
      type TEXT, driver TEXT, location TEXT, status TEXT, miles INTEGER
    );
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      carrier_id TEXT NOT NULL,
      truck_id TEXT, code TEXT, title TEXT, detail TEXT,
      category TEXT, severity TEXT, source TEXT, created_at TEXT, status TEXT
    );
    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      carrier_id TEXT NOT NULL,
      alert_id TEXT, action TEXT, reason TEXT, confidence REAL,
      recommended_plan TEXT, decided_at TEXT
    );
    CREATE TABLE IF NOT EXISTS work_orders (
      id TEXT PRIMARY KEY,
      carrier_id TEXT NOT NULL,
      alert_id TEXT, truck_id TEXT, title TEXT, notes TEXT,
      priority TEXT, assignee TEXT, shop TEXT, eta_hours INTEGER,
      status TEXT, created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      carrier_id TEXT NOT NULL,
      channel TEXT, dest TEXT, subject TEXT, body TEXT,
      sent_at TEXT, related_alert_id TEXT
    );
    CREATE TABLE IF NOT EXISTS escalations (
      id TEXT PRIMARY KEY,
      carrier_id TEXT NOT NULL,
      alert_id TEXT, decision_id TEXT, risk TEXT, recommended_plan TEXT,
      status TEXT, resolved_at TEXT, resolver_note TEXT
    );
    CREATE TABLE IF NOT EXISTS audit (
      id TEXT PRIMARY KEY,
      carrier_id TEXT NOT NULL,
      at TEXT, actor TEXT, type TEXT, message TEXT, alert_id TEXT
    );
    CREATE TABLE IF NOT EXISTS pilot_leads (
      id TEXT PRIMARY KEY,
      name TEXT, email TEXT, company TEXT, trucks TEXT, role TEXT,
      message TEXT, submitted_at TEXT
    );
  `);
  cached = db;
  return db;
}

export function resetDbCache() {
  if (cached) {
    cached.close();
    cached = null;
  }
}
