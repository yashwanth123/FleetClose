import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { leadCount, listCarriers } from "@/lib/repo";

export const runtime = "nodejs";

export function GET() {
  getDb();
  return NextResponse.json({
    ok: true,
    mode: "server",
    carriers: listCarriers().map((row) => ({
      id: row.id,
      name: row.legal_name,
      source: row.source,
    })),
    leads: leadCount(),
  });
}
