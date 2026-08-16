import { makeId } from "./ids";
import { isCoachOnly } from "./proof";
import { truckById } from "./seed";
import type {
  AgentDecision,
  Alert,
  AuditEvent,
  DecisionAction,
  DemoState,
  Escalation,
  NotificationItem,
  Truck,
  WorkOrder,
  WorkOrderPriority,
  WorkOrderStatus,
} from "./types";

const CRITICAL_CODES = new Set([
  "BRAKE_FAULT",
  "OVERHEAT",
  "AIR_LEAK",
  "HOS_CRIT",
  "COLLISION",
  "CAMERA_DISTRACT",
  "FOLLOW_DIST",
]);

const OOS_CODES = new Set(["BRAKE_FAULT", "OVERHEAT", "AIR_LEAK", "COLLISION"]);

const SAFETY_SHOP: Record<string, string> = {
  "t-107": "Des Moines approved shop · I-35 exit 72",
  "t-122": "St. Joseph mobile tech · 35 min ETA",
  "t-128": "Columbia Petro / TA · air specialist",
  "t-133": "Grand Island safe haven · scale lot",
  "t-144": "Wichita yard + safety desk",
};

function shopFor(truck: Truck | undefined, priority: WorkOrderPriority) {
  if (!truck) return "Network shop";
  if (priority === "p1" && SAFETY_SHOP[truck.id]) return SAFETY_SHOP[truck.id];
  if (truck.location.toLowerCase().includes("yard") || truck.location.toLowerCase().includes("shop")) {
    return `${truck.location} · in-house`;
  }
  return `Nearest partner shop to ${truck.location}`;
}

function assigneeFor(action: DecisionAction, category: Alert["category"]) {
  if (action === "escalate") return "Maintenance manager";
  if (category === "compliance") return "Compliance coordinator";
  if (category === "telematics") return "Ops supervisor";
  return "Shop lead";
}

export function shouldEscalate(alert: Alert): boolean {
  if (alert.severity === "critical") return true;
  if (alert.category === "safety") return true;
  if (CRITICAL_CODES.has(alert.code)) return true;
  return false;
}

function planFor(alert: Alert, truck: Truck | undefined, escalate: boolean) {
  const unit = truck?.unit ?? "unit";
  const driver = truck?.driver ?? "driver";

  if (alert.code === "BRAKE_FAULT") {
    return `Park ${unit} at the next safe shoulder or exit. Do not continue loaded. Dispatch mobile brake tech, download fault codes, and hold the trailer until air / ABS is signed off. Notify ${driver} and the customer that the pickup slips.`;
  }
  if (alert.code === "OVERHEAT") {
    return `Instruct ${driver} to idle-down and stop. Check coolant / fan clutch before a tow. Protect the reefer load — call a rescue reefer if temp climbs. Open a P1 work order and take the tractor out of service.`;
  }
  if (alert.code === "AIR_LEAK") {
    return `Reduce speed, increase following distance, and divert to the nearest air-capable shop. Do not dispatch another load until the leak is isolated (gladhands, hose, or tank).`;
  }
  if (alert.code === "HOS_CRIT") {
    return `Force a 30-minute off-duty / sleeper now. Do not ask ${driver} to stretch. Re-cover the steel coil with a fresh driver or slip-seat from Grand Island. Log the intervention for the safety file.`;
  }
  if (alert.code === "COLLISION") {
    return `Keep ${unit} stopped until safety reviews the dashcam. Confirm no injury, exchange, or airbag. If clear, a manager can release the truck; otherwise tow and drug/alcohol protocol. File the clip + decision for the 2026 insurance packet.`;
  }
  if (alert.code === "CAMERA_DISTRACT") {
    return `Do not park the truck. Pull the Motive clip, coach ${driver} today, and write the outcome to the safety file. Insurers are asking “what did you do after the handheld event?” — this close is the answer.`;
  }
  if (alert.code === "FOLLOW_DIST") {
    return `Coach ${driver} on following distance, attach the Samsara clip, and keep ${unit} in service unless a second event lands this shift. Log it for CSA / renewal — this is not a shop ticket.`;
  }
  if (alert.code === "REEFER_TEMP") {
    return `Pre-cool and verify the setpoint before the dairy load is hooked. If the unit cannot hold, swap reefers at Kansas City yard. Close the excursion so the shipper has a record.`;
  }
  if (alert.code === "IDLE_HIGH") {
    return `Coach ${driver} on idle policy and close with a coaching note — no shop ticket.`;
  }
  if (alert.code === "SEATBELT") {
    return `Send ${driver} the policy clip, log the coaching, and close. Camera AI should not clog the shop queue.`;
  }

  if (escalate) {
    return `Review ${unit} with a human before dispatch. Recommended: inspect, decide out-of-service vs. continue, then create a P1 work order.`;
  }

  const hours = alert.severity === "urgent" ? 8 : 24;
  return `Open a work order for ${unit}, notify ${driver} and the shop, and schedule within ${hours} hours so the next load is not missed.`;
}

