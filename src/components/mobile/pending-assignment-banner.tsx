"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getUrgencyLevelLabel } from "@/lib/urgency/scoring";
import { useNavigationPending } from "@/components/layout/NavigationPending";
import { cn } from "@/lib/utils";

interface PendingAssignmentBannerProps {
  assignmentId: string;
  caseNumber: string;
  urgencyLevel: string;
  urgencyScore: number;
  /** One-line context instead of full description */
  summary?: string;
}

/** Quiet primary CTA for a pending rescuer assignment. */
export function PendingAssignmentBanner({
  assignmentId,
  caseNumber,
  urgencyLevel,
  urgencyScore,
  summary,
}: PendingAssignmentBannerProps) {
  const { startPending } = useNavigationPending();
  const href = `/mobile/assignments/${assignmentId}`;
  const urgencyLabel = getUrgencyLevelLabel(
    urgencyLevel as "critical" | "high" | "medium" | "low",
  );
  const isCritical = urgencyLevel === "critical";

  return (
    <Link
      href={href}
      prefetch
      onClick={() => startPending(href)}
      aria-label={`New assignment ${caseNumber}. Review now.`}
      className={cn(
        "flex items-center gap-3 rounded-2xl border bg-white px-3.5 py-3.5 shadow-card transition-colors active:bg-bone/70",
        isCritical ? "border-rescue/25" : "border-ochre/30",
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wide",
            isCritical ? "text-rescue" : "text-ochre",
          )}
        >
          New assignment
        </p>
        <p className="mt-0.5 truncate text-base font-bold leading-tight text-graphite">
          {caseNumber}
          {summary ? (
            <span className="font-normal text-graphite/55"> · {summary}</span>
          ) : null}
        </p>
        <p className="mt-1 text-xs text-graphite/55">
          {urgencyLabel}
          {urgencyScore > 0 ? ` · ${urgencyScore}` : ""}
          {" · "}
          Tap to respond
        </p>
      </div>

      <span
        className={cn(
          "flex min-h-11 shrink-0 items-center gap-0.5 rounded-full px-3 text-xs font-semibold",
          isCritical
            ? "bg-rescue/10 text-rescue"
            : "bg-ochre/10 text-ochre",
        )}
      >
        Respond
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
      </span>
    </Link>
  );
}
