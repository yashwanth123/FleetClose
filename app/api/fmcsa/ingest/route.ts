import { NextResponse } from "next/server";
import { ingestUsdot } from "@/lib/server-ops";
import { searchCarriers } from "@/lib/fmcsa";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { dot?: string };
  if (!body.dot) return NextResponse.json({ error: "dot required" }, { status: 400 });
  try {
    return NextResponse.json(await ingestUsdot(body.dot));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ingest failed" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("q") ?? "";
  try {
    return NextResponse.json({ hits: await searchCarriers(name) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Search failed" }, { status: 400 });
  }
}
