"use client";

import { useMemo, useState } from "react";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import { MapView } from "@/components/map/map-view-dynamic";
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
import { cn, formatStatus } from "@/lib/utils";

const SPECIES_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All animal types" },
  ...(
    Object.entries(SHELTER_SPECIES_PROFILE_LABELS) as [ShelterSpeciesProfile, string][]
  ).map(([value, label]) => ({ value, label })),
];

function sourceLabel(source: PhilippinesShelterRecord["source"]) {
  if (source === "demo_partner") return "ResCutes partner";
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

  const filtered = useMemo(() => {
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

  const selected =
    filtered.find((shelter) => shelter.id === selectedId) ??
    filtered[0] ??
    null;

  const markers = filtered.map((shelter) => ({
    id: shelter.id,
    latitude: shelter.latitude,
    longitude: shelter.longitude,
    label: shelter.name,
    species: formatShelterSpeciesLabel(shelter),
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
                {filtered.length} location{filtered.length === 1 ? "" : "s"} shown
              </p>
            </div>
            <p className="hidden text-[10px] text-graphite/45 sm:block">
              Data: verified org listings + OpenStreetMap (ODbL)
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
              onMarkerClick={setSelectedId}
              selectedMarkerId={selected?.id}
            />
          </div>
        </section>

        <section className="flex min-h-[280px] flex-col overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card lg:col-span-4 lg:min-h-0">
          <div className="shrink-0 border-b border-sage/15 px-4 py-2.5">
            <h2 className="text-sm font-semibold text-graphite">Directory</h2>
            <p className="text-xs text-graphite/50">
              Tap a pin or list item for details
            </p>
          </div>

          {selected ? (
            <div className="shrink-0 border-b border-sage/15 bg-bone/35 px-4 py-3">
              <ShelterDetailCard shelter={selected} />
            </div>
          ) : null}

          <div className="rc-scroll min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-graphite/55">
                No shelters match your filters.
              </p>
            ) : (
              filtered.map((shelter) => (
                <button
                  key={shelter.id}
                  type="button"
                  onClick={() => setSelectedId(shelter.id)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left transition",
                    selected?.id === shelter.id
                      ? "border-evergreen/35 bg-evergreen/5"
                      : "border-sage/20 bg-white hover:border-sage/35 hover:bg-bone/50",
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
                      <p className="text-sm font-semibold text-graphite line-clamp-2">
                        {shelter.name}
                      </p>
                      <p className="mt-0.5 text-xs text-graphite/55">
                        {shelter.city} · {shelter.region}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-evergreen">
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

function ShelterDetailCard({ shelter }: { shelter: PhilippinesShelterRecord }) {
  const capacityPct =
    shelter.totalCapacity && shelter.totalCapacity > 0
      ? Math.round((shelter.currentOccupancy ?? 0) / shelter.totalCapacity * 100)
      : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-graphite/55">
          {sourceLabel(shelter.source)}
        </span>
        {shelter.isDemoPartner ? (
          <span className="rounded-full bg-evergreen/10 px-2 py-0.5 text-[10px] font-semibold text-evergreen">
            Live in ResCutes routing
          </span>
        ) : null}
      </div>
      <h3 className="text-base font-bold text-graphite">{shelter.name}</h3>
      <p className="flex items-start gap-1.5 text-xs text-graphite/65">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{shelter.address}</span>
      </p>
      <p className="text-xs text-graphite/55">
        {shelter.city}, {shelter.region}
      </p>
      <p className="text-sm font-semibold text-evergreen">
        Accepts: {formatShelterSpeciesLabel(shelter)}
      </p>
      {capacityPct != null ? (
        <p className="text-xs text-graphite/55">
          Capacity: {shelter.currentOccupancy}/{shelter.totalCapacity} ({capacityPct}% occupied)
        </p>
      ) : null}
      {shelter.operator ? (
        <p className="text-xs text-graphite/55">Operator: {shelter.operator}</p>
      ) : null}
      {shelter.notes ? (
        <p className="text-xs leading-relaxed text-graphite/60">{shelter.notes}</p>
      ) : null}
      <div className="flex flex-wrap gap-3 pt-1 text-xs">
        {shelter.phone ? (
          <span className="inline-flex items-center gap-1 text-graphite/70">
            <Phone className="h-3.5 w-3.5" aria-hidden />
            {shelter.phone}
          </span>
        ) : null}
        {shelter.website ? (
          <a
            href={shelter.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-evergreen hover:underline"
          >
            Website
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        ) : null}
        {shelter.sourceUrl ? (
          <a
            href={shelter.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-graphite/55 hover:text-graphite"
          >
            Source ({formatStatus(shelter.source)})
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        ) : null}
      </div>
    </div>
  );
}
