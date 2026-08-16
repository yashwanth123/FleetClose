import { NextResponse } from "next/server";
import { createCarrierFromCsv, ingestAlertCsv } from "@/lib/server-ops";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    csv?: string;
    carrierId?: string;
    fleetName?: string;
    run?: boolean;
  };
  if (!body.csv?.trim()) {
    return NextResponse.json({ error: "csv required" }, { status: 400 });
  }
  try {
    const run = body.run !== false;
    if (body.fleetName?.trim() && !body.carrierId) {
      return NextResponse.json(createCarrierFromCsv(body.fleetName, body.csv, run));
    }
    if (!body.carrierId) {
      return NextResponse.json({ error: "carrierId or fleetName required" }, { status: 400 });
    }
    return NextResponse.json(ingestAlertCsv(body.carrierId, body.csv, run));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "CSV ingest failed" },
      { status: 400 },
    );
  }
}
