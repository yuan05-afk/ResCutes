"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/status/status-badge";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { CaseDetailModal } from "@/components/admin/CaseDetailModal";
import {
  ClickableRow,
  PaginationBar,
} from "@/components/admin/ClickableTable";
import { useClientPagination } from "@/components/admin/use-client-pagination";
import {
  RescueCasesFiltersBar,
  useRescueCasesFilters,
} from "@/components/admin/rescue-cases-filters";
import type { DemoCase, DemoUser } from "@/lib/data/demo-store";
import { resolveCurrentUrgency } from "@/lib/data/service";

const ROWS_PER_PAGE = 7;

interface RescueCasesTableProps {
  cases: DemoCase[];
  rescuers: Pick<DemoUser, "id" | "name">[];
}

export function RescueCasesTable({ cases, rescuers }: RescueCasesTableProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const filters = useRescueCasesFilters(cases);
  const pager = useClientPagination(filters.filtered, ROWS_PER_PAGE);

  useEffect(() => {
    pager.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.urgency, filters.rescuer, filters.sort]);

  return (
    <>
      <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
        <div className="shrink-0">
          <RescueCasesFiltersBar
            rescuers={rescuers}
            search={filters.search}
            setSearch={filters.setSearch}
            status={filters.status}
            setStatus={filters.setStatus}
            urgency={filters.urgency}
            setUrgency={filters.setUrgency}
            rescuer={filters.rescuer}
            setRescuer={filters.setRescuer}
            sort={filters.sort}
            setSort={filters.setSort}
            onClear={filters.clearFilters}
          />
        </div>

        <div className="flex flex-col rounded-xl border border-sage/25 bg-white shadow-card lg:min-h-0 lg:flex-1 lg:overflow-hidden">
          <p className="shrink-0 border-b border-sage/15 px-4 py-2 text-xs text-graphite/50">
            {filters.filtered.length} case{filters.filtered.length !== 1 ? "s" : ""} · click a row for details
          </p>
          <div className="rc-scroll overflow-x-auto lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="sticky top-0 z-10 bg-bone/95 backdrop-blur-sm">
                <tr className="border-b border-sage/20 text-left text-[10px] font-semibold uppercase tracking-wide text-graphite/50">
                  <th className="px-4 py-2.5">Case</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Urgency</th>
                  <th className="px-4 py-2.5">Species</th>
                  <th className="px-4 py-2.5">Reporter</th>
                  <th className="px-4 py-2.5">Description</th>
                </tr>
              </thead>
              <tbody>
                {pager.pageItems.map((c) => {
                  const urgency = resolveCurrentUrgency(c);
                  return (
                    <ClickableRow key={c.id} onOpen={() => setOpenId(c.id)}>
                      <td className="px-4 py-2.5 font-semibold text-evergreen">
                        {c.caseNumber}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-2.5">
                        {urgency.score > 0 ? (
                          <UrgencyBadge
                            level={urgency.level}
                            score={urgency.score}
                          />
                        ) : (
                          <span className="text-graphite/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 capitalize text-graphite/80">
                        {c.species}
                      </td>
                      <td className="px-4 py-2.5 text-graphite/80">
                        {c.reporterName}
                      </td>
                      <td className="max-w-xs truncate px-4 py-2.5 text-graphite/55">
                        {c.description}
                      </td>
                    </ClickableRow>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginationBar
            from={pager.from}
            to={pager.to}
            total={pager.total}
            page={pager.page}
            totalPages={pager.totalPages}
            onPrev={pager.prev}
            onNext={pager.next}
          />
        </div>
      </div>

      <CaseDetailModal caseId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
