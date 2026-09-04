"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { useNavigationPending } from "@/components/layout/NavigationPending";

interface PendingAssignmentBannerProps {
  assignmentId: string;
  caseNumber: string;
  urgencyLevel: string;
  urgencyScore: number;
  /** One-line context instead of full description */
  summary?: string;
}

/** Slim one-tap banner for a pending rescuer assignment. */
export function PendingAssignmentBanner({
  assignmentId,
  caseNumber,
  urgencyLevel,
  urgencyScore,
  summary,
}: PendingAssignmentBannerProps) {
  const { startPending } = useNavigationPending();
  const href = `/mobile/assignments/${assignmentId}`;

  return (
    <Link
      href={href}
      prefetch
      onClick={() => startPending(href)}
      className="flex items-center gap-3 rounded-2xl border border-ochre/30 bg-ochre/8 px-3.5 py-3 transition-colors active:bg-ochre/15"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ochre">
          New assignment
        </p>
        <p className="truncate text-sm font-bold text-graphite">
          {caseNumber}
          {summary ? (
            <span className="font-normal text-graphite/55"> · {summary}</span>
          ) : null}
        </p>
      </div>
      <UrgencyBadge level={urgencyLevel} score={urgencyScore} size="sm" />
      <ChevronRight className="h-4 w-4 shrink-0 text-ochre/70" aria-hidden />
    </Link>
  );
}
