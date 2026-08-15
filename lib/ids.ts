export function makeId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export function hoursAgo(hours: number, from = Date.now()) {
  return new Date(from - hours * 3_600_000).toISOString();
}

export function minutesAgo(minutes: number, from = Date.now()) {
  return new Date(from - minutes * 60_000).toISOString();
}

export function formatRelative(iso: string, from = Date.now()) {
  const deltaMs = from - new Date(iso).getTime();
  const minutes = Math.max(0, Math.round(deltaMs / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPct(value: number) {
  return `${Math.round(value)}%`;
}

export const TRUCK_TYPE_LABEL: Record<string, string> = {
  dry_van: "Dry van",
  reefer: "Reefer",
  flatbed: "Flatbed",
};

export const SEVERITY_LABEL: Record<string, string> = {
  routine: "Routine",
  urgent: "Urgent",
  critical: "Critical",
};
