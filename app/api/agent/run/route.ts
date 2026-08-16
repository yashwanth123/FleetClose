import { NextResponse } from "next/server";
import { HEARTLAND_ID } from "@/lib/repo";
import { runCarrierAgent } from "@/lib/server-ops";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { carrierId?: string };
  try {
    return NextResponse.json(runCarrierAgent(body.carrierId || HEARTLAND_ID));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Run failed" }, { status: 400 });
  }
}
