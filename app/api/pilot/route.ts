import { NextResponse } from "next/server";
import { saveLead } from "@/lib/repo";
import type { PilotLead } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<PilotLead>;
  if (!body.name || !body.email || !body.company) {
    return NextResponse.json({ error: "name, email, and company required" }, { status: 400 });
  }
  const lead: PilotLead = {
    name: body.name,
    email: body.email,
    company: body.company,
    trucks: body.trucks ?? "",
    role: body.role ?? "",
    message: body.message ?? "",
    submittedAt: body.submittedAt ?? new Date().toISOString(),
  };
  saveLead(lead);
  return NextResponse.json({ ok: true, lead });
}
