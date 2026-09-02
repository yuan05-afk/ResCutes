"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { DemoUser } from "@/lib/data/demo-store";

const STATUSES = [
  "report_submitted",
  "under_verification",
  "verified",
  "rescuer_assigned",
  "rescue_accepted",
  "rescue_in_progress",
  "animal_secured",
  "awaiting_shelter",
  "shelter_handoff",
  "completed",
  "rejected",
  "duplicate",
];

const URGENCY_LEVELS = ["critical", "high", "medium", "low"];

export function RescueCasesFilters({
  rescuers,
}: {
  rescuers: Pick<DemoUser, "id" | "name">[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get("search") ?? "";
    if (debouncedSearch === current) return;
    if (debouncedSearch) params.set("search", debouncedSearch);
    else params.delete("search");
    router.replace(`/rescue-cases?${params.toString()}`);
  }, [debouncedSearch, router, searchParams]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/rescue-cases?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search cases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="w-[160px]"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
        ))}
      </Select>
      <Select
        defaultValue={searchParams.get("urgency") ?? ""}
        onChange={(e) => updateFilter("urgency", e.target.value)}
        className="w-[140px]"
      >
        <option value="">All urgency</option>
        {URGENCY_LEVELS.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </Select>
      <Select
        defaultValue={searchParams.get("rescuer") ?? ""}
        onChange={(e) => updateFilter("rescuer", e.target.value)}
        className="w-[160px]"
      >
        <option value="">All rescuers</option>
        {rescuers.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </Select>
      <Select
        defaultValue={searchParams.get("sort") ?? "date"}
        onChange={(e) => updateFilter("sort", e.target.value)}
        className="w-[140px]"
      >
        <option value="date">Newest</option>
        <option value="urgency">Urgency</option>
        <option value="waiting">Waiting</option>
      </Select>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setSearch("");
          router.push("/rescue-cases");
        }}
      >
        Clear
      </Button>
    </div>
  );
}