function reasonFor(alert: Alert, escalate: boolean) {
  if (escalate) {
    return `${alert.severity === "critical" ? "Critical" : "Safety"} alert (${alert.code}) can create injury, CSA exposure, or a lost load. Agent will not auto-close — a human must approve the plan.`;
  }
  if (isCoachOnly(alert) && !escalate) {
    return "Camera / policy event with no mechanical risk. Auto-close with coaching so the shop queue stays for trucks that cannot roll.";
  }
  if (isCoachOnly(alert) && escalate) {
    return "Camera AI safety event. A human signs the coaching plan so the 2026 renewal file shows action — not just that a dashboard lit up.";
  }
  if (alert.severity === "urgent") {
    return "Urgent but non-safety. Faster to auto-create a work order than wait for someone to copy this into a ticket.";
  }
  return "Routine maintenance / compliance. Pattern-matched to a standard shop job with a known assignee.";
}

function confidenceFor(alert: Alert, escalate: boolean) {
  if (escalate && alert.code === "COLLISION") return 0.74;
  if (escalate) return 0.91;
  if (alert.code === "IDLE_HIGH") return 0.96;
  if (alert.severity === "urgent") return 0.88;
  return 0.93;
}

function priorityFor(alert: Alert, escalate: boolean): WorkOrderPriority {
  if (escalate || alert.severity === "critical") return "p1";
  if (alert.severity === "urgent") return "p2";
  return "p3";
}

function etaFor(alert: Alert, escalate: boolean) {
  if (escalate) return 2;
  if (alert.severity === "urgent") return 8;
  return 24;
}

function notificationsFor(args: {
  alert: Alert;
  truck: Truck | undefined;
  workOrder: WorkOrder | null;
  escalate: boolean;
  now: string;
}): NotificationItem[] {
  const { alert, truck, workOrder, escalate, now } = args;
  const unit = truck?.unit ?? alert.truckId;
  const driver = truck?.driver ?? "Driver";
  const items: NotificationItem[] = [];

  if (escalate) {
    items.push({
      id: makeId("ntf"),
      channel: "sms",
      to: "Maintenance manager",
      subject: `ESCALATION ${unit} · ${alert.title}`,
      body: `Human review needed. ${alert.detail}`,
      sentAt: now,
      relatedAlertId: alert.id,
    });
    items.push({
      id: makeId("ntf"),
      channel: "radio",
      to: driver,
      subject: isCoachOnly(alert) ? `${unit} coaching review` : `${unit} hold for safety`,
      body: isCoachOnly(alert)
        ? "Safety is reviewing a camera event. Keep rolling unless they call you off the load."
        : "Ops is reviewing a safety alert on your truck. Stand by for instructions — do not ignore lamps.",
      sentAt: now,
      relatedAlertId: alert.id,
    });
    return items;
  }

  if (workOrder) {
    items.push({
      id: makeId("ntf"),
      channel: "email",
      to: workOrder.assignee,
      subject: `${workOrder.id.toUpperCase()} opened · ${unit}`,
      body: `${workOrder.title}. Shop: ${workOrder.shop}. Target ${workOrder.etaHours}h.`,
      sentAt: now,
      relatedAlertId: alert.id,
    });
    items.push({
      id: makeId("ntf"),
      channel: "sms",
      to: driver,
      subject: `Work order on ${unit}`,
      body: `${workOrder.title}. You’ll get a shop window from ${workOrder.assignee}.`,
      sentAt: now,
      relatedAlertId: alert.id,
    });
    return items;
  }

  items.push({
    id: makeId("ntf"),
    channel: "sms",
    to: driver,
    subject: `Coaching on ${unit}`,
    body: alert.title,
    sentAt: now,
    relatedAlertId: alert.id,
  });
  items.push({
    id: makeId("ntf"),
    channel: "email",
    to: "Safety desk",
    subject: `Coaching logged · ${unit}`,
    body: `Closed for the 2026 proof file. ${alert.detail}`,
    sentAt: now,
    relatedAlertId: alert.id,
  });
  return items;
}

