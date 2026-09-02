"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapView } from "@/components/map/map-view-dynamic";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";
import { markerColorForUrgency } from "@/components/map/map-constants";
import { Card, CardContent } from "@/components/ui/card";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { StatusBadge } from "@/components/status/status-badge";
import { CasePeekSheet, type CasePeekData } from "@/components/mobile/case-peek-sheet";
import { useNavigationPending } from "@/components/layout/NavigationPending";
import { useState } from "react";

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
  photoUrl?: string;
}

export function NearbyMapClient({ cases }: { cases: CaseItem[] }) {
  const router = useRouter();
  const { startPending } = useNavigationPending();
  const [peekCase, setPeekCase] = useState<CasePeekData | null>(null);

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

  const center =
    cases.length > 0
      ? { latitude: cases[0].latitude, longitude: cases[0].longitude }
      : {
          latitude: DEMO_GEO.center.latitude,
          longitude: DEMO_GEO.center.longitude,
        };

  function openPeek(caseItem: CaseItem) {
    setPeekCase({
      id: caseItem.id,
      caseNumber: caseItem.caseNumber,
      species: caseItem.species,
      urgencyLevel: caseItem.urgencyLevel,
      urgencyScore: caseItem.urgencyScore,
      status: caseItem.status,
      description: caseItem.description,
      photoUrl: caseItem.photoUrl,
    });
  }

  function prefetchCase(id: string) {
    router.prefetch(`/mobile/cases/${id}`);
  }

  return (
    <>
      <div className="flex flex-col">
        <MapView
          className="h-[45vh] min-h-[240px]"
          center={center}
          zoom={11}
          compactLegend
          markers={markers}
          onMarkerClick={(id) => {
            const match = cases.find((c) => c.id === id);
            if (match) openPeek(match);
          }}
          selectedMarkerId={peekCase?.id}
        />
        <div className="px-4 py-4 space-y-3">
          {cases.length === 0 ? (
            <p className="text-center text-sm text-graphite/70 py-8">
              No verified cases nearby at the moment.
            </p>
          ) : (
            cases.map((c) => {
              const href = `/mobile/cases/${c.id}`;
              return (
                <Link
                  key={c.id}
                  href={href}
                  prefetch
                  onMouseEnter={() => prefetchCase(c.id)}
                  onTouchStart={() => prefetchCase(c.id)}
                  onClick={() => startPending(href)}
                >
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
              );
            })
          )}
        </div>
      </div>

      <CasePeekSheet caseItem={peekCase} onClose={() => setPeekCase(null)} />
    </>
  );
}
