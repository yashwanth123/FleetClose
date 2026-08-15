import { NextResponse } from "next/server";
import { resolveEscalation } from "@/lib/agent";
import { computeRoi } from "@/lib/metrics";
import type { DemoState } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    state?: DemoState;
    escalationId?: string;
    action?: "approved" | "rejected";
    note?: string;
  };

  if (!body.state || !body.escalationId || !body.action) {
    return NextResponse.json({ error: "Missing resolve payload" }, { status: 400 });
  }

  const state = resolveEscalation(body.state, body.escalationId, body.action, body.note);
  return NextResponse.json({ state, metrics: computeRoi(state) });
}
