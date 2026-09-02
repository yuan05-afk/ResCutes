"use client";

import Link from "next/link";
import { MapView } from "@/components/map/map-view-dynamic";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";
import { Card, CardContent } from "@/components/ui/card";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { StatusBadge } from "@/components/status/status-badge";
import { formatStatus } from "@/lib/utils";

interface CaseItem {
  id: string;
  caseNumber: string;
  species: string;
  urgencyLevel: string;
  urgencyScore: number;
  status: string;
  latitude: number;
  longitude: number;
  description: string;
}

export function NearbyMapClient({ cases }: { cases: CaseItem[] }) {
  const markers = cases.map((c) => ({
    id: c.id,
    latitude: c.latitude,
    longitude: c.longitude,
    label: `${c.caseNumber} — ${formatStatus(c.species)}`,
    color:
      c.urgencyLevel === "critical"
        ? "#C7513A"
        : c.urgencyLevel === "high"
          ? "#C9912F"
          : "#183C35",
  }));

  const center =
    cases.length > 0
      ? { latitude: cases[0].latitude, longitude: cases[0].longitude }
      : {
          latitude: DEMO_GEO.center.latitude,
          longitude: DEMO_GEO.center.longitude,
        };

  return (
    <div className="flex flex-col">
      <MapView
        className="h-[45vh] min-h-[240px]"
        center={center}
        zoom={11}
        markers={markers}
      />
      <div className="px-4 py-4 space-y-3">
        {cases.length === 0 ? (
          <p className="text-center text-sm text-graphite/70 py-8">
            No verified cases nearby at the moment.
          </p>
        ) : (
          cases.map((c) => (
            <Link key={c.id} href={`/mobile/cases/${c.id}`}>
              <Card className="hover:border-evergreen/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{c.caseNumber}</span>
                    <UrgencyBadge level={c.urgencyLevel} score={c.urgencyScore} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={c.status} />
                    <span className="text-xs text-graphite/60 capitalize">{c.species}</span>
                  </div>
                  <p className="text-sm text-graphite/70 line-clamp-2">{c.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
