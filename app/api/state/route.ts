import { NextResponse } from "next/server";
import { HEARTLAND_ID } from "@/lib/repo";
import { getCarrierState } from "@/lib/server-ops";

export const runtime = "nodejs";

export function GET(request: Request) {
  const carrierId = new URL(request.url).searchParams.get("carrierId") || HEARTLAND_ID;
  try {
    return NextResponse.json(getCarrierState(carrierId));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown carrier" },
      { status: 404 },
    );
  }
}
