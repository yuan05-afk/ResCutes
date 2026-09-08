"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { formatCaseStageLabel } from "@/lib/rescue-stages";
import { formatStatus, cn } from "@/lib/utils";
import { getUrgencyLevelLabel } from "@/lib/urgency/scoring";
import { ChevronRight } from "lucide-react";
import { useNavigationPending } from "@/components/layout/NavigationPending";

interface MobileCaseCardProps {
  id: string;
  caseNumber: string;
  species: string;
  status: string;
  urgencyLevel: string;
  urgencyScore: number;
  description: string;
  photoUrl?: string;
  href?: string;
}

const urgencyText: Record<string, string> = {
  critical: "text-rescue",
  high: "text-ochre",
  medium: "text-evergreen",
  low: "text-graphite/50",
};

export function MobileCaseCard({
  id,
  caseNumber,
  species,
  status,
  urgencyLevel,
  urgencyScore,
  description,
  photoUrl,
  href,
}: MobileCaseCardProps) {
  const router = useRouter();
  const { startPending } = useNavigationPending();
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = getCasePhotoUrl(species, photoUrl, id);
  const linkHref = href ?? `/mobile/cases/${id}`;
  const stageLabel = formatCaseStageLabel(status);
  const speciesLabel = formatStatus(species);
  const showUrgency = urgencyScore > 0;
  const urgencyLabel = showUrgency
    ? getUrgencyLevelLabel(
        urgencyLevel as "critical" | "high" | "medium" | "low",
      )
    : null;

  return (
    <Link
      href={linkHref}
      prefetch
      onMouseEnter={() => router.prefetch(linkHref)}
      onTouchStart={() => router.prefetch(linkHref)}
      onClick={() => startPending(linkHref)}
      className="block"
      aria-label={`${caseNumber}, ${speciesLabel}, ${stageLabel}${
        urgencyLabel ? `, ${urgencyLabel}` : ""
      }`}
    >
      <article className="flex min-h-[4.75rem] overflow-hidden rounded-2xl border border-sage/20 bg-white shadow-card transition-colors active:bg-bone/60">
        <div className="relative w-[4.75rem] shrink-0 self-stretch bg-sage/15">
          <Image
            src={imageUrl}
            alt=""
            fill
            draggable={false}
            className={cn(
              "object-cover pointer-events-none select-none [-webkit-user-drag:none] transition-opacity duration-200",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            unoptimized
            sizes="76px"
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h2 className="break-words text-[15px] font-bold leading-tight text-graphite">
                {caseNumber}
              </h2>
              {showUrgency && urgencyLabel ? (
                <span
                  className={cn(
                    "shrink-0 text-[9px] font-bold uppercase tracking-wide",
                    urgencyText[urgencyLevel] ?? urgencyText.low,
                  )}
                >
                  {urgencyLabel}
                </span>
              ) : null}
            </div>
            <p className="mt-1 truncate text-sm text-graphite/70">
              {speciesLabel}
              <span className="text-graphite/35"> · </span>
              {stageLabel}
            </p>
            {description.trim() ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-graphite/50">
                {description}
              </p>
            ) : null}
          </div>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-graphite/25"
            aria-hidden
          />
        </div>
      </article>
    </Link>
  );
}
