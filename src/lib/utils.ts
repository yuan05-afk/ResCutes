import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

import { formatCaseStageLabel, statusToStage } from "@/lib/rescue-stages";

export function formatStatus(status: string): string {
  // Rescue case statuses: show simplified stage labels in lists/badges.
  if (statusToStage(status)) {
    return formatCaseStageLabel(status);
  }
  const shortLabels: Record<string, string> = {
    medical_clearance: "Medical",
    behavior_assessment: "Behavior",
    ready_for_foster: "Foster ready",
    ready_for_adoption: "Adoption ready",
    awaiting_examination: "Awaiting exam",
    under_examination: "Under exam",
    under_treatment: "Under treatment",
    follow_up_required: "Follow-up",
    medically_cleared: "Cleared",
    under_review: "In review",
    boarding_house: "Boarding",
  };
  if (shortLabels[status]) return shortLabels[status];
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Exact status label for timelines (not stage-collapsed). */
export function formatExactStatus(status: string): string {
  const exactLabels: Record<string, string> = {
    report_submitted: "Submitted",
    under_verification: "Verifying",
    verified: "Verified",
    rescuer_assigned: "Assigned",
    rescue_accepted: "Accepted",
    rescue_in_progress: "In progress",
    animal_secured: "Secured",
    awaiting_shelter: "Awaiting shelter",
    shelter_handoff: "Handoff",
    completed: "Completed",
    rejected: "Rejected",
    duplicate: "Duplicate",
    cancelled: "Cancelled",
  };
  if (exactLabels[status]) return exactLabels[status];
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Display label for rescue-case timeline entries (presentation only). */
export function formatTimelineLabel(entry: {
  toStatus: string;
  fromStatus?: string | null;
  note?: string | null;
}): string {
  if (
    entry.note?.toLowerCase().includes("intake completed") &&
    (entry.toStatus === "completed" || entry.toStatus === "shelter_handoff")
  ) {
    return "Shelter Intake Completed";
  }
  if (
    entry.note?.toLowerCase().includes("assignment accepted") &&
    entry.toStatus === entry.fromStatus
  ) {
    return "Assignment Accepted";
  }
  return formatExactStatus(entry.toStatus);
}

export function hasMeaningfulValue(value?: string | null): boolean {
  return Boolean(value?.trim());
}

export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `RC-${year}-${num}`;
}
