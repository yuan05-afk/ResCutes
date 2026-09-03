"use client";

import Link from "next/link";
import {
  ExternalLink,
  Globe,
  Mail,
  MapPinned,
  Navigation,
  Phone,
} from "lucide-react";
import {
  formatFullShelterAddress,
  googleMapsDirectionsUrl,
  googleMapsPinUrl,
  mailtoHref,
  shelterMapAppHref,
  telHref,
} from "@/lib/maps/shelter-links";
import { cn } from "@/lib/utils";

export interface ShelterContactInfo {
  name: string;
  address: string;
  city?: string;
  region?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  /** Directory id for deep-link to /shelters map */
  directoryId?: string | null;
  notes?: string | null;
}

interface ShelterContactBlockProps {
  shelter: ShelterContactInfo;
  /** Hide the in-app map link when already on the map page */
  hideAppMapLink?: boolean;
  className?: string;
  compact?: boolean;
}

export function ShelterContactBlock({
  shelter,
  hideAppMapLink = false,
  className,
  compact = false,
}: ShelterContactBlockProps) {
  const fullAddress = formatFullShelterAddress(
    shelter.address,
    shelter.city,
    shelter.region,
  );
  const hasCoords =
    typeof shelter.latitude === "number" &&
    typeof shelter.longitude === "number" &&
    Number.isFinite(shelter.latitude) &&
    Number.isFinite(shelter.longitude);

  const phoneLink = shelter.phone ? telHref(shelter.phone) : null;
  const emailLink = shelter.email ? mailtoHref(shelter.email) : null;
  const mapsPin = hasCoords
    ? googleMapsPinUrl(shelter.latitude!, shelter.longitude!)
    : null;
  const mapsDirections = hasCoords
    ? googleMapsDirectionsUrl(shelter.latitude!, shelter.longitude!)
    : null;
  const appMapHref =
    !hideAppMapLink && shelter.directoryId
      ? shelterMapAppHref(shelter.directoryId)
      : null;

  const textClass = compact
    ? "text-xs text-graphite/70"
    : "text-sm text-graphite/70";
  const linkClass =
    "font-medium text-evergreen underline-offset-2 hover:underline";

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("flex items-start gap-2", textClass)}>
        <MapPinned
          className={cn(
            "mt-0.5 shrink-0 text-evergreen/80",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
          )}
          aria-hidden
        />
        <div className="min-w-0 space-y-1">
          {mapsPin ? (
            <a
              href={mapsPin}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("block leading-snug", linkClass)}
              title="Open in Google Maps"
            >
              {fullAddress}
            </a>
          ) : (
            <p className="leading-snug text-graphite/65">{fullAddress}</p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {mapsPin ? (
              <a
                href={mapsPin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-evergreen hover:underline"
              >
                Google Maps
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            ) : null}
            {mapsDirections ? (
              <a
                href={mapsDirections}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-evergreen hover:underline"
              >
                <Navigation className="h-3 w-3" aria-hidden />
                Directions
              </a>
            ) : null}
            {appMapHref ? (
              <Link
                href={appMapHref}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-evergreen hover:underline"
              >
                View on shelter map
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {shelter.phone ? (
        <p className={cn("flex items-center gap-2", textClass)}>
          <Phone
            className={cn(
              "shrink-0 text-evergreen/80",
              compact ? "h-3.5 w-3.5" : "h-4 w-4",
            )}
            aria-hidden
          />
          {phoneLink ? (
            <a href={phoneLink} className={linkClass}>
              {shelter.phone}
            </a>
          ) : (
            <span>{shelter.phone}</span>
          )}
        </p>
      ) : (
        <p className={cn("flex items-center gap-2 text-graphite/45", textClass)}>
          <Phone
            className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")}
            aria-hidden
          />
          No public phone listed
        </p>
      )}

      {shelter.email ? (
        <p className={cn("flex items-center gap-2", textClass)}>
          <Mail
            className={cn(
              "shrink-0 text-evergreen/80",
              compact ? "h-3.5 w-3.5" : "h-4 w-4",
            )}
            aria-hidden
          />
          {emailLink ? (
            <a href={emailLink} className={cn(linkClass, "break-all")}>
              {shelter.email}
            </a>
          ) : (
            <span className="break-all">{shelter.email}</span>
          )}
        </p>
      ) : null}

      {shelter.website ? (
        <p className={cn("flex items-center gap-2", textClass)}>
          <Globe
            className={cn(
              "shrink-0 text-evergreen/80",
              compact ? "h-3.5 w-3.5" : "h-4 w-4",
            )}
            aria-hidden
          />
          <a
            href={shelter.website}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("inline-flex items-center gap-1 break-all", linkClass)}
          >
            {shelter.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
          </a>
        </p>
      ) : null}

      {shelter.notes ? (
        <p
          className={cn(
            "leading-relaxed text-graphite/55",
            compact ? "text-[11px] line-clamp-3" : "text-xs",
          )}
        >
          {shelter.notes}
        </p>
      ) : null}
    </div>
  );
}
