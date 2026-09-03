"use client";

import Link from "next/link";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { AnimalImage } from "@/components/ui/animal-image";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { formatStatus, cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface AttentionQueueItemProps {
  id: string;
  caseNumber: string;
  species: string;
  urgencyLevel: string;
  urgencyScore: number;
  description: string;
  photoUrl?: string;
  animalName?: string;
  onOpen?: () => void;
  compact?: boolean;
}

export function AttentionQueueItem({
  id,
  caseNumber,
  species,
  urgencyLevel,
  urgencyScore,
  description,
  photoUrl,
  animalName,
  onOpen,
  compact = false,
}: AttentionQueueItemProps) {
  const imageUrl = getCasePhotoUrl(species, photoUrl, id);
  const title = animalName ?? formatStatus(species);

  const content = (
    <>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg",
          compact ? "h-11 w-11" : "h-14 w-14",
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <AnimalImage
          src={imageUrl}
          species={species}
          alt={title}
          containerClassName="absolute inset-0 h-full w-full rounded-lg"
          sizes="56px"
          objectPosition="center top"
          expandable
          showExpandHint={false}
          lightboxCaption={caseNumber}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-graphite">{title}</p>
            <p className="text-xs text-graphite/50">{caseNumber}</p>
          </div>
          <UrgencyBadge level={urgencyLevel} score={urgencyScore} />
        </div>
        <p
          className={cn(
            "line-clamp-1 text-graphite/65",
            compact ? "mt-1 text-[11px]" : "mt-1.5 text-xs",
          )}
        >
          {description}
        </p>
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 self-center text-graphite/30"
        aria-hidden
      />
    </>
  );

  const className = cn(
    "flex w-full cursor-pointer gap-2.5 rounded-lg border border-sage/20 bg-white text-left transition-all hover:border-evergreen/30 hover:shadow-card",
    compact ? "p-2" : "gap-3 rounded-xl p-3",
  );

  if (onOpen) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className={className}
      >
        {content}
      </div>
    );
  }

  return (
    <Link href={`/rescue-cases/${id}`} className={cn(className, "group")}>
      {content}
    </Link>
  );
}
