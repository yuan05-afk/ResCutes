"use client";

import { useMemo, useState } from "react";
import {
  Navigation,
  Phone,
  MapPinned,
  X,
  LocateFixed,
  Loader2,
} from "lucide-react";
import { MapView } from "@/components/map/map-view-dynamic";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";
import {
  MAP_MARKER_COLORS,
  SHELTER_PIN_COLOR,
  markerColorForUrgency,
  type MapLegendItem,
} from "@/components/map/map-constants";
import {
  CasePeekSheet,
  type CasePeekData,
} from "@/components/mobile/case-peek-sheet";
import { NearestShelterQuiz } from "@/components/mobile/nearest-shelter-quiz";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ShelterSpeciesProfile } from "@/lib/data/philippines-shelters-directory";
import { sortByDistanceKm } from "@/lib/maps/geo-distance";
import {
  findNearestMatchingShelter,
  nearestAnimalLabel,
  type NearestQuizAnswers,
} from "@/lib/maps/nearest-shelter-match";
import {
  googleMapsDirectionsUrl,
  googleMapsPinUrl,
  telHref,
  type ShelterMapsLocation,
} from "@/lib/maps/shelter-links";
import { cn } from "@/lib/utils";

type LayerId = "shelters" | "critical" | "high" | "standard";

export interface HomeMapShelter {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  speciesAccepted: string[];
  speciesProfile: ShelterSpeciesProfile;
  speciesLabel: string;
  capabilities?: string[];
}

export interface HomeMapCase {
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

interface HomeMapClientProps {
  shelters: HomeMapShelter[];
  cases: HomeMapCase[];
  showCasesLayer: boolean;
}

type Peek =
  | {
      kind: "shelter";
      shelter: HomeMapShelter;
      distanceKm?: number;
      matchNote?: string;
    }
  | { kind: "case"; caseItem: CasePeekData };

export function HomeMapClient({
  shelters,
  cases,
  showCasesLayer,
}: HomeMapClientProps) {
  const [showShelters, setShowShelters] = useState(true);
  const [showCritical, setShowCritical] = useState(true);
  const [showHigh, setShowHigh] = useState(true);
  const [showStandard, setShowStandard] = useState(true);
  const [peek, setPeek] = useState<Peek | null>(null);
  const [locationExplainOpen, setLocationExplainOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [cameraCenter, setCameraCenter] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: DEMO_GEO.center.latitude,
    longitude: DEMO_GEO.center.longitude,
  });
  const [cameraZoom, setCameraZoom] = useState(11);
  const [cameraRequestId, setCameraRequestId] = useState(0);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | undefined>();

  const markers = useMemo(() => {
    const list = [];
    for (const s of shelters) {
      list.push({
        id: `shelter:${s.id}`,
        latitude: s.latitude,
        longitude: s.longitude,
        label: s.name,
        address: s.address,
        phone: s.phone,
        region: s.region,
        color: SHELTER_PIN_COLOR,
        legendLayerId: "shelters",
      });
    }
    if (showCasesLayer) {
      for (const c of cases) {
        const level = c.urgencyLevel;
        list.push({
          id: `case:${c.id}`,
          latitude: c.latitude,
          longitude: c.longitude,
          caseNumber: c.caseNumber,
          species: c.species,
          status: c.status,
          urgencyLevel: c.urgencyLevel,
          color: markerColorForUrgency(c.urgencyLevel),
          photoUrl: c.photoUrl,
          label: `${c.caseNumber} ${c.species}`,
          legendLayerId:
            level === "critical"
              ? "critical"
              : level === "high"
                ? "high"
                : "standard",
        });
      }
    }
    return list;
  }, [shelters, cases, showCasesLayer]);

  const legendItems: MapLegendItem[] = useMemo(() => {
    const items: MapLegendItem[] = [
      {
        id: "shelters",
        label: "Shelters",
        description: "Rescue shelters and partners",
        color: SHELTER_PIN_COLOR,
      },
    ];
    if (showCasesLayer) {
      items.push(
        {
          id: "critical",
          label: "Critical",
          description: "Highest urgency field cases",
          color: MAP_MARKER_COLORS.critical,
        },
        {
          id: "high",
          label: "High",
          description: "High urgency field cases",
          color: MAP_MARKER_COLORS.high,
        },
        {
          id: "standard",
          label: "Standard",
          description: "Medium and low urgency cases",
          color: MAP_MARKER_COLORS.standard,
        },
      );
    }
    return items;
  }, [showCasesLayer]);

