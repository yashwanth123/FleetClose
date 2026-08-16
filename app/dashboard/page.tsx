import { Suspense } from "react";
import { OpsDashboard } from "@/components/ops-dashboard";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071421] p-8 text-paper">Loading ops console…</div>}>
      <OpsDashboard />
    </Suspense>
  );
}
