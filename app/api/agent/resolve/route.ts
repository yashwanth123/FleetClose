import { NextResponse } from "next/server";
import { HEARTLAND_ID } from "@/lib/repo";
import { resolveCarrierEscalation } from "@/lib/server-ops";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    carrierId?: string;
    escalationId?: string;
    action?: "approved" | "rejected";
    note?: string;
  };
  if (!body.escalationId || !body.action) {
    return NextResponse.json({ error: "escalationId and action required" }, { status: 400 });
  }
  try {
    return NextResponse.json(
      resolveCarrierEscalation(body.carrierId || HEARTLAND_ID, body.escalationId, body.action, body.note),
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Resolve failed" }, { status: 400 });
  }
}