  const hiddenLegendLayers = useMemo(() => {
    const layers: string[] = [];
    if (!showShelters) layers.push("shelters");
    if (showCasesLayer) {
      if (!showCritical) layers.push("critical");
      if (!showHigh) layers.push("high");
      if (!showStandard) layers.push("standard");
    }
    return layers;
  }, [
    showShelters,
    showCasesLayer,
    showCritical,
    showHigh,
    showStandard,
  ]);

  function handleHiddenLegendLayersChange(layers: string[]) {
    const prevHidden = new Set(hiddenLegendLayers);
    const nextHidden = new Set(layers);

    setShowShelters(!nextHidden.has("shelters"));
    if (showCasesLayer) {
      setShowCritical(!nextHidden.has("critical"));
      setShowHigh(!nextHidden.has("high"));
      setShowStandard(!nextHidden.has("standard"));
    }

    const layerOrder: LayerId[] = [
      "shelters",
      "critical",
      "high",
      "standard",
    ];
    for (const layerId of layerOrder) {
      if (prevHidden.has(layerId) && !nextHidden.has(layerId)) {
        // Newly turned on via legend - fly to nearest for feedback.
        window.setTimeout(() => focusNearestInLayer(layerId), 0);
        break;
      }
    }
  }

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

  function referencePoint() {
    return userCoords ?? cameraCenter;
  }

  /** Smooth pan/zoom only - no peek sheet or pinned popup. */
  function focusNearestInLayer(layerId: LayerId) {
    const from = referencePoint();
    let target: { latitude: number; longitude: number } | null = null;

    if (layerId === "shelters") {
      if (shelters.length === 0) return;
      const nearest = sortByDistanceKm(shelters, from)[0];
      if (nearest) {
        target = {
          latitude: nearest.latitude,
          longitude: nearest.longitude,
        };
      }
    } else {
      const filtered = cases.filter((c) => {
        if (layerId === "critical") return c.urgencyLevel === "critical";
        if (layerId === "high") return c.urgencyLevel === "high";
        return c.urgencyLevel !== "critical" && c.urgencyLevel !== "high";
      });
      if (filtered.length === 0) return;
      const nearest = sortByDistanceKm(filtered, from)[0];
      if (nearest) {
        target = {
          latitude: nearest.latitude,
          longitude: nearest.longitude,
        };
      }
    }

    if (!target) return;

    setPeek(null);
    setSelectedMarkerId(undefined);
    setCameraZoom(14);
    setCameraCenter(target);
    setCameraRequestId((n) => n + 1);
  }

  function toggleLayer(layerId: LayerId, currentlyOn: boolean) {
    const turnOn = !currentlyOn;
    if (layerId === "shelters") setShowShelters(turnOn);
    else if (layerId === "critical") setShowCritical(turnOn);
    else if (layerId === "high") setShowHigh(turnOn);
    else setShowStandard(turnOn);

    if (turnOn) {
      window.setTimeout(() => focusNearestInLayer(layerId), 0);
    }
  }

  function openShelter(
    shelter: HomeMapShelter,
    distanceKm?: number,
    matchNote?: string,
  ) {
    setPeek({ kind: "shelter", shelter, distanceKm, matchNote });
    setSelectedMarkerId(`shelter:${shelter.id}`);
    setCameraZoom(14);
    setCameraCenter({
      latitude: shelter.latitude,
      longitude: shelter.longitude,
    });
    setCameraRequestId((n) => n + 1);
  }

  function openCase(caseItem: HomeMapCase) {
    setPeek({
      kind: "case",
      caseItem: {
        id: caseItem.id,
        caseNumber: caseItem.caseNumber,
        species: caseItem.species,
        urgencyLevel: caseItem.urgencyLevel,
        urgencyScore: caseItem.urgencyScore,
        status: caseItem.status,
        description: caseItem.description,
        photoUrl: caseItem.photoUrl,
      },
    });
    setSelectedMarkerId(`case:${caseItem.id}`);
    setCameraZoom(14);
    setCameraCenter({
      latitude: caseItem.latitude,
      longitude: caseItem.longitude,
    });
    setCameraRequestId((n) => n + 1);
  }

