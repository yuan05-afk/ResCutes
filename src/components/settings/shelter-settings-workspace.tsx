"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CapacityRing } from "@/components/ui/capacity-ring";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ShelterSettingsForm } from "@/app/(dashboard)/settings/shelter-form";
import { Building2, MapPin, Phone } from "lucide-react";

export interface ShelterSettingsItem {
  id: string;
  name: string;
  address: string;
  phone: string;
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

export function ShelterSettingsWorkspace({
  shelters,
  canEdit,
}: ShelterSettingsWorkspaceProps) {
  const [selectedId, setSelectedId] = useState(shelters[0]?.id ?? "");

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
      {/* Shelter picker */}
      <aside className="flex shrink-0 flex-col gap-2 lg:w-64">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
          Select shelter
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0">
          {shelters.map((shelter) => {
            const pct = Math.round(
              (shelter.currentOccupancy / Math.max(shelter.totalCapacity, 1)) *
                100,
            );
            const available = shelter.totalCapacity - shelter.currentOccupancy;
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
                      isActive ? "bg-evergreen text-white" : "bg-sage/20 text-evergreen",
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-graphite">
                      {shelter.name.replace(/ Animal Shelter| Rescue Centre| Animal Rescue/g, "")}
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
          })}
        </div>
      </aside>

      {/* Editor panel */}
      <div className="flex flex-col rounded-xl border border-sage/25 bg-white shadow-card lg:min-h-0 lg:min-w-0 lg:flex-1 lg:overflow-hidden">
        <div className="shrink-0 border-b border-sage/15 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-graphite">{selected.name}</h2>
              <div className="mt-1.5 space-y-1">
                <p className="flex items-center gap-1.5 text-xs text-graphite/55">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-2">{selected.address}</span>
                </p>
                <p className="flex items-center gap-1.5 text-xs text-graphite/55">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {selected.phone}
                </p>
              </div>
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
