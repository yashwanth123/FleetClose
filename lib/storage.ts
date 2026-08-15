import { createSeedState } from "./seed";
import type { DemoState } from "./types";

const KEY = "fleetclose-demo-v1";

export function loadDemoState(): DemoState {
  if (typeof window === "undefined") return createSeedState();
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as DemoState;
    if (!Array.isArray(parsed.alerts) || !Array.isArray(parsed.trucks)) {
      return createSeedState();
    }
    return parsed;
  } catch {
    return createSeedState();
  }
}

export function saveDemoState(state: DemoState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(state));
}

export function clearDemoState() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}

export type PilotLead = {
  name: string;
  email: string;
  company: string;
  trucks: string;
  role: string;
  message: string;
  submittedAt: string;
};

const LEAD_KEY = "fleetclose-pilot-lead";

export function savePilotLead(lead: PilotLead) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LEAD_KEY, JSON.stringify(lead));
}

export function loadPilotLead(): PilotLead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEAD_KEY);
    return raw ? (JSON.parse(raw) as PilotLead) : null;
  } catch {
    return null;
  }
}

export const PILOT_INBOX = "yashwanthsai525@gmail.com";

export function pilotMailto(lead: PilotLead) {
  const subject = `FleetClose 30-day pilot — ${lead.company || lead.name}`;
  const body = [
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Company: ${lead.company}`,
    `Trucks: ${lead.trucks}`,
    `Role: ${lead.role}`,
    "",
    lead.message || "I want the $3,500 / 30-day / 100-truck pilot.",
  ].join("\n");
  return `mailto:${PILOT_INBOX}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
