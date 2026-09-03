"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import { MapView } from "@/components/map/map-view-dynamic";
import { MAP_SHELTER_FOCUS_ZOOM } from "@/components/map/map-camera";
import {
  SHELTER_MAP_LEGEND,
  shelterMarkerColor,
} from "@/components/map/shelter-map-constants";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  formatShelterSpeciesLabel,
  PHILIPPINES_MAP_CENTER,
  PHILIPPINES_MAP_ZOOM,
  PHILIPPINES_REGIONS,
  SHELTER_SPECIES_PROFILE_LABELS,
  type PhilippinesShelterRecord,
  type ShelterSpeciesProfile,
} from "@/lib/data/philippines-shelters-directory";
import { cn } from "@/lib/utils";

const SPECIES_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All animal types" },
  ...(
    Object.entries(SHELTER_SPECIES_PROFILE_LABELS) as [ShelterSpeciesProfile, string][]
  ).map(([value, label]) => ({ value, label })),
];

function sourceLabel(source: PhilippinesShelterRecord["source"]) {
  if (source === "verified") return "Verified listing";
  return "OpenStreetMap";
}

export function SheltersMapWorkspace({
  shelters,
}: {
  shelters: PhilippinesShelterRecord[];
}) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All regions");
  const [speciesProfile, setSpeciesProfile] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hiddenLegendLayers, setHiddenLegendLayers] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const filteredByControls = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shelters.filter((shelter) => {
      if (region !== "All regions" && shelter.region !== region) return false;
      if (speciesProfile && shelter.speciesProfile !== speciesProfile) return false;
      if (!q) return true;
      return (
        shelter.name.toLowerCase().includes(q) ||
        shelter.city.toLowerCase().includes(q) ||
        shelter.address.toLowerCase().includes(q) ||
        shelter.region.toLowerCase().includes(q)
      );
    });
  }, [shelters, search, region, speciesProfile]);

  const hiddenLegendSet = useMemo(
    () => new Set(hiddenLegendLayers),
    [hiddenLegendLayers],
  );

  const visibleShelters = useMemo(
    () =>
      filteredByControls.filter(
        (shelter) => !hiddenLegendSet.has(shelter.speciesProfile),
      ),
    [filteredByControls, hiddenLegendSet],
  );

  const hiddenByLegendCount = filteredByControls.length - visibleShelters.length;

  const selected = selectedId
    ? visibleShelters.find((shelter) => shelter.id === selectedId) ?? null
    : null;

  useEffect(() => {
    if (selectedId && !visibleShelters.some((shelter) => shelter.id === selectedId)) {
      setSelectedId(null);
    }
  }, [visibleShelters, selectedId]);

  const selectShelter = useCallback((id: string) => {
    setSelectedId(id);
    requestAnimationFrame(() => {
      const button = itemRefs.current.get(id);
      const list = listRef.current;
      if (!button || !list) return;

      const listRect = list.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const isAbove = buttonRect.top < listRect.top;
      const isBelow = buttonRect.bottom > listRect.bottom;

      if (isAbove || isBelow) {
        button.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  }, []);

  // Hover popup stays light — full details live in the floating card.
  const markers = filteredByControls.map((shelter) => ({
    id: shelter.id,
    latitude: shelter.latitude,
    longitude: shelter.longitude,
    label: shelter.name,
    species: formatShelterSpeciesLabel(shelter),
    region: shelter.region,
    color: shelterMarkerColor(shelter.speciesProfile),
    legendLayerId: shelter.speciesProfile,
  }));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 lg:overflow-hidden">
      <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search shelter, city, or region..."
          className="h-9 xl:col-span-2"
        />
        <Select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="h-9"
        >
          {PHILIPPINES_REGIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select
          value={speciesProfile}
          onChange={(e) => setSpeciesProfile(e.target.value)}
          className="h-9"
        >
          {SPECIES_FILTER_OPTIONS.map((item) => (
            <option key={item.value || "all"} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12 lg:grid-rows-1">
        <section className="flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card lg:col-span-8 lg:min-h-0">
          <div className="flex shrink-0 items-center justify-between border-b border-sage/15 px-4 py-2.5">
            <div>
              <h2 className="text-sm font-semibold text-graphite">Shelter map</h2>
              <p className="text-xs text-graphite/50">
                {visibleShelters.length} location
                {visibleShelters.length === 1 ? "" : "s"} shown
                {hiddenByLegendCount > 0
                  ? ` · ${hiddenByLegendCount} hidden by legend`
                  : ""}
              </p>
            </div>
            <p className="hidden text-[10px] text-graphite/45 sm:block">
              Click a pin for details
            </p>
          </div>
          <div className="relative min-h-0 flex-1 p-2">
            <MapView
              className="h-full min-h-[280px]"
              center={PHILIPPINES_MAP_CENTER}
              zoom={PHILIPPINES_MAP_ZOOM}
              markers={markers}
              legend="none"
              legendItems={SHELTER_MAP_LEGEND}
              interactiveLegend
              hiddenLegendLayers={hiddenLegendLayers}
              onHiddenLegendLayersChange={setHiddenLegendLayers}
              onMarkerClick={selectShelter}
              selectedMarkerId={selectedId ?? undefined}
              flyToSelectedMarker
              pinSelectedPopup={false}
              selectedMarkerZoom={MAP_SHELTER_FOCUS_ZOOM}
            />
            {selected ? (
              <div className="pointer-events-auto absolute bottom-4 left-4 right-4 z-20 sm:left-auto sm:right-4 sm:w-[min(100%,22rem)]">
                <div className="rounded-xl border border-sage/30 bg-white/95 p-3.5 shadow-elevated backdrop-blur-md">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
                          {sourceLabel(selected.source)}
                        </p>
                        {selected.isDemoPartner ? (
                          <span className="rounded-full bg-evergreen/10 px-1.5 py-0.5 text-[10px] font-semibold text-evergreen">
                            Routing partner
                          </span>
                        ) : null}
                      </div>
                      <h3 className="text-sm font-bold text-graphite line-clamp-2">
                        {selected.name}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-graphite/50">
                        {selected.city} · {selected.region}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-graphite/50 hover:bg-bone hover:text-graphite"
                      aria-label="Close shelter details"
                    >
                      Close
                    </button>
                  </div>
                  <p className="flex items-start gap-1.5 text-xs text-graphite/65">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{selected.address}</span>
                  </p>
                  <p className="mt-1.5 text-xs font-semibold text-evergreen">
                    Accepts: {formatShelterSpeciesLabel(selected)}
                  </p>
                  {selected.totalCapacity && selected.totalCapacity > 0 ? (
                    <p className="mt-1 text-xs text-graphite/55">
                      Capacity: {selected.currentOccupancy ?? 0}/
                      {selected.totalCapacity}
                    </p>
                  ) : null}
                  {selected.notes ? (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-graphite/60">
                      {selected.notes}
                    </p>
                  ) : null}
                  {selected.phone ? (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-graphite/70">
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      {selected.phone}
                    </p>
                  ) : null}
                  {selected.website ? (
                    <a
                      href={selected.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-evergreen hover:underline"
                    >
                      Website
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="flex min-h-[280px] flex-col overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card lg:col-span-4 lg:min-h-0">
          <div className="shrink-0 border-b border-sage/15 px-4 py-2.5">
            <h2 className="text-sm font-semibold text-graphite">Directory</h2>
            <p className="text-xs text-graphite/50">
              {visibleShelters.length} shelters · details open on the map
            </p>
          </div>

          <div
            ref={listRef}
            className="rc-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2"
          >
            {visibleShelters.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-graphite/55">
                {filteredByControls.length === 0
                  ? "No shelters match your filters."
                  : "No shelters visible. Show more categories in the map legend."}
              </p>
            ) : (
              visibleShelters.map((shelter) => (
                <button
                  key={shelter.id}
                  ref={(node) => {
                    if (node) {
                      itemRefs.current.set(shelter.id, node);
                    } else {
                      itemRefs.current.delete(shelter.id);
                    }
                  }}
                  type="button"
                  onClick={() => selectShelter(shelter.id)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                    selectedId === shelter.id
                      ? "border-evergreen/40 bg-evergreen/5 shadow-sm"
                      : "border-transparent bg-transparent hover:border-sage/25 hover:bg-bone/50",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border border-white shadow-sm"
                      style={{
                        backgroundColor: shelterMarkerColor(shelter.speciesProfile),
                      }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-graphite line-clamp-1">
                        {shelter.name}
                      </p>
                      <p className="mt-0.5 text-xs text-graphite/55">
                        {shelter.city} · {shelter.region}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-evergreen">
                        {formatShelterSpeciesLabel(shelter)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
