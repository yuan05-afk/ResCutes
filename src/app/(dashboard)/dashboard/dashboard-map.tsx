"use client";

import { useMemo } from "react";
import { MapView } from "@/components/map/map-view-dynamic";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";
import { markerColorForUrgency } from "@/components/map/map-constants";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { cn } from "@/lib/utils";

interface CaseMapItem {
  id: string;
  latitude: number;
  longitude: number;
  caseNumber: string;
  species: string;
  status: string;
  urgencyLevel: string;
  photoUrl?: string;
}

export function DashboardMapClient({
  cases,
  onMarkerClick,
  selectedMarkerId,
  cameraRequestId,
  className,
}: {
  cases: CaseMapItem[];
  onMarkerClick?: (id: string) => void;
  selectedMarkerId?: string;
  cameraRequestId?: number;
  className?: string;
}) {
  const markers = useMemo(
    () =>
      cases.map((c) => ({
        id: c.id,
        latitude: c.latitude,
        longitude: c.longitude,
        caseNumber: c.caseNumber,
        species: c.species,
        status: c.status,
        urgencyLevel: c.urgencyLevel,
        color: markerColorForUrgency(c.urgencyLevel),
        photoUrl: getCasePhotoUrl(c.species, c.photoUrl, c.id),
        legendLayerId:
          c.urgencyLevel === "critical"
            ? "critical"
            : c.urgencyLevel === "high"
              ? "high"
              : "standard",
      })),
    [cases],
  );

  return (
    <MapView
      className={cn("h-full min-h-[180px] rounded-lg overflow-hidden", className)}
      zoom={11}
      markers={markers}
      onMarkerClick={onMarkerClick}
      selectedMarkerId={selectedMarkerId}
      cameraRequestId={cameraRequestId}
      fitVisibleMarkers
      flyToSelectedMarker
      pinSelectedPopup
      selectedMarkerZoom={15}
      center={
        cases.length > 0
          ? { latitude: cases[0].latitude, longitude: cases[0].longitude }
          : {
              latitude: DEMO_GEO.center.latitude,
              longitude: DEMO_GEO.center.longitude,
            }
      }
    />
  );
}
