"use client";

import { MapView } from "@/components/map/map-view-dynamic";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";
import { cn } from "@/lib/utils";

interface CaseMapItem {
  id: string;
  latitude: number;
  longitude: number;
  caseNumber: string;
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
    label: c.caseNumber,
    color:
      c.urgencyLevel === "critical"
        ? "#C7513A"
        : c.urgencyLevel === "high"
          ? "#C9912F"
          : "#183C35",
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
