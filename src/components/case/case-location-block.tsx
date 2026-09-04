"use client";

import { ExternalLink, MapPinned, Navigation, StickyNote } from "lucide-react";
import {
  formatCaseCoordinates,
  formatCaseLocationDisplay,
  googleMapsCaseDirectionsUrl,
  googleMapsCasePinUrl,
  type CaseMapsLocation,
} from "@/lib/maps/case-links";
import { cn } from "@/lib/utils";
import { stripEmDashes } from "@/lib/text/sanitize-copy";

export interface CaseLocationInfo extends CaseMapsLocation {
  isApproximate?: boolean;
  rescuerNote?: string | null;
  showRescuerNote?: boolean;
}

interface CaseLocationBlockProps {
  location: CaseLocationInfo;
  className?: string;
  compact?: boolean;
}

export function CaseLocationBlock({
  location,
  className,
  compact = false,
}: CaseLocationBlockProps) {
  const display = stripEmDashes(formatCaseLocationDisplay(location));
  const mapsPin = googleMapsCasePinUrl(location);
  const mapsDirections = googleMapsCaseDirectionsUrl(location);
  const coords = formatCaseCoordinates(location.latitude, location.longitude);

  const textClass = compact
    ? "text-xs text-graphite/70"
    : "text-sm text-graphite/70";
  const linkClass =
    "font-medium text-evergreen underline-offset-2 hover:underline";

  return (
    <div
      className={cn(
        "rounded-xl border border-sage/25 bg-white p-3 shadow-sm",
        className,
      )}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
          Report location
        </p>
        {location.isApproximate ? (
          <span className="rounded-full bg-ochre/10 px-2 py-0.5 text-[10px] font-semibold text-ochre">
            Approximate area
          </span>
        ) : (
          <span className="rounded-full bg-evergreen/10 px-2 py-0.5 text-[10px] font-semibold text-evergreen">
            Exact coordinates
          </span>
        )}
      </div>

      <div className={cn("flex items-start gap-2", textClass)}>
        <MapPinned
          className={cn(
            "mt-0.5 shrink-0 text-evergreen/80",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
          )}
          aria-hidden
        />
        <div className="min-w-0 space-y-1">
          <a
            href={mapsPin}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("block leading-snug", linkClass)}
            title={`Open ${location.caseNumber} in Google Maps`}
          >
            {display}
          </a>
          <p className="text-[11px] text-graphite/50">{coords}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <a
              href={mapsPin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-evergreen hover:underline"
            >
              Google Maps
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
            <a
              href={mapsDirections}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-evergreen hover:underline"
            >
              <Navigation className="h-3 w-3" aria-hidden />
              Directions
            </a>
          </div>
        </div>
      </div>

      {location.showRescuerNote && location.rescuerNote ? (
        <div className="mt-3 rounded-lg border border-sage/15 bg-bone/40 px-2.5 py-2">
          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
            <StickyNote className="h-3 w-3" aria-hidden />
            Note for rescuer
          </p>
          <p
            className={cn(
              "leading-relaxed text-graphite/75",
              compact ? "text-[11px]" : "text-xs",
            )}
          >
            {stripEmDashes(location.rescuerNote)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
