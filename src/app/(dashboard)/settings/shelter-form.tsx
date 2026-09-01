"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import { updateShelterSettingsAction } from "@/app/actions/case";

const ALL_CAPABILITIES = [
  "basic veterinary care",
  "orthopedic treatment",
  "emergency surgery",
  "wound care",
  "behavioral assessment",
  "intensive care",
];

interface ShelterSettingsFormProps {
  shelter: {
    id: string;
    name: string;
    totalCapacity: number;
    currentOccupancy: number;
    capabilities: string[];
    speciesAccepted: string[];
  };
}

export function ShelterSettingsForm({ shelter }: ShelterSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [totalCapacity, setTotalCapacity] = useState(shelter.totalCapacity);
  const [currentOccupancy, setCurrentOccupancy] = useState(
    shelter.currentOccupancy,
  );
  const [selectedCaps, setSelectedCaps] = useState<string[]>(shelter.capabilities);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await updateShelterSettingsAction(shelter.id, {
      totalCapacity,
      currentOccupancy,
      capabilities: selectedCaps,
    });
    router.refresh();
    setLoading(false);
  }

  const available = totalCapacity - currentOccupancy;
  const utilization = Math.round((currentOccupancy / totalCapacity) * 100);

  function toggleCap(cap: string) {
    setSelectedCaps((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap],
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-graphite/55">
            Total Capacity
          </Label>
          <Input
            type="number"
            min={0}
            value={totalCapacity}
            onChange={(e) => setTotalCapacity(parseInt(e.target.value))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-graphite/55">
            Current Occupancy
          </Label>
          <Input
            type="number"
            min={0}
            max={totalCapacity}
            value={currentOccupancy}
            onChange={(e) => setCurrentOccupancy(parseInt(e.target.value))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-graphite/55">
            Available
          </Label>
          <p className="flex h-10 items-center text-lg font-bold text-evergreen">
            {available} spaces
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-graphite/60">Capacity utilization</span>
          <span className="font-semibold text-graphite">{utilization}%</span>
        </div>
        <ProgressBar value={currentOccupancy} max={totalCapacity} />
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wide text-graphite/55">
          Species Accepted
        </Label>
        <div className="flex flex-wrap gap-2">
          {shelter.speciesAccepted.map((s) => (
            <span
              key={s}
              className="rounded-full bg-evergreen/10 px-3 py-1.5 text-sm font-medium text-evergreen capitalize"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wide text-graphite/55">
          Medical Capabilities
        </Label>
        <div className="flex flex-wrap gap-2">
          {ALL_CAPABILITIES.map((cap) => (
            <button
              key={cap}
              type="button"
              onClick={() => toggleCap(cap)}
              className={cn(
                "rounded-full border px-3 py-2 text-sm font-medium transition-colors capitalize",
                selectedCaps.includes(cap)
                  ? "border-evergreen bg-evergreen text-white"
                  : "border-sage/40 bg-white text-graphite/70 hover:border-evergreen/40",
              )}
            >
              {cap}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="rounded-full">
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
