import { 
  Sparkles, Phone, Calendar, MessageSquare, ThumbsUp, 
  ThumbsDown, CheckCircle, Award, XCircle, AlertCircle,
  UserPlus, ClipboardCheck, BadgeCheck, GraduationCap
} from "lucide-react";

/**
 * Lead Status Types for Educational Institution CRM
 */
export type LeadStatus = 
  | "new_lead" 
  | "contacted" 
  | "follow_up" 
  | "counselling_done" 
  | "interested" 
  | "not_interested"
  | "admission_confirmed"
  | "admission_completed"
  | "lost_lead";

/**
 * Lead Status Display Labels
 */
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new_lead: "New Lead",
  contacted: "Contacted",
  follow_up: "Follow-up",
  counselling_done: "Counselling Done",
  interested: "Interested",
  not_interested: "Not Interested",
  admission_confirmed: "Admission Confirmed",
  admission_completed: "Admission Completed",
  lost_lead: "Lost Lead"
};

/**
 * Lead Status Configuration with visual properties and metadata
 */
export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: any;
  description: string;
  stage: "active" | "success" | "failed" | "pending";
  order: number;
  nextStatuses: LeadStatus[];
  requiresNote?: boolean;
  automated?: boolean;
}

export const LEAD_STATUS_CONFIG: Record<LeadStatus, StatusConfig> = {
  new_lead: {
    label: "New Lead",
    color: "#3B82F6",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    icon: Sparkles,
    description: "New lead received, awaiting initial contact",
    stage: "pending",
    order: 1,
    nextStatuses: ["contacted", "lost_lead"],
    requiresNote: false
  },
  contacted: {
    label: "Contacted",
    color: "#8B5CF6",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    icon: Phone,
    description: "Initial contact made with the lead",
    stage: "active",
    order: 2,
    nextStatuses: ["follow_up", "counselling_done", "not_interested", "lost_lead"],
    requiresNote: true
  },
  follow_up: {
    label: "Follow-up",
    color: "#F59E0B",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    icon: Calendar,
    description: "Follow-up scheduled or in progress",
    stage: "active",
    order: 3,
    nextStatuses: ["contacted", "counselling_done", "interested", "not_interested", "lost_lead"],
    requiresNote: true
  },
  counselling_done: {
    label: "Counselling Done",
    color: "#06B6D4",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    textColor: "text-cyan-700",
    icon: MessageSquare,
    description: "Counselling session completed",
    stage: "active",
    order: 4,
    nextStatuses: ["interested", "not_interested", "follow_up"],
    requiresNote: true
  },
  interested: {
    label: "Interested",
    color: "#10B981",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    icon: ThumbsUp,
    description: "Lead shows strong interest in admission",
    stage: "active",
    order: 5,
    nextStatuses: ["admission_confirmed", "follow_up", "not_interested"],
    requiresNote: false
  },
  not_interested: {
    label: "Not Interested",
    color: "#EF4444",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    icon: ThumbsDown,
    description: "Lead declined or not interested",
    stage: "failed",
    order: 6,
    nextStatuses: ["follow_up", "lost_lead"],
    requiresNote: true
  },
  admission_confirmed: {
    label: "Admission Confirmed",
    color: "#8B5CF6",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    icon: BadgeCheck,
    description: "Admission confirmed, pending completion",
    stage: "success",
    order: 7,
    nextStatuses: ["admission_completed", "lost_lead"],
    requiresNote: false
  },
  admission_completed: {
    label: "Admission Completed",
    color: "#059669",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    icon: GraduationCap,
    description: "Admission process completed successfully",
    stage: "success",
    order: 8,
    nextStatuses: [],
    requiresNote: false,
    automated: false
  },
  lost_lead: {
    label: "Lost Lead",
    color: "#DC2626",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    icon: XCircle,
    description: "Lead is lost and no longer pursuing",
    stage: "failed",
    order: 9,
    nextStatuses: ["follow_up"],
    requiresNote: true
  }
};

/**
 * Get all active statuses (excluding terminal states)
 */
export function getActiveStatuses(): LeadStatus[] {
  return Object.entries(LEAD_STATUS_CONFIG)
    .filter(([_, config]) => config.stage === "active")
    .map(([status]) => status as LeadStatus);
}

/**
 * Get all success statuses
 */
export function getSuccessStatuses(): LeadStatus[] {
  return Object.entries(LEAD_STATUS_CONFIG)
    .filter(([_, config]) => config.stage === "success")
    .map(([status]) => status as LeadStatus);
}

/**
 * Get all failed statuses
 */
export function getFailedStatuses(): LeadStatus[] {
  return Object.entries(LEAD_STATUS_CONFIG)
    .filter(([_, config]) => config.stage === "failed")
    .map(([status]) => status as LeadStatus);
}

/**
 * Check if status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: LeadStatus,
  newStatus: LeadStatus
): boolean {
  const config = LEAD_STATUS_CONFIG[currentStatus];
  return config.nextStatuses.includes(newStatus);
}

/**
 * Get status by key
 */
export function getStatusConfig(status: LeadStatus): StatusConfig {
  return LEAD_STATUS_CONFIG[status];
}

/**
 * Get all statuses sorted by order
 */
export function getAllStatusesSorted(): LeadStatus[] {
  return Object.entries(LEAD_STATUS_CONFIG)
    .sort(([_, a], [__, b]) => a.order - b.order)
    .map(([status]) => status as LeadStatus);
}

/**
 * Get status label
 */
export function getStatusLabel(status: LeadStatus): string {
  return LEAD_STATUS_LABELS[status];
}

/**
 * Calculate conversion rate between two statuses
 */
export function calculateConversionRate(
  totalLeads: number,
  convertedLeads: number
): number {
  if (totalLeads === 0) return 0;
  return Math.round((convertedLeads / totalLeads) * 100);
}

/**
 * Get status badge variant for UI components
 */
export function getStatusBadgeVariant(status: LeadStatus): "default" | "secondary" | "destructive" | "outline" {
  const config = LEAD_STATUS_CONFIG[status];
  switch (config.stage) {
    case "success":
      return "default";
    case "failed":
      return "destructive";
    case "active":
      return "secondary";
    default:
      return "outline";
  }
}

/**
 * Get stage progress percentage for a lead status
 */
export function getStatusProgress(status: LeadStatus): number {
  const config = LEAD_STATUS_CONFIG[status];
  const totalStages = Object.keys(LEAD_STATUS_CONFIG).length;
  return Math.round((config.order / totalStages) * 100);
}

/**
 * Status workflow stages for pipeline visualization
 */
export const STATUS_PIPELINE_STAGES = [
  {
    id: "initial",
    label: "Initial Contact",
    statuses: ["new_lead", "contacted"] as LeadStatus[],
    color: "blue"
  },
  {
    id: "engagement",
    label: "Engagement",
    statuses: ["follow_up", "counselling_done"] as LeadStatus[],
    color: "amber"
  },
  {
    id: "decision",
    label: "Decision",
    statuses: ["interested", "not_interested"] as LeadStatus[],
    color: "purple"
  },
  {
    id: "conversion",
    label: "Conversion",
    statuses: ["admission_confirmed", "admission_completed"] as LeadStatus[],
    color: "green"
  },
  {
    id: "closed",
    label: "Closed",
    statuses: ["lost_lead"] as LeadStatus[],
    color: "red"
  }
];
