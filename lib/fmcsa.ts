export const CENSUS_URL = "https://data.transportation.gov/resource/az4n-8mr2.json";
export const VIOLATION_URL = "https://data.transportation.gov/resource/8mt8-2mdr.json";

export const FEATURED_DOTS = [
  { dot: "638655", why: "194 trucks · Des Moines IA · for-hire + reefer/mail" },
  { dot: "248505", why: "190 trucks · New Market IA · authorized for hire" },
];

export type FmcsaCarrier = {
  legal_name?: string;
  dba_name?: string;
  dot_number?: string;
  power_units?: string;
  total_drivers?: string;
  phy_city?: string;
  phy_state?: string;
  classdef?: string;
  safety_rating?: string;
  crgo_coldfood?: string;
  crgo_genfreight?: string;
  status_code?: string;
};

export type FmcsaViolation = {
  unique_id?: string;
  insp_date?: string;
  dot_number?: string;
  viol_code?: string;
  basic_desc?: string;
  oos_indicator?: string;
  severity_weight?: string;
  section_desc?: string;
  group_desc?: string;
};

async function soda<T>(url: string, params: Record<string, string>): Promise<T> {
  const query = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    query.searchParams.set(key, value);
  }
  const response = await fetch(query.toString());
  if (!response.ok) {
    throw new Error(`FMCSA open data returned ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function lookupCarrier(dot: string) {
  const clean = dot.replace(/\D/g, "");
  const rows = await soda<FmcsaCarrier[]>(CENSUS_URL, {
    $limit: "1",
    $where: `dot_number='${clean}'`,
  });
  return rows[0] ?? null;
}

export async function searchCarriers(name: string) {
  const safe = name.replace(/'/g, "").trim();
  if (safe.length < 3) return [];
  return soda<FmcsaCarrier[]>(CENSUS_URL, {
    $limit: "8",
    $select:
      "legal_name,dba_name,dot_number,power_units,total_drivers,phy_city,phy_state,classdef,safety_rating,status_code",
    $where: `status_code='A' AND upper(legal_name) like '%${safe.toUpperCase()}%' AND power_units::number >= 20`,
    $order: "power_units::number DESC",
  });
}

export async function listViolations(dot: string) {
  const clean = dot.replace(/\D/g, "");
  return soda<FmcsaViolation[]>(VIOLATION_URL, {
    $limit: "20",
    $where: `dot_number='${clean}'`,
    $order: "insp_date DESC",
  });
}

export function ratingLabel(code?: string) {
  if (code === "S") return "Satisfactory";
  if (code === "C") return "Conditional";
  if (code === "U") return "Unsatisfactory";
  return "Not rated";
}
