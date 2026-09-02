"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { StatusBadge } from "@/components/status/status-badge";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { getCasePhotoUrl } from "@/lib/demo-images";
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
  const imageUrl = getCasePhotoUrl(species, photoUrl, id);
  const linkHref = href ?? `/mobile/cases/${id}`;

  return (
    <Link
      href={linkHref}
      prefetch
      onMouseEnter={() => router.prefetch(linkHref)}
      onTouchStart={() => router.prefetch(linkHref)}
      onClick={() => startPending(linkHref)}
      className="block group"
    >
      <article
        className="flex gap-3 rounded-2xl border border-sage/25 bg-white p-4 shadow-card transition-shadow group-hover:shadow-card-hover"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sage/20">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            unoptimized
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-graphite">{caseNumber}</span>
            {urgencyScore > 0 && (
              <UrgencyBadge level={urgencyLevel} score={urgencyScore} />
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <span className="text-xs text-graphite/50 capitalize">{species}</span>
          </div>
          <p className="mt-2 text-sm text-graphite/65 line-clamp-2">{description}</p>
        </div>
        <ChevronRight
          className="h-5 w-5 shrink-0 text-graphite/30 self-center"
          aria-hidden
        />
      </article>
    </Link>
  );
}
