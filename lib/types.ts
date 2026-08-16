export type TruckType = "dry_van" | "reefer" | "flatbed";
export type TruckStatus = "available" | "en_route" | "shop" | "oos";
export type Severity = "routine" | "urgent" | "critical";
export type AlertCategory = "maintenance" | "safety" | "compliance" | "telematics";
export type AlertStatus =
  | "open"
  | "auto_closed"
  | "escalated"
  | "approved"
  | "rejected";
export type DecisionAction = "auto_work_order" | "escalate";
export type WorkOrderPriority = "p3" | "p2" | "p1";
export type WorkOrderStatus = "created" | "dispatched" | "completed" | "cancelled";
export type NotificationChannel = "sms" | "email" | "radio";
export type EscalationStatus = "pending" | "approved" | "rejected";
export type Actor = "agent" | "human";

export type Truck = {
  id: string;
  unit: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  type: TruckType;
  driver: string;
  location: string;
  status: TruckStatus;
  miles: number;
};

export type Alert = {
  id: string;
  truckId: string;
  code: string;
  title: string;
  detail: string;
  category: AlertCategory;
  severity: Severity;
  source: "Samsara" | "Geotab" | "Motive" | "ELD" | "Shop" | "FMCSA";
  createdAt: string;
  status: AlertStatus;
};

export type AgentDecision = {
  id: string;
  alertId: string;
  action: DecisionAction;
  reason: string;
  confidence: number;
  recommendedPlan: string;
  decidedAt: string;
};

export type WorkOrder = {
  id: string;
  alertId: string;
  truckId: string;
  title: string;
  notes: string;
  priority: WorkOrderPriority;
  assignee: string;
  shop: string;
  etaHours: number;
  status: WorkOrderStatus;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  channel: NotificationChannel;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  relatedAlertId: string;
};

export type Escalation = {
  id: string;
  alertId: string;
  decisionId: string;
  risk: string;
  recommendedPlan: string;
  status: EscalationStatus;
  resolvedAt?: string;
  resolverNote?: string;
};

export type AuditEvent = {
  id: string;
  at: string;
  actor: Actor;
  type: string;
  message: string;
  alertId?: string;
};

export type DemoState = {
  trucks: Truck[];
  alerts: Alert[];
  decisions: AgentDecision[];
  workOrders: WorkOrder[];
  notifications: NotificationItem[];
  escalations: Escalation[];
  audit: AuditEvent[];
  lastAgentRunAt?: string;
};

export type RoiMetrics = {
  openAlerts: number;
  processedAlerts: number;
  autoResolved: number;
  escalated: number;
  autoResolvePct: number;
  avgTimeToActionMinutes: number;
  baselineHours: number;
  estimatedSavings: number;
  hoursSaved: number;
  proofReady: number;
  openCritical: number;
};
