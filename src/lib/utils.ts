import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Display label for rescue-case timeline entries (presentation only). */
export function formatTimelineLabel(entry: {
  toStatus: string;
  fromStatus?: string;
  note?: string;
}): string {
  if (
    entry.toStatus === "shelter_handoff" &&
    entry.fromStatus === "shelter_handoff" &&
    entry.note?.toLowerCase().includes("intake completed")
  ) {
    return "Shelter Intake Completed";
  }
  return formatStatus(entry.toStatus);
}

export function hasMeaningfulValue(value?: string | null): boolean {
  return Boolean(value?.trim());
}

export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `RC-${year}-${num}`;
}