function workOrderFor(alert: Alert, truck: Truck | undefined, now: string): WorkOrder | null {
  if (isCoachOnly(alert)) return null;
  const escalate = shouldEscalate(alert);
  const priority = priorityFor(alert, escalate);
  return {
    id: makeId("wo"),
    alertId: alert.id,
    truckId: alert.truckId,
    title: alert.title,
    notes: planFor(alert, truck, escalate),
    priority,
    assignee: assigneeFor(escalate ? "escalate" : "auto_work_order", alert.category),
    shop: shopFor(truck, priority),
    etaHours: etaFor(alert, escalate),
    status: "created",
    createdAt: now,
  };
}

export function decideAlert(alert: Alert, trucks: Truck[], now = new Date().toISOString()) {
  const truck = truckById(trucks, alert.truckId);
  const escalate = shouldEscalate(alert);
  const decision: AgentDecision = {
    id: makeId("dec"),
    alertId: alert.id,
    action: escalate ? "escalate" : "auto_work_order",
    reason: reasonFor(alert, escalate),
    confidence: confidenceFor(alert, escalate),
    recommendedPlan: planFor(alert, truck, escalate),
    decidedAt: now,
  };
  return { decision, truck, escalate };
}

export function applyDecision(state: DemoState, alert: Alert, now = new Date().toISOString()): DemoState {
  if (alert.status !== "open") return state;
  const { decision, truck, escalate } = decideAlert(alert, state.trucks, now);
  const audit: AuditEvent[] = [
    {
      id: makeId("aud"),
      at: now,
      actor: "agent",
      type: escalate ? "agent.escalate" : "agent.auto_close",
      message: `${escalate ? "Escalated" : "Auto-closed"} ${alert.code} on ${truck?.unit ?? alert.truckId} · confidence ${Math.round(decision.confidence * 100)}%.`,
      alertId: alert.id,
    },
    ...state.audit,
  ];

  if (escalate) {
    const escalation: Escalation = {
      id: makeId("esc"),
      alertId: alert.id,
      decisionId: decision.id,
      risk: decision.reason,
      recommendedPlan: decision.recommendedPlan,
      status: "pending",
    };
    const notifications = notificationsFor({
      alert,
      truck,
      workOrder: null,
      escalate: true,
      now,
    });
    return {
      ...state,
      alerts: state.alerts.map((item) =>
        item.id === alert.id ? { ...item, status: "escalated" } : item,
      ),
      decisions: [decision, ...state.decisions],
      escalations: [escalation, ...state.escalations],
      notifications: [...notifications, ...state.notifications],
      audit,
    };
  }

  const workOrder = workOrderFor(alert, truck, now);
  const notifications = notificationsFor({
    alert,
    truck,
    workOrder,
    escalate: false,
    now,
  });

  return {
    ...state,
    alerts: state.alerts.map((item) =>
      item.id === alert.id ? { ...item, status: "auto_closed" } : item,
    ),
    decisions: [decision, ...state.decisions],
    workOrders: workOrder ? [workOrder, ...state.workOrders] : state.workOrders,
    notifications: [...notifications, ...state.notifications],
    audit,
  };
}

export function runAgent(state: DemoState, now = new Date().toISOString()): DemoState {
  const open = state.alerts.filter((alert) => alert.status === "open");
  let next: DemoState = {
    ...state,
    lastAgentRunAt: now,
    audit: [
      {
        id: makeId("aud"),
        at: now,
        actor: "agent",
        type: "agent.run",
        message: `Agent run started · ${open.length} open alerts.`,
      },
      ...state.audit,
    ],
  };

  for (const alert of open) {
    next = applyDecision(next, alert, now);
  }

  return next;
}

