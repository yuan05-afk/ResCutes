"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import { useActionPending } from "@/components/shared/useActionPending";
import { updateShelterSettingsAction } from "@/app/actions/case";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { showToast } from "@/components/ui/toast";
import { Check, Minus, Plus, Stethoscope, PawPrint } from "lucide-react";

const CAPABILITY_OPTIONS = [
  {
    id: "basic veterinary care",
    label: "Basic veterinary care",
    description: "Routine exams, vaccinations, and minor illness treatment",
  },
  {
    id: "orthopedic treatment",
    label: "Orthopedic treatment",
    description: "Bone fractures, joint injuries, and mobility support",
  },
  {
    id: "emergency surgery",
    label: "Emergency surgery",
    description: "Urgent surgical procedures for critical cases",
  },
  {
    id: "wound care",
    label: "Wound care",
    description: "Cleaning, dressing, and monitoring of injuries",
  },
  {
    id: "behavioral assessment",
    label: "Behavioral assessment",
    description: "Temperament evaluation and rehabilitation planning",
  },
  {
    id: "intensive care",
    label: "Intensive care",
    description: "24/7 monitoring for critically ill animals",
  },
] as const;

const SPECIES_LABELS: Record<string, string> = {
  dog: "Dogs",
  cat: "Cats",
  rabbit: "Rabbits",
  bird: "Birds",
};

interface ShelterSettingsFormProps {
  shelter: {
    id: string;
    name: string;
    totalCapacity: number;
    currentOccupancy: number;
    capabilities: string[];
    speciesAccepted: string[];
  };
  canEdit?: boolean;
}

