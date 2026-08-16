import { NextResponse } from "next/server";
import { resetDemo } from "@/lib/server-ops";

export const runtime = "nodejs";

export function POST() {
  return NextResponse.json(resetDemo());
}
