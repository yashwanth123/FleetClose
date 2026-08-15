import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";
import { computeRoi } from "@/lib/metrics";
import type { DemoState } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { state?: DemoState };
  if (!body.state) {
    return NextResponse.json({ error: "Missing demo state" }, { status: 400 });
  }
  const state = runAgent(body.state);
  return NextResponse.json({ state, metrics: computeRoi(state) });
}
