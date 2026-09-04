"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { RescueProgress } from "@/components/mobile/rescue-progress";
import { getCitizenProgressIndex, getCitizenStatusLabel } from "@/lib/rescue-progress";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { formatStatus } from "@/lib/utils";
import { useNavigationPending } from "@/components/layout/NavigationPending";

interface ActiveRescueCardProps {
  caseId: string;
  caseNumber: string;
  status: string;
  species: string;
  description: string;
  urgencyLevel: string;
  urgencyScore: number;
  photoUrl?: string;
  rescuerName?: string;
  detailHref?: string;
  /** Compact home variant: no long description, no map. */
  compact?: boolean;
}

export function ActiveRescueCard({
  caseId,
  caseNumber,
  status,
  species,
  description,
  urgencyLevel,
  urgencyScore,
  photoUrl,
  rescuerName,
  detailHref,
  compact = false,
}: ActiveRescueCardProps) {
  const { startPending } = useNavigationPending();
  const progressIndex = getCitizenProgressIndex(status);
  const imageUrl = getCasePhotoUrl(species, photoUrl, caseId);
  const linkHref = detailHref ?? `/mobile/cases/${caseId}`;

  return (
    <Link
      href={linkHref}
      prefetch
      onClick={() => startPending(linkHref)}
      className="block overflow-hidden rounded-2xl border border-sage/25 bg-white shadow-card transition-shadow active:bg-bone/40"
    >
      <div className="flex gap-3 p-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sage/15">
          <Image
            src={imageUrl}
            alt={`${formatStatus(species)} rescue`}
            fill
            className="object-cover"
            unoptimized
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
                Active rescue
              </p>
              <p className="truncate text-base font-bold text-graphite">{caseNumber}</p>
            </div>
            {urgencyScore > 0 ? (
              <UrgencyBadge level={urgencyLevel} score={urgencyScore} size="sm" />
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-sm text-graphite/70">
            {getCitizenStatusLabel(status)}
          </p>
          {!compact && rescuerName ? (
            <p className="mt-0.5 truncate text-xs text-graphite/50">
              {rescuerName} responding
            </p>
          ) : null}
          {!compact ? (
            <p className="mt-1 line-clamp-1 text-xs text-graphite/55">{description}</p>
          ) : null}
        </div>
        <ChevronRight className="mt-5 h-4 w-4 shrink-0 text-graphite/30" aria-hidden />
      </div>
      {progressIndex >= 0 ? (
        <div className="border-t border-sage/15 px-3 py-2.5">
          <RescueProgress currentIndex={progressIndex} compact />
        </div>
      ) : null}
    </Link>
  );
}
