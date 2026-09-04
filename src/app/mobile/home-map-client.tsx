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
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { sortByDistanceKm } from "@/lib/maps/geo-distance";
import {
  googleMapsDirectionsUrl,
  googleMapsPinUrl,
  telHref,
  type ShelterMapsLocation,
} from "@/lib/maps/shelter-links";
import { cn } from "@/lib/utils";

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
  | { kind: "shelter"; shelter: HomeMapShelter; distanceKm?: number }
  | { kind: "case"; caseItem: CasePeekData };

export function HomeMapClient({
  shelters,
  cases,
  showCasesLayer,
}: HomeMapClientProps) {
  const [showShelters, setShowShelters] = useState(true);
  const [showCases, setShowCases] = useState(showCasesLayer);
  const [peek, setPeek] = useState<Peek | null>(null);
  const [locationExplainOpen, setLocationExplainOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cameraCenter, setCameraCenter] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: DEMO_GEO.center.latitude,
    longitude: DEMO_GEO.center.longitude,
  });
  const [cameraRequestId, setCameraRequestId] = useState(0);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | undefined>();

  const legendItems: MapLegendItem[] = useMemo(() => {
    const items: MapLegendItem[] = [];
    if (showShelters) {
      items.push({
        id: "shelters",
        label: "Shelters",
        description: "Rescue shelters and partners",
        color: SHELTER_PIN_COLOR,
      });
    }
    if (showCasesLayer && showCases) {
      items.push(
        {
          id: "critical",
          label: "Critical",
          description: "Immediate rescue response",
          color: MAP_MARKER_COLORS.critical,
        },
        {
          id: "high",
          label: "High",
          description: "Urgent attention needed",
          color: MAP_MARKER_COLORS.high,
        },
        {
          id: "standard",
          label: "Cases",
          description: "Active field cases",
          color: MAP_MARKER_COLORS.standard,
        },
      );
    }
    return items;
  }, [showShelters, showCases, showCasesLayer]);

  const markers = useMemo(() => {
    const list = [];
    if (showShelters) {
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
    }
    if (showCasesLayer && showCases) {
      for (const c of cases) {
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
            c.urgencyLevel === "critical"
              ? "critical"
              : c.urgencyLevel === "high"
                ? "high"
                : "standard",
        });
      }
    }
    return list;
  }, [shelters, cases, showShelters, showCases, showCasesLayer]);

  function openShelter(shelter: HomeMapShelter, distanceKm?: number) {
    setPeek({ kind: "shelter", shelter, distanceKm });
    setSelectedMarkerId(`shelter:${shelter.id}`);
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

  function requestNearestShelter() {
    setLocationError(null);
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
        const ranked = sortByDistanceKm(shelters, {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocating(false);
        const nearest = ranked[0];
        if (!nearest) {
          setLocationError("No shelters are available on the map yet.");
          return;
        }
        setShowShelters(true);
        openShelter(nearest, nearest.distanceKm);
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
              Shelters{showCasesLayer ? " and open cases" : ""} nearby
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

        {showCasesLayer ? (
          <div className="mt-1.5 flex flex-wrap gap-2">
            <LayerChip
              active={showShelters}
              onClick={() => setShowShelters((v) => !v)}
              label="Shelters"
            />
            <LayerChip
              active={showCases}
              onClick={() => setShowCases((v) => !v)}
              label="Cases"
            />
          </div>
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
          zoom={11}
          compactLegend
          legend="none"
          legendItems={legendItems}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          selectedMarkerId={selectedMarkerId}
          flyToSelectedMarker
          cameraRequestId={cameraRequestId}
          selectedMarkerZoom={14}
          fitVisibleMarkers={false}
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
        title="Find the nearest shelter?"
        message="ResCutes uses your location once to sort shelters by distance and open directions. You can deny access and still browse the map."
        confirmLabel="Use my location"
        cancelLabel="Not now"
        variant="primary"
        onConfirm={() => {
          setLocationExplainOpen(false);
          requestNearestShelter();
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
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-9 rounded-full border px-3 text-xs font-semibold",
        active
          ? "border-evergreen bg-evergreen/10 text-evergreen"
          : "border-sage/30 bg-white text-graphite/55",
      )}
    >
      {label}
    </button>
  );
}
