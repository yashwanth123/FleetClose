import { makeId } from "./ids";
import { mapCode } from "./fmcsa-map";
import type { Alert, AlertCategory, DemoState, Severity, Truck } from "./types";

export type CsvAlertRow = {
  unit: string;
  code: string;
  title: string;
  detail: string;
  category: AlertCategory;
  severity: Severity;
  source: Alert["source"];
  driver: string;
  location: string;
};

const HEADER_ALIASES: Record<string, keyof CsvAlertRow> = {
  unit: "unit",
  truck: "unit",
  truck_unit: "unit",
  unit_number: "unit",
  vehicle: "unit",
  code: "code",
  alert_code: "code",
  event_code: "code",
  type: "code",
  title: "title",
  event: "title",
  alert: "title",
  name: "title",
  detail: "detail",
  description: "detail",
  notes: "detail",
  message: "detail",
  category: "category",
  severity: "severity",
  priority: "severity",
  source: "source",
  vendor: "source",
  driver: "driver",
  location: "location",
  city: "location",
};

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/\s+/g, "_");
}

function asCategory(value: string): AlertCategory {
  const text = value.toLowerCase();
  if (text.includes("safe")) return "safety";
  if (text.includes("comply") || text.includes("hos") || text.includes("dot")) return "compliance";
  if (text.includes("camera") || text.includes("telematic")) return "telematics";
  return "maintenance";
}

function asSeverity(value: string): Severity {
  const text = value.toLowerCase();
  if (text.includes("crit") || text === "p1" || text === "high") return "critical";
  if (text.includes("urg") || text === "p2" || text === "med" || text === "medium") return "urgent";
  return "routine";
}

function asSource(value: string): Alert["source"] {
  const text = value.toLowerCase();
  if (text.includes("samsara")) return "Samsara";
  if (text.includes("geotab")) return "Geotab";
  if (text.includes("motive")) return "Motive";
  if (text.includes("eld")) return "ELD";
  if (text.includes("fmcsa")) return "FMCSA";
  return "Shop";
}

export function parseAlertCsv(text: string): CsvAlertRow[] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0] ?? "").map(normalizeHeader);
  const mapped = headers.map((header) => HEADER_ALIASES[header]);
  if (!mapped.includes("unit") && !mapped.includes("title") && !mapped.includes("code")) {
    throw new Error("CSV needs a header row with at least unit, title, or code");
  }

  return lines.slice(1).flatMap((line) => {
    const cells = splitCsvLine(line);
    const raw: Partial<Record<keyof CsvAlertRow, string>> = {};
    mapped.forEach((key, index) => {
      if (key) raw[key] = cells[index] ?? "";
    });
    const unit = (raw.unit || "UNASSIGNED").toUpperCase();
    const title = raw.title || raw.code || "Imported alert";
    const detail = raw.detail || title;
    const code = raw.code || mapCode(title, detail, raw.category);
    return [
      {
        unit,
        code,
        title,
        detail,
        category: raw.category ? asCategory(raw.category) : asCategory(`${title} ${detail}`),
        severity: raw.severity ? asSeverity(raw.severity) : asSeverity(`${title} ${detail} ${code}`),
        source: asSource(raw.source ?? ""),
        driver: raw.driver || "Unassigned",
        location: raw.location || "Unknown",
      },
    ];
  });
}

function truckIdFor(carrierId: string, unit: string) {
  return `${carrierId}-${unit.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function emptyState(message: string): DemoState {
  return {
    trucks: [],
    alerts: [],
    decisions: [],
    workOrders: [],
    notifications: [],
    escalations: [],
    audit: [
      {
        id: makeId("aud"),
        at: new Date().toISOString(),
        actor: "human",
        type: "csv.load",
        message,
      },
    ],
  };
}

export function applyCsvAlerts(state: DemoState, rows: CsvAlertRow[], carrierId: string): DemoState {
  const now = new Date().toISOString();
  const trucks = [...state.trucks];
  const alerts = [...state.alerts];

  for (const row of rows) {
    let truck = trucks.find((item) => item.unit.toUpperCase() === row.unit);
    if (!truck) {
      truck = {
        id: truckIdFor(carrierId, row.unit),
        unit: row.unit,
        vin: "csv-import",
        year: 2022,
        make: "Unknown",
        model: "CMV",
        type: "dry_van",
        driver: row.driver,
        location: row.location,
        status: "available",
        miles: 0,
      } satisfies Truck;
      trucks.push(truck);
    }
    alerts.push({
      id: makeId("csv"),
      truckId: truck.id,
      code: row.code,
      title: row.title,
      detail: row.detail,
      category: row.category,
      severity: row.severity,
      source: row.source,
      createdAt: now,
      status: "open",
    });
  }

  return {
    ...state,
    trucks,
    alerts,
    audit: [
      {
        id: makeId("aud"),
        at: now,
        actor: "human",
        type: "csv.ingest",
        message: `Imported ${rows.length} alerts from CSV.`,
      },
      ...state.audit,
    ],
  };
}