  function handleMarkerClick(id: string) {
    if (id.startsWith("shelter:")) {
      const shelterId = id.slice("shelter:".length);
      const shelter = shelters.find((s) => s.id === shelterId);
      if (shelter) openShelter(shelter);
      return;
    }
    if (id.startsWith("case:")) {
      const caseId = id.slice("case:".length);
      const match = cases.find((c) => c.id === caseId);
      if (match) openCase(match);
    }
  }

  function requestUserLocation() {
    setLocationError(null);
    setPeek(null);
    setSelectedMarkerId(undefined);
    setLocating(true);
    if (!navigator.geolocation) {
      setLocating(false);
      setLocationError(
        "Location is not available on this device. Browse the map or pick a shelter marker.",
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setCameraCenter({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setCameraRequestId((n) => n + 1);
        setQuizOpen(true);
      },
      () => {
        setLocating(false);
        setLocationError(
          "Location access was denied. You can still tap shelter markers on the map.",
        );
      },
      { timeout: 12000, enableHighAccuracy: true },
    );
  }

  function completeNearestQuiz(answers: NearestQuizAnswers) {
    setQuizOpen(false);
    if (!userCoords) {
      setLocationError("Location was lost. Tap Nearest and try again.");
      return;
    }

    const match = findNearestMatchingShelter(shelters, userCoords, answers);
    if (!match) {
      setLocationError("No shelters are available on the map yet.");
      return;
    }

    setShowShelters(true);
    openShelter(
      match,
      match.distanceKm,
      `Best match for ${nearestAnimalLabel(answers.animal)} · ${match.speciesLabel}`,
    );
  }

  const shelterPeek = peek?.kind === "shelter" ? peek : null;
  const mapsLocation: ShelterMapsLocation | null = shelterPeek
    ? {
        name: shelterPeek.shelter.name,
        address: shelterPeek.shelter.address,
        city: shelterPeek.shelter.city,
        region: shelterPeek.shelter.region,
        latitude: shelterPeek.shelter.latitude,
        longitude: shelterPeek.shelter.longitude,
      }
    : null;
  const phoneLink = shelterPeek?.shelter.phone
    ? telHref(shelterPeek.shelter.phone)
    : null;

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <header className="z-20 shrink-0 border-b border-sage/20 bg-white/95 px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base font-bold text-graphite">Map</h1>
            <p className="truncate text-[11px] text-graphite/50">
              {showCasesLayer
                ? "Shelters and field cases nearby"
                : "Nearby shelters"}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-h-10 shrink-0 rounded-full px-3"
            disabled={locating || shelters.length === 0}
            onClick={() => setLocationExplainOpen(true)}
          >
            {locating ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="mr-1.5 h-4 w-4" />
            )}
            Nearest
          </Button>
        </div>

        <div
          className="mt-1.5 flex w-full gap-1"
          role="group"
          aria-label="Map layers"
        >
          <LayerChip
            active={showShelters}
            onClick={() => toggleLayer("shelters", showShelters)}
            label="Shelters"
            count={shelters.length}
            swatch={SHELTER_PIN_COLOR}
            className="min-w-0 flex-1"
          />
          {showCasesLayer ? (
            <>
              <LayerChip
                active={showCritical}
                onClick={() => toggleLayer("critical", showCritical)}
                label="Critical"
                count={caseCounts.critical}
                swatch={MAP_MARKER_COLORS.critical}
                className="min-w-0 flex-1"
              />
              <LayerChip
                active={showHigh}
                onClick={() => toggleLayer("high", showHigh)}
                label="High"
                count={caseCounts.high}
                swatch={MAP_MARKER_COLORS.high}
                className="min-w-0 flex-1"
              />
              <LayerChip
                active={showStandard}
                onClick={() => toggleLayer("standard", showStandard)}
                label="Standard"
                count={caseCounts.standard}
                swatch={MAP_MARKER_COLORS.standard}
                className="min-w-0 flex-1"
              />
            </>
          ) : null}
        </div>

        {showCasesLayer && caseCounts.total === 0 ? (
          <p className="mt-1.5 text-[11px] text-graphite/55" role="status">
            No open field cases to plot yet. Needs-review through secured cases
            appear here.
          </p>
        ) : null}

        {locationError ? (
          <p className="mt-1.5 text-xs text-rescue" role="status">
            {locationError}
          </p>
        ) : null}
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <MapView
          className="absolute inset-0 h-full w-full"
          center={cameraCenter}
          zoom={cameraZoom}
          compactLegend
          legend="none"
          legendItems={legendItems}
          interactiveLegend
          hiddenLegendLayers={hiddenLegendLayers}
          onHiddenLegendLayersChange={handleHiddenLegendLayersChange}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          selectedMarkerId={selectedMarkerId}
          flyToSelectedMarker
          pinSelectedPopup
          cameraRequestId={cameraRequestId}
          selectedMarkerZoom={cameraZoom}
          fitVisibleMarkers={false}
        />

        <NearestShelterQuiz
          open={quizOpen}
          onClose={() => setQuizOpen(false)}
          onComplete={completeNearestQuiz}
        />
      </div>

      {shelterPeek && mapsLocation ? (
        <div className="absolute inset-x-0 bottom-0 z-30 max-h-[45%] overflow-y-auto border-t border-sage/20 bg-white px-4 pb-3 pt-3 shadow-elevated">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-graphite">
                {shelterPeek.shelter.name}
              </p>
              <p className="mt-0.5 text-xs text-graphite/55">
                {[shelterPeek.shelter.city, shelterPeek.shelter.region]
                  .filter(Boolean)
                  .join(" · ")}
                {shelterPeek.distanceKm != null
                  ? ` · ${shelterPeek.distanceKm.toFixed(1)} km`
                  : ""}
              </p>
              {shelterPeek.matchNote ? (
                <p className="mt-1 text-xs font-medium text-evergreen">
                  {shelterPeek.matchNote}
                </p>
              ) : (
                <p className="mt-1 text-xs text-graphite/50">
                  Accepts {shelterPeek.shelter.speciesLabel}
                </p>
              )}
            </div>
            <button
              type="button"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full active:bg-bone"
              aria-label="Close shelter details"
              onClick={() => {
                setPeek(null);
                setSelectedMarkerId(undefined);
              }}
            >
              <X className="h-5 w-5 text-graphite/50" />
            </button>
          </div>
          <p className="text-sm text-graphite/75">{shelterPeek.shelter.address}</p>
          {shelterPeek.shelter.phone ? (
            <p className="mt-1 text-sm text-graphite/70">
              {shelterPeek.shelter.phone}
            </p>
          ) : null}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {phoneLink ? (
              <Button asChild variant="outline" className="min-h-11 rounded-full">
                <a href={phoneLink}>
                  <Phone className="mr-1.5 h-4 w-4" />
                  Call
                </a>
              </Button>
            ) : (
              <Button
                variant="outline"
                className="min-h-11 rounded-full"
                disabled
              >
                <Phone className="mr-1.5 h-4 w-4" />
                No phone
              </Button>
            )}
            <Button asChild className="min-h-11 rounded-full">
              <a
                href={googleMapsDirectionsUrl(mapsLocation)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="mr-1.5 h-4 w-4" />
                Directions
              </a>
            </Button>
          </div>
          <a
            href={googleMapsPinUrl(mapsLocation)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex min-h-11 items-center justify-center gap-1.5 text-sm font-semibold text-evergreen"
          >
            <MapPinned className="h-4 w-4" />
            Open in Maps
          </a>
        </div>
      ) : null}

      <CasePeekSheet
        caseItem={peek?.kind === "case" ? peek.caseItem : null}
        onClose={() => {
          setPeek(null);
          setSelectedMarkerId(undefined);
        }}
      />

      <ConfirmDialog
        open={locationExplainOpen}
        title="Find the right shelter?"
        message="ResCutes uses your location once, then asks two quick questions about the animal so we can match a shelter that accepts them. You can deny access and still browse the map."
        confirmLabel="Use my location"
        cancelLabel="Not now"
        variant="primary"
        onConfirm={() => {
          setLocationExplainOpen(false);
          requestUserLocation();
        }}
        onClose={() => setLocationExplainOpen(false)}
      />
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