export function ShelterSettingsForm({
  shelter,
  canEdit = true,
}: ShelterSettingsFormProps) {
  const { pending: loading, run } = useActionPending();
  const [totalCapacity, setTotalCapacity] = useState(shelter.totalCapacity);
  const [currentOccupancy, setCurrentOccupancy] = useState(
    shelter.currentOccupancy,
  );
  const [selectedCaps, setSelectedCaps] = useState<string[]>(shelter.capabilities);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const available = Math.max(0, totalCapacity - currentOccupancy);
  const utilization = Math.round(
    (currentOccupancy / Math.max(totalCapacity, 1)) * 100,
  );

  const isDirty =
    totalCapacity !== shelter.totalCapacity ||
    currentOccupancy !== shelter.currentOccupancy ||
    JSON.stringify([...selectedCaps].sort()) !==
      JSON.stringify([...shelter.capabilities].sort());

  function adjustCapacity(field: "total" | "occupancy", delta: number) {
    if (!canEdit) return;
    if (field === "total") {
      setTotalCapacity((v) => Math.max(0, v + delta));
    } else {
      setCurrentOccupancy((v) =>
        Math.min(Math.max(0, v + delta), totalCapacity),
      );
    }
    setSaved(false);
  }

  function toggleCap(cap: string) {
    if (!canEdit) return;
    setSelectedCaps((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap],
    );
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || !isDirty) return;
    setConfirmOpen(true);
  }

  async function persistSettings() {
    await run(
      () =>
        updateShelterSettingsAction(shelter.id, {
          totalCapacity,
          currentOccupancy,
          capabilities: selectedCaps,
        }),
      { rewarm: ["/settings", "/dashboard"] },
    );
    setSaved(true);
    showToast({
      title: "Shelter settings saved",
      description: `${shelter.name} capacity and capabilities updated.`,
      variant: "success",
    });
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col lg:min-h-0 lg:flex-1 lg:overflow-hidden"
    >
      <div className="rc-scroll space-y-5 px-5 py-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
      {!canEdit && (
        <div className="rounded-xl border border-ochre/30 bg-ochre/10 px-4 py-3 text-sm text-graphite/80">
          You have view-only access. Contact an administrator to change shelter
          settings.
        </div>
      )}

      {/* Capacity */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-graphite">Capacity</h3>
          <p className="mt-0.5 text-xs text-graphite/50">
            Set how many animals this shelter can hold and current occupancy.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CapacityStepper
            label="Total beds"
            hint="Maximum animals the shelter can house"
            value={totalCapacity}
            onDecrement={() => adjustCapacity("total", -1)}
            onIncrement={() => adjustCapacity("total", 1)}
            onChange={(v) => {
              setTotalCapacity(v);
              setSaved(false);
            }}
            disabled={!canEdit}
          />
          <CapacityStepper
            label="Currently occupied"
            hint="Animals currently in the shelter"
            value={currentOccupancy}
            max={totalCapacity}
            onDecrement={() => adjustCapacity("occupancy", -1)}
            onIncrement={() => adjustCapacity("occupancy", 1)}
            onChange={(v) => {
              setCurrentOccupancy(Math.min(v, totalCapacity));
              setSaved(false);
            }}
            disabled={!canEdit}
          />
        </div>

        <div className="rounded-xl bg-bone/60 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-graphite/60">
              <span className="font-semibold text-evergreen">{available}</span>{" "}
              spaces available
            </span>
            <span
              className={cn(
                "font-semibold",
                utilization > 95
                  ? "text-rescue"
                  : utilization > 85
                    ? "text-ochre"
                    : "text-graphite",
              )}
            >
              {utilization}% utilized
            </span>
          </div>
          <ProgressBar
            value={currentOccupancy}
            max={totalCapacity}
            className="mt-2"
          />
        </div>
      </section>

      {/* Species */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <PawPrint className="h-4 w-4 text-evergreen" />
          <div>
            <h3 className="text-sm font-semibold text-graphite">
              Species accepted
            </h3>
            <p className="text-xs text-graphite/50">
              Animals this shelter is licensed to receive
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {shelter.speciesAccepted.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full border border-evergreen/20 bg-evergreen/8 px-3 py-1.5 text-sm font-medium text-evergreen capitalize"
            >
              <PawPrint className="h-3.5 w-3.5" />
              {SPECIES_LABELS[s] ?? s}
            </span>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-evergreen" />
          <div>
            <h3 className="text-sm font-semibold text-graphite">
              Medical capabilities
            </h3>
            <p className="text-xs text-graphite/50">
              Toggle services available at this location. Used for routing
              recommendations.
            </p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {CAPABILITY_OPTIONS.map((cap) => {
            const active = selectedCaps.includes(cap.id);
            return (
              <button
                key={cap.id}
                type="button"
                disabled={!canEdit}
                onClick={() => toggleCap(cap.id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-evergreen bg-evergreen/5 ring-1 ring-evergreen/15"
                    : "border-sage/25 bg-white hover:border-evergreen/25",
                  !canEdit && "cursor-not-allowed opacity-70",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                    active
                      ? "border-evergreen bg-evergreen text-white"
                      : "border-sage/40 bg-white",
                  )}
                >
                  {active && <Check className="h-3 w-3" strokeWidth={3} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-graphite">{cap.label}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-graphite/50">
                    {cap.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-graphite/45">
          {selectedCaps.length} of {CAPABILITY_OPTIONS.length} capabilities
          enabled
        </p>
      </section>
      </div>

      {canEdit && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-sage/20 bg-bone/50 px-5 py-3">
          <p className="text-xs text-graphite/50">
            {isDirty ? "Unsaved changes" : saved ? "Settings saved" : "All changes saved"}
          </p>
          <Button
            type="submit"
            disabled={loading || !isDirty}
            className="rounded-full px-6"
          >
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Save shelter settings?"
        message={`Update capacity and capabilities for ${shelter.name}. This affects routing recommendations immediately.`}
        confirmLabel="Save changes"
        cancelLabel="Cancel"
        variant="primary"
        pending={loading}
        onClose={() => setConfirmOpen(false)}
        onConfirm={persistSettings}
      />
    </form>
  );
}

function CapacityStepper({
  label,
  hint,
  value,
  max,
  onDecrement,
  onIncrement,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  value: number;
  max?: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-xl border border-sage/25 bg-bone/30 p-4">
      <Label className="text-sm font-semibold text-graphite">{label}</Label>
      <p className="mt-0.5 text-[11px] text-graphite/50">{hint}</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || value <= 0}
          onClick={onDecrement}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-sage/30 bg-white text-graphite transition hover:bg-bone disabled:opacity-40"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <Input
          type="number"
          min={0}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="h-9 rounded-lg text-center text-lg font-bold"
        />
        <button
          type="button"
          disabled={disabled || (max !== undefined && value >= max)}
          onClick={onIncrement}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-sage/30 bg-white text-graphite transition hover:bg-bone disabled:opacity-40"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
