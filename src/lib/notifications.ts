import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getNotificationsForUser } from "@/lib/data/service";
import type { NotificationRecord } from "@/lib/data/types";

export type NotificationKind =
  | "status_update"
  | "assignment"
  | "handoff"
  | "medical_update"
  | "system"
  | "adoption";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  href: string;
  urgency: "high" | "medium" | "low";
  timeLabel?: string;
  read: boolean;
};

const KINDS = new Set<NotificationKind>([
  "status_update",
  "assignment",
  "handoff",
  "medical_update",
  "system",
  "adoption",
]);

export function notificationsTag(userId: string) {
  return `notifications:${userId}`;
}

function toKind(type: string): NotificationKind {
  return KINDS.has(type as NotificationKind)
    ? (type as NotificationKind)
    : "system";
}

function urgencyForKind(kind: NotificationKind): "high" | "medium" | "low" {
  switch (kind) {
    case "assignment":
    case "medical_update":
      return "high";
    case "status_update":
    case "handoff":
      return "medium";
    default:
      return "low";
  }
}

export function formatRelative(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 45) return "Just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return diffMin === 1 ? "1 min ago" : `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return diffHr === 1 ? "1 hour ago" : `${diffHr} hours ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return diffDay === 1 ? "Yesterday" : `${diffDay} days ago`;
  const diffWeek = Math.round(diffDay / 7);
  if (diffWeek < 5) return diffWeek === 1 ? "1 week ago" : `${diffWeek} weeks ago`;
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

export function mapNotificationRecord(n: NotificationRecord): AppNotification {
  const kind = toKind(n.type);
  return {
    id: n.id,
    kind,
    title: n.title,
    description: n.message,
    href: n.caseId
      ? `/rescue-cases/${n.caseId}`
      : kind === "adoption"
        ? "/adoption"
        : "/dashboard",
    urgency: urgencyForKind(kind),
    timeLabel: formatRelative(n.createdAt),
    read: n.read,
  };
}

/** Request-scoped + tagged cache for the notification bell/panel. */
export const getAppNotificationsCached = cache(function getAppNotificationsCached(
  userId: string,
) {
  return unstable_cache(
    async () => {
      const rows = await getNotificationsForUser(userId);
      return rows.map(mapNotificationRecord);
    },
    ["app-notifications", userId],
    { revalidate: 60, tags: [notificationsTag(userId)] },
  )();
});
