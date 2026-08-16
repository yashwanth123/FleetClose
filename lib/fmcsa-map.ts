import type { Alert, AlertCategory, DemoState, Severity, Truck } from "./types";

const MONTHS: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

export function parseInspDate(raw?: string) {
  if (!raw) return new Date().toISOString();
  const match = raw.toUpperCase().match(/^(\d{1,2})-([A-Z]{3})-(\d{2})$/);
  if (!match) return new Date().toISOString();
  const month = MONTHS[match[2]];
  if (month === undefined) return new Date().toISOString();
  const year = 2000 + Number(match[3]);
  return new Date(Date.UTC(year, month, Number(match[1]))).toISOString();
}

export function mapBasic(basic?: string): { category: AlertCategory; code: string } {
  const value = (basic ?? "").toLowerCase();
  if (value.includes("unsafe")) return { category: "safety", code: "UNSAFE_DRIVE" };
  if (value.includes("fatigue") || value.includes("hours")) return { category: "compliance", code: "HOS_CRIT" };
  if (value.includes("fitness")) return { category: "compliance", code: "DRIVER_FIT" };
  if (value.includes("substance") || value.includes("alcohol")) return { category: "safety", code: "SUBSTANCE" };
  if (value.includes("maintenance")) return { category: "maintenance", code: "VEH_MAINT" };
  return { category: "maintenance", code: "DOT_VIOL" };
}

export function mapCode(section?: string, group?: string, basic?: string) {
  const text = `${section} ${group}`.toLowerCase();
  if (text.includes("brake")) return "BRAKE_FAULT";
  if (text.includes("tire")) return "TIRE_PSI";
  if (text.includes("light") || text.includes("lamp")) return "DOT_LIGHT";
  if (text.includes("cargo") || text.includes("securement")) return "CARGO";
  if (text.includes("speed")) return "UNSAFE_DRIVE";
  return mapBasic(basic).code;
}

export function mapSeverity(oos?: string, weight?: string): Severity {
  if (oos === "true") return "critical";
  if (Number(weight ?? 0) >= 7) return "urgent";
  return "routine";
}

type ViolationIn = {
  unique_id?: string;
  insp_date?: string;
  viol_code?: string;
  basic_desc?: string;
  oos_indicator?: string;
  severity_weight?: string;
  section_desc?: string;
  group_desc?: string;
};

export function stateFromViolations(
  carrierName: string,
  city: string,
  state: string,
  violations: ViolationIn[],
): DemoState {
  const trucks: Truck[] = violations.map((violation, index) => ({
    id: `fmcsa-${violation.unique_id ?? "row"}-${violation.viol_code ?? "code"}-${index}`,
    unit: `DOT-${String(index + 1).padStart(2, "0")}`,
    vin: "public-inspection",
    year: 2022,
    make: "Unknown",
    model: "CMV",
    type: "dry_van",
    driver: "Roadside inspection",
    location: `${city}, ${state}`,
    status: "available",
    miles: 0,
  }));

  const alerts: Alert[] = violations.map((violation, index) => {
    const code = mapCode(violation.section_desc, violation.group_desc, violation.basic_desc);
    const mapped = mapBasic(violation.basic_desc);
    return {
      id: `viol-${violation.unique_id ?? "row"}-${violation.viol_code ?? "x"}-${index}`,
      truckId: trucks[index]?.id ?? `fmcsa-${index}`,
      code,
      title: violation.section_desc || violation.group_desc || "FMCSA violation",
      detail: `${violation.basic_desc ?? "Violation"} · ${violation.group_desc ?? ""} · ${violation.viol_code ?? ""} · public SMS input ${violation.insp_date ?? ""}`.trim(),
      category: mapped.category,
      severity: mapSeverity(violation.oos_indicator, violation.severity_weight),
      source: "FMCSA",
      createdAt: parseInspDate(violation.insp_date),
      status: "open",
    };
  });

  return {
    trucks,
    alerts,
    decisions: [],
    workOrders: [],
    notifications: [],
    escalations: [],
    audit: [
      {
        id: "aud-fmcsa",
        at: new Date().toISOString(),
        actor: "human",
        type: "fmcsa.load",
        message: `Loaded ${alerts.length} public FMCSA violations for ${carrierName}. Not a FleetClose customer — public record only.`,
      },
    ],
  };
}