export function resolveEscalation(
  state: DemoState,
  escalationId: string,
  action: "approved" | "rejected",
  note?: string,
  now = new Date().toISOString(),
): DemoState {
  const escalation = state.escalations.find((item) => item.id === escalationId);
  if (!escalation || escalation.status !== "pending") return state;

  const alert = state.alerts.find((item) => item.id === escalation.alertId);
  if (!alert) return state;
  const truck = truckById(state.trucks, alert.truckId);
  const takeOutOfService = action === "approved" && OOS_CODES.has(alert.code);

  let workOrders = state.workOrders;
  let notifications = state.notifications;
  let trucks = state.trucks;

  if (action === "approved") {
    const workOrder = workOrderFor(alert, truck, now);
    if (workOrder) {
      workOrder.status = "dispatched";
      workOrder.priority = "p1";
      workOrders = [workOrder, ...workOrders];
    }
    notifications = [
      ...notificationsFor({ alert, truck, workOrder, escalate: false, now }),
      {
        id: makeId("ntf"),
        channel: "email",
        to: "Safety desk",
        subject: `Approved plan · ${truck?.unit ?? alert.truckId}`,
        body: note?.trim() || escalation.recommendedPlan,
        sentAt: now,
        relatedAlertId: alert.id,
      },
      ...notifications,
    ];
    if (takeOutOfService) {
      trucks = trucks.map((item) =>
        item.id === alert.truckId ? { ...item, status: "oos" } : item,
      );
    } else if (workOrder) {
      trucks = trucks.map((item) =>
        item.id === alert.truckId ? { ...item, status: "shop" } : item,
      );
    }
  }

  return {
    ...state,
    trucks,
    workOrders,
    notifications,
    alerts: state.alerts.map((item) =>
      item.id === alert.id ? { ...item, status: action } : item,
    ),
    escalations: state.escalations.map((item) =>
      item.id === escalationId
        ? {
            ...item,
            status: action,
            resolvedAt: now,
            resolverNote: note?.trim() || (action === "approved" ? "Approved recommended plan" : "Rejected — no work order"),
          }
        : item,
    ),
    audit: [
      {
        id: makeId("aud"),
        at: now,
        actor: "human",
        type: action === "approved" ? "human.approve" : "human.reject",
        message: `${action === "approved" ? "Approved" : "Rejected"} ${alert.code} on ${truck?.unit ?? alert.truckId}${takeOutOfService ? " · truck marked out of service" : ""}.`,
        alertId: alert.id,
      },
      ...state.audit,
    ],
  };
}

export function updateWorkOrder(
  state: DemoState,
  workOrderId: string,
  status: WorkOrderStatus,
  now = new Date().toISOString(),
): DemoState {
  const workOrder = state.workOrders.find((item) => item.id === workOrderId);
  if (!workOrder) return state;

  const workOrders = state.workOrders.map((item) =>
    item.id === workOrderId ? { ...item, status } : item,
  );
  let trucks = state.trucks;
  if (status === "completed") {
    const stillOpen = workOrders.some(
      (item) =>
        item.truckId === workOrder.truckId && item.status !== "completed" && item.status !== "cancelled",
    );
    if (!stillOpen) {
      trucks = trucks.map((item) =>
        item.id === workOrder.truckId && (item.status === "shop" || item.status === "oos")
          ? { ...item, status: "available" }
          : item,
      );
    }
  } else if (status === "dispatched") {
    trucks = trucks.map((item) =>
      item.id === workOrder.truckId && item.status === "available" ? { ...item, status: "shop" } : item,
    );
  }

  return {
    ...state,
    workOrders,
    trucks,
    audit: [
      {
        id: makeId("aud"),
        at: now,
        actor: "human",
        type: `wo.${status}`,
        message: `Work order ${status} · ${workOrder.title}`,
        alertId: workOrder.alertId,
      },
      ...state.audit,
    ],
  };
}
