"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TableToolbar } from "@/components/admin/ClickableTable";
import { Search } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { AppUser, RescueCaseRecord } from "@/lib/data/types";
import { resolveCurrentUrgency } from "@/lib/data/urgency";
import {
  CASE_STAGE_FILTER_OPTIONS,
  statusesForStage,
  statusToStage,
} from "@/lib/rescue-stages";

const URGENCY_LEVELS = ["critical", "high", "medium", "low"];

export function useRescueCasesFilters(cases: RescueCaseRecord[]) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [urgency, setUrgency] = useState(searchParams.get("urgency") ?? "");
  const [rescuer, setRescuer] = useState(searchParams.get("rescuer") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "date");
  const debouncedSearch = useDebouncedValue(search, 250);

  const filtered = useMemo(() => {
    let result = [...cases];

    if (status) {
      const stageStatuses = statusesForStage(status);
      if (stageStatuses.length > 0) {
        result = result.filter((c) => stageStatuses.includes(c.status));
      } else {
        result = result.filter(
          (c) => c.status === status || statusToStage(c.status) === status,
        );
      }
    }
    if (urgency) {
      result = result.filter((c) => {
        const u = resolveCurrentUrgency(c);
        return u.level === urgency;
      });
    }
    if (rescuer) {
      result = result.filter((c) => c.activeRescuerId === rescuer);
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.reporterName.toLowerCase().includes(q) ||
          c.species.toLowerCase().includes(q),
      );
    }

    if (sort === "urgency") {
      result.sort(
        (a, b) =>
          resolveCurrentUrgency(b).score - resolveCurrentUrgency(a).score,
      );
    } else if (sort === "waiting") {
      result.sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      );
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return result;
  }, [cases, status, urgency, rescuer, debouncedSearch, sort]);

  function clearFilters() {
    setSearch("");
    setStatus("");
    setUrgency("");
    setRescuer("");
    setSort("date");
  }

  return {
    filtered,
    search,
    setSearch,
    status,
    setStatus,
    urgency,
    setUrgency,
    rescuer,
    setRescuer,
    sort,
    setSort,
    clearFilters,
  };
}

export function RescueCasesFiltersBar({
  rescuers,
  search,
  setSearch,
  status,
  setStatus,
  urgency,
  setUrgency,
  rescuer,
  setRescuer,
  sort,
  setSort,
  onClear,
}: {
  rescuers: Pick<AppUser, "id" | "name">[];
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  urgency: string;
  setUrgency: (v: string) => void;
  rescuer: string;
  setRescuer: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <TableToolbar>
      <div className="relative w-full min-w-0 flex-1 sm:min-w-[14rem]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/40" />
        <Input
          placeholder="Search cases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 rounded-lg pl-9"
          aria-label="Search cases"
        />
      </div>
      <Select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-10 w-full min-w-0 rounded-lg sm:w-auto sm:min-w-[9rem]"
        aria-label="Filter by stage"
      >
        <option value="">All stages</option>
        {CASE_STAGE_FILTER_OPTIONS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </Select>
      <Select
        value={urgency}
        onChange={(e) => setUrgency(e.target.value)}
        className="h-10 w-full min-w-0 rounded-lg sm:w-auto sm:min-w-[8rem]"
        aria-label="Filter by urgency"
      >
        <option value="">All urgency</option>
        {URGENCY_LEVELS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </Select>
      <Select
        value={rescuer}
        onChange={(e) => setRescuer(e.target.value)}
        className="h-10 w-full min-w-0 rounded-lg sm:w-auto sm:min-w-[9rem]"
        aria-label="Filter by rescuer"
      >
        <option value="">All rescuers</option>
        {rescuers.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </Select>
      <Select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="h-10 w-full min-w-0 rounded-lg sm:w-auto sm:min-w-[8rem]"
        aria-label="Sort cases"
      >
        <option value="date">Newest</option>
        <option value="urgency">Urgency</option>
        <option value="waiting">Waiting</option>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 rounded-lg px-4"
        onClick={onClear}
      >
        Clear
      </Button>
    </TableToolbar>
  );
}
