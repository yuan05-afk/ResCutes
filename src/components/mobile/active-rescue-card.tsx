"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Navigation } from "lucide-react";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { RescueProgress } from "@/components/mobile/rescue-progress";
import { MapView } from "@/components/map/map-view-dynamic";
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
  approximateLat: number;
  approximateLon: number;
  rescuerName?: string;
  shelterName?: string;
  shelterLat?: number;
  shelterLon?: number;
  detailHref?: string;
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
  approximateLat,
  approximateLon,
  rescuerName,
  shelterName,
  shelterLat,
  shelterLon,
  detailHref,
}: ActiveRescueCardProps) {
  const { startPending } = useNavigationPending();
  const progressIndex = getCitizenProgressIndex(status);
  const imageUrl = getCasePhotoUrl(species, photoUrl, caseId);
  const linkHref = detailHref ?? `/mobile/cases/${caseId}`;

  const markers = [
    {
      id: "animal",
      latitude: approximateLat,
      longitude: approximateLon,
      label: "Approximate location",
      color: "#C7513A",
    },
  ];

  if (shelterLat && shelterLon) {
    markers.push({
      id: "shelter",
      latitude: shelterLat,
      longitude: shelterLon,
      label: shelterName ?? "Shelter",
      color: "#183C35",
    });
  }

  return (
    <article className="rounded-2xl border border-sage/25 bg-white shadow-card overflow-hidden">
      <Link
        href={linkHref}
        prefetch
        onClick={() => startPending(linkHref)}
        className="block group transition-shadow hover:shadow-card-hover"
      >
        <div className="p-4 pb-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-graphite/50">
            Active Rescue Case
          </p>
          <div className="mt-2 flex items-start justify-between gap-2">
            <h2 className="text-lg font-bold text-graphite">{caseNumber}</h2>
            {urgencyScore > 0 && (
              <UrgencyBadge level={urgencyLevel} score={urgencyScore} size="md" />
            )}
          </div>
          <p className="mt-1 text-sm font-semibold text-graphite">
            {getCitizenStatusLabel(status)}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-graphite/60">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              Approximate location
            </span>
            {rescuerName && (
              <span className="flex items-center gap-1">
                <Navigation className="h-3.5 w-3.5" aria-hidden />
                {rescuerName} is responding
              </span>
            )}
          </div>
        </div>

        <div className="relative mt-3 h-44 w-full bg-sage/15">
          <Image
            src={imageUrl}
            alt={`${formatStatus(species)} rescue case`}
            fill
            className="object-cover object-center"
            unoptimized
            sizes="(max-width: 480px) 100vw, 480px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-sm text-white/90 line-clamp-2 drop-shadow">{description}</p>
          </div>
        </div>

        {progressIndex >= 0 && (
          <div className="px-4 py-4 border-t border-sage/15">
            <RescueProgress currentIndex={progressIndex} />
          </div>
        )}
      </Link>

      <div className="px-4 pb-4 pointer-events-none">
        <MapView
          className="h-32 rounded-xl overflow-hidden border border-sage/20"
          center={{ latitude: approximateLat, longitude: approximateLon }}
          zoom={12}
          markers={markers}
          interactive={false}
        />
      </div>
    </article>
  );
}
