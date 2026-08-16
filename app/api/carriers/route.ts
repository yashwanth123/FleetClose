import { NextResponse } from "next/server";
import { listOpsCarriers } from "@/lib/server-ops";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ carriers: listOpsCarriers() });
}
