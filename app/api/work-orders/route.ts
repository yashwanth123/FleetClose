import { NextResponse } from "next/server";
import { HEARTLAND_ID } from "@/lib/repo";
import { updateCarrierWorkOrder } from "@/lib/server-ops";
import type { WorkOrderStatus } from "@/lib/types";

export const runtime = "nodejs";

const STATUSES: WorkOrderStatus[] = ["created", "dispatched", "completed", "cancelled"];

export async function POST(request: Request) {
  const body = (await request.json()) as {
    carrierId?: string;
    workOrderId?: string;
    status?: WorkOrderStatus;
  };
  if (!body.workOrderId || !body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "workOrderId and a valid status required" }, { status: 400 });
  }
  try {
    return NextResponse.json(
      updateCarrierWorkOrder(body.carrierId || HEARTLAND_ID, body.workOrderId, body.status),
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Work order update failed" },
      { status: 400 },
    );
  }
}
