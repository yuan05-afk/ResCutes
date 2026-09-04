"use client";

import { Camera, MapPin } from "lucide-react";
import { MapView } from "@/components/map/map-view-dynamic";
import { markerColorForUrgency } from "@/components/map/map-constants";
import { AnimalImage } from "@/components/ui/animal-image";
import { cn } from "@/lib/utils";

interface CaseMediaStripProps {
  photoSrc: string;
  species: string;
  photoAlt?: string;
  photoCaption?: string;
  latitude: number;
  longitude: number;
  locationLabel?: string;
  caseId: string;
  caseNumber: string;
  urgencyLevel: string;
  className?: string;
  mapInteractive?: boolean;
  compact?: boolean;
}

function markerColor(urgencyLevel: string) {
  return markerColorForUrgency(urgencyLevel);
}

const mediaHeights = {
  default: "h-[min(42vw,220px)] min-h-[180px] sm:h-[220px]",
  compact: "h-[140px] sm:h-[150px]",
};

export function CaseMediaStrip({
  photoSrc,
  species,
  photoAlt = "Animal",
  photoCaption,
  latitude,
  longitude,
  locationLabel,
  caseId,
  caseNumber,
  urgencyLevel,
  className,
  mapInteractive = true,
  compact = false,
}: CaseMediaStripProps) {
  const heightClass = compact ? mediaHeights.compact : mediaHeights.default;

  return (
    <div
      className={cn(
        "grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-sage/20 bg-sage/10",
          heightClass,
        )}
      >
        <AnimalImage
          src={photoSrc}
          species={species}
          alt={photoAlt}
          containerClassName="absolute inset-0"
          sizes="(max-width: 640px) 100vw, 320px"
          objectPosition="center top"
          expandable
          showExpandHint
          lightboxCaption={photoCaption ?? caseNumber}
        />
        <span className="pointer-events-none absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-md bg-graphite/65 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          <Camera className="h-3 w-3" aria-hidden />
          Photo
        </span>
      </div>

      <div className={cn("relative", heightClass)}>
        <MapView
          className="h-full w-full overflow-hidden rounded-xl border border-sage/20"
          center={{ latitude, longitude }}
          zoom={14}
          compactLegend
          markers={[
            {
              id: caseId,
              latitude,
              longitude,
              caseNumber,
              species,
              urgencyLevel,
              address: locationLabel,
              color: markerColor(urgencyLevel),
              photoUrl: photoSrc,
            },
          ]}
          interactive={mapInteractive}
        />
        <span className="pointer-events-none absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-md bg-graphite/65 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          <MapPin className="h-3 w-3" aria-hidden />
          Location
        </span>
      </div>
    </div>
  );
}

export function CaseMediaStripSkeleton({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const heightClass = compact ? mediaHeights.compact : mediaHeights.default;

  return (
    <div
      className={cn(
        "grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]",
        className,
      )}
    >
      <div className={cn("animate-pulse rounded-xl bg-sage/15", heightClass)} />
      <div className={cn("animate-pulse rounded-xl bg-sage/10", heightClass)} />
    </div>
  );
}
