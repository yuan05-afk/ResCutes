"use client";

import { MapView } from "@/components/map/map-view-dynamic";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";

interface CaseMapItem {
  id: string;
  latitude: number;
  longitude: number;
  caseNumber: string;
  urgencyLevel: string;
}

export function DashboardMapClient({ cases }: { cases: CaseMapItem[] }) {
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
      className="h-[340px] rounded-xl overflow-hidden"
      zoom={11}
      markers={markers}
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
