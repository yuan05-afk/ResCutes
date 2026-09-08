"use client";

import { useMemo, useState } from "react";
import { MapView } from "@/components/map/map-view-dynamic";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";
import {
  MAP_MARKER_COLORS,
  markerColorForUrgency,
  type MapLegendItem,
} from "@/components/map/map-constants";
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

const URGENCY_LEGEND: MapLegendItem[] = [
  {
    id: "critical",
    label: "Critical",
    compactLabel: "Crit",
    description: "Highest urgency field cases",
    color: MAP_MARKER_COLORS.critical,
  },
  {
    id: "high",
    label: "High",
    compactLabel: "High",
    description: "High urgency field cases",
    color: MAP_MARKER_COLORS.high,
  },
  {
    id: "standard",
    label: "Standard",
    compactLabel: "Std",
    description: "Medium and low urgency cases",
    color: MAP_MARKER_COLORS.standard,
  },
];

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
  const [showCritical, setShowCritical] = useState(true);
  const [showHigh, setShowHigh] = useState(true);
  const [showStandard, setShowStandard] = useState(true);

  const caseCounts = useMemo(() => {
    let standard = 0;
    let critical = 0;
    let high = 0;
    for (const c of cases) {
      if (c.urgencyLevel === "critical") critical += 1;
      else if (c.urgencyLevel === "high") high += 1;
      else standard += 1;
    }
    return { standard, critical, high, total: cases.length };
  }, [cases]);

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

  const hiddenLegendLayers = useMemo(() => {
    const layers: string[] = [];
    if (!showCritical) layers.push("critical");
    if (!showHigh) layers.push("high");
    if (!showStandard) layers.push("standard");
    return layers;
  }, [showCritical, showHigh, showStandard]);

  function handleHiddenLegendLayersChange(layers: string[]) {
    const hidden = new Set(layers);
    setShowCritical(!hidden.has("critical"));
    setShowHigh(!hidden.has("high"));
    setShowStandard(!hidden.has("standard"));
  }

  const firstVisible = useMemo(() => {
    return (
      cases.find((c) => {
        if (c.urgencyLevel === "critical") return showCritical;
        if (c.urgencyLevel === "high") return showHigh;
        return showStandard;
      }) ?? null
    );
  }, [cases, showCritical, showHigh, showStandard]);

  return (
    <div className={cn("flex h-full min-h-[180px] flex-col", className)}>
      <div className="shrink-0 border-b border-sage/15 bg-white/90 px-2 py-1.5">
        <div
          className="flex w-full gap-1"
          role="group"
          aria-label="Case urgency filters"
        >
          <LayerChip
            active={showCritical}
            onClick={() => setShowCritical((v) => !v)}
            label="Critical"
            count={caseCounts.critical}
            swatch={MAP_MARKER_COLORS.critical}
            className="min-w-0 flex-1"
          />
          <LayerChip
            active={showHigh}
            onClick={() => setShowHigh((v) => !v)}
            label="High"
            count={caseCounts.high}
            swatch={MAP_MARKER_COLORS.high}
            className="min-w-0 flex-1"
          />
          <LayerChip
            active={showStandard}
            onClick={() => setShowStandard((v) => !v)}
            label="Standard"
            count={caseCounts.standard}
            swatch={MAP_MARKER_COLORS.standard}
            className="min-w-0 flex-1"
          />
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <MapView
          className="h-full min-h-[160px] overflow-hidden rounded-b-lg"
          zoom={11}
          compactLegend
          legend="none"
          legendItems={URGENCY_LEGEND}
          interactiveLegend
          hiddenLegendLayers={hiddenLegendLayers}
          onHiddenLegendLayersChange={handleHiddenLegendLayersChange}
          markers={markers}
          onMarkerClick={onMarkerClick}
          selectedMarkerId={selectedMarkerId}
          cameraRequestId={cameraRequestId}
          fitVisibleMarkers
          flyToSelectedMarker
          pinSelectedPopup
          selectedMarkerZoom={15}
          center={
            firstVisible
              ? {
                  latitude: firstVisible.latitude,
                  longitude: firstVisible.longitude,
                }
              : {
                  latitude: DEMO_GEO.center.latitude,
                  longitude: DEMO_GEO.center.longitude,
                }
          }
        />
      </div>
    </div>
  );
}

function LayerChip({
  active,
  onClick,
  label,
  swatch,
  count,
  className,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  swatch?: string;
  count?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 min-h-8 items-center justify-center gap-0.5 overflow-visible rounded-full border px-1 text-[8px] font-semibold leading-snug sm:gap-1 sm:px-1.5 sm:text-[9px]",
        active
          ? "border-evergreen bg-evergreen/10 text-evergreen"
          : "border-sage/30 bg-white text-graphite/55",
        className,
      )}
    >
      {swatch ? (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full ring-1 ring-black/10 sm:h-2 sm:w-2"
          style={{ backgroundColor: swatch, opacity: active ? 1 : 0.35 }}
          aria-hidden
        />
      ) : null}
      <span className="whitespace-nowrap">{label}</span>
      {typeof count === "number" ? (
        <span className="shrink-0 tabular-nums text-[8px] opacity-70 sm:text-[9px]">
          {count}
        </span>
      ) : null}
    </button>
  );
}
