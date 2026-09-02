"use client";

import Link from "next/link";
import Image from "next/image";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { formatStatus } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const content = (
    <>
      <div className={cn(
        "relative shrink-0 overflow-hidden rounded-lg bg-sage/20",
        compact ? "h-11 w-11" : "h-14 w-14",
      )}>
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
          unoptimized
          sizes="56px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-graphite text-sm">
              {animalName ?? formatStatus(species)}
            </p>
            <p className="text-xs text-graphite/50">{caseNumber}</p>
          </div>
          <UrgencyBadge level={urgencyLevel} score={urgencyScore} />
        </div>
        <p className={cn(
          "text-graphite/65 line-clamp-1",
          compact ? "mt-1 text-[11px]" : "mt-1.5 text-xs",
        )}>{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-graphite/30 self-center" aria-hidden />
    </>
  );

  const className = cn(
    "flex gap-2.5 rounded-lg border border-sage/20 bg-white transition-all hover:border-evergreen/30 hover:shadow-card cursor-pointer w-full text-left",
    compact ? "p-2" : "gap-3 rounded-xl p-3",
  );

  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={`/rescue-cases/${id}`} className={cn(className, "group")}>
      {content}
    </Link>
  );
}
