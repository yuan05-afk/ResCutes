"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CapacityRing } from "@/components/ui/capacity-ring";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Input } from "@/components/ui/input";
import { ShelterSettingsForm } from "@/app/(dashboard)/settings/shelter-form";
import { ShelterContactBlock } from "@/components/shelters/shelter-contact-block";
import { Building2, Search } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export interface ShelterSettingsItem {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  directoryId?: string;
  city?: string;
  region?: string;
  notes?: string;
  totalCapacity: number;
  currentOccupancy: number;
  capabilities: string[];
  speciesAccepted: string[];
}

interface ShelterSettingsWorkspaceProps {
  shelters: ShelterSettingsItem[];
  canEdit: boolean;
}

function utilizationTone(pct: number) {
  if (pct > 95) return "text-rescue";
  if (pct > 85) return "text-ochre";
  return "text-evergreen";
}

function shortShelterName(name: string) {
  return name.replace(
    / Animal Shelter| Rescue Centre| Animal Rescue| & Rehabilitation Centre| Rehabilitation Centre/g,
    "",
  );
}

function shelterSearchHaystack(shelter: ShelterSettingsItem) {
  return [
    shelter.name,
    shelter.address,
    shelter.city,
    shelter.region,
    shelter.phone,
    shelter.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function ShelterSettingsWorkspace({
  shelters,
  canEdit,
}: ShelterSettingsWorkspaceProps) {
  const [selectedId, setSelectedId] = useState(shelters[0]?.id ?? "");
  const [search, setSearch] = useState("");
  // Debounce filters the already-loaded list only - no Neon round-trips.
  const debouncedSearch = useDebouncedValue(search, 200);

  const filteredShelters = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return shelters;
    return shelters.filter((shelter) =>
      shelterSearchHaystack(shelter).includes(q),
    );
  }, [shelters, debouncedSearch]);

  const selected =
    shelters.find((s) => s.id === selectedId) ?? shelters[0] ?? null;

  if (!selected) {
    return (
      <p className="py-12 text-center text-sm text-graphite/50">
        No shelters configured.
      </p>
    );
  }

  const selectedPct = Math.round(
    (selected.currentOccupancy / Math.max(selected.totalCapacity, 1)) * 100,
  );

  return (
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:flex-row lg:overflow-hidden">
      <aside className="flex shrink-0 flex-col gap-2 lg:w-64 lg:min-h-0">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
          Select shelter
        </p>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/40"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shelters..."
            aria-label="Search shelters"
            className="h-10 rounded-xl border-sage/30 bg-white pl-9 text-sm shadow-none focus-visible:border-evergreen/50 focus-visible:ring-1 focus-visible:ring-evergreen/30 focus-visible:ring-offset-0"
            autoComplete="off"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0">
          {filteredShelters.length === 0 ? (
            <p className="rounded-xl border border-dashed border-sage/30 bg-bone/60 px-3 py-4 text-center text-xs text-graphite/55">
              No shelters match &quot;{debouncedSearch.trim()}&quot;
            </p>
          ) : (
            filteredShelters.map((shelter) => {
              const pct = Math.round(
                (shelter.currentOccupancy /
                  Math.max(shelter.totalCapacity, 1)) *
                  100,
              );
              const available =
                shelter.totalCapacity - shelter.currentOccupancy;
              const isActive = shelter.id === selected.id;

              return (
                <button
                  key={shelter.id}
                  type="button"
                  onClick={() => setSelectedId(shelter.id)}
                  className={cn(
                    "min-w-[200px] shrink-0 rounded-xl border p-3 text-left transition-all lg:min-w-0",
                    isActive
                      ? "border-evergreen bg-evergreen/5 shadow-card ring-1 ring-evergreen/20"
                      : "border-sage/25 bg-white hover:border-evergreen/30",
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        isActive
                          ? "bg-evergreen text-white"
                          : "bg-sage/20 text-evergreen",
                      )}
                    >
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-graphite">
                        {shortShelterName(shelter.name)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-graphite/50">
                        {available} free · {pct}% full
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <ProgressBar
                      value={shelter.currentOccupancy}
                      max={shelter.totalCapacity}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div className="flex flex-col rounded-xl border border-sage/25 bg-white shadow-card lg:min-h-0 lg:min-w-0 lg:flex-1 lg:overflow-hidden">
        <div className="shrink-0 border-b border-sage/15 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-graphite">{selected.name}</h2>
              <ShelterContactBlock
                className="mt-2.5"
                compact
                shelter={{
                  name: selected.name,
                  address: selected.address,
                  city: selected.city,
                  region: selected.region,
                  latitude: selected.latitude,
                  longitude: selected.longitude,
                  phone: selected.phone,
                  email: selected.email,
                  website: selected.website,
                  directoryId: selected.directoryId,
                  notes: selected.notes,
                }}
              />
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-bone/80 px-4 py-2">
              <div className="relative flex items-center justify-center">
                <CapacityRing percentage={selectedPct} size={44} />
                <span
                  className={cn(
                    "absolute text-[10px] font-bold",
                    utilizationTone(selectedPct),
                  )}
                >
                  {selectedPct}%
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-graphite">
                  {selected.currentOccupancy} / {selected.totalCapacity}
                </p>
                <p className="text-[11px] text-graphite/50">occupied</p>
              </div>
            </div>
          </div>
        </div>

        <ShelterSettingsForm
          key={selected.id}
          shelter={selected}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
