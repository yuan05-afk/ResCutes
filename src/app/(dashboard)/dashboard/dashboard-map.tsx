"use client";

import { MapView } from "@/components/map/map-view-dynamic";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";
import { markerColorForUrgency } from "@/components/map/map-constants";
import { cn } from "@/lib/utils";

interface CaseMapItem {
  id: string;
  latitude: number;
  longitude: number;
  caseNumber: string;
  species: string;
  status: string;
  urgencyLevel: string;
}

export function DashboardMapClient({
  cases,
  onMarkerClick,
  selectedMarkerId,
  className,
}: {
  cases: CaseMapItem[];
  onMarkerClick?: (id: string) => void;
  selectedMarkerId?: string;
  className?: string;
}) {
  const markers = cases.map((c) => ({
    id: c.id,
    latitude: c.latitude,
    longitude: c.longitude,
    caseNumber: c.caseNumber,
    species: c.species,
    status: c.status,
    urgencyLevel: c.urgencyLevel,
    color: markerColorForUrgency(c.urgencyLevel),
  }));

  return (
    <MapView
      className={cn("h-full min-h-[180px] rounded-lg overflow-hidden", className)}
      zoom={11}
      markers={markers}
      onMarkerClick={onMarkerClick}
      selectedMarkerId={selectedMarkerId}
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
