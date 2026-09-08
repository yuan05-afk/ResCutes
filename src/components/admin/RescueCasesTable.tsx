"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/status/status-badge";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { AnimalImage } from "@/components/ui/animal-image";
import { CaseDetailModal } from "@/components/admin/CaseDetailModal";
import {
  ClickableRow,
  PaginationBar,
  stopRowClick,
  TableBodyPane,
  TableCard,
  TableColGroup,
  TableHeaderPane,
  TableMetaLine,
  tableTdClass,
  tableThClass,
  useSyncedTableScroll,
} from "@/components/admin/ClickableTable";
import { useClientPagination } from "@/components/admin/use-client-pagination";
import {
  RescueCasesFiltersBar,
  useRescueCasesFilters,
} from "@/components/admin/rescue-cases-filters";
import type { AppUser, RescueCaseRecord } from "@/lib/data/types";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { resolveCurrentUrgency } from "@/lib/data/urgency";

const ROWS_PER_PAGE = 7;
const TABLE_MIN_WIDTH = 880;
const COLUMN_WIDTHS = ["18%", "14%", "12%", "10%", "14%", "32%"];

interface RescueCasesTableProps {
  cases: RescueCaseRecord[];
  rescuers: Pick<AppUser, "id" | "name">[];
}

export function RescueCasesTable({ cases, rescuers }: RescueCasesTableProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const filters = useRescueCasesFilters(cases);
  const pager = useClientPagination(filters.filtered, ROWS_PER_PAGE);
  const { bodyRef, headerRef, onBodyScroll } = useSyncedTableScroll();
  const colGroup = <TableColGroup widths={COLUMN_WIDTHS} />;

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

        <TableCard>
          <TableMetaLine>
            {filters.filtered.length} case
            {filters.filtered.length !== 1 ? "s" : ""} · click a row for
            details
          </TableMetaLine>

          {/* Mobile card stack */}
          <div className="space-y-2 p-2 md:hidden">
            {pager.pageItems.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-graphite/50">
                No cases match your search or filters.
              </p>
            ) : (
              pager.pageItems.map((c) => {
                const urgency = resolveCurrentUrgency(c);
                const img = getCasePhotoUrl(c.species, c.photoUrl, c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setOpenId(c.id)}
                    className="flex w-full gap-3 rounded-xl border border-sage/20 bg-white p-3 text-left shadow-sm transition hover:border-sage/40 active:bg-bone/50"
                  >
                    <AnimalImage
                      src={img}
                      species={c.species}
                      alt={c.caseNumber}
                      containerClassName="h-14 w-14 shrink-0 rounded-lg"
                      sizes="56px"
                      objectPosition="center top"
                      expandable={false}
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-evergreen">
                          {c.caseNumber}
                        </p>
                        {urgency.score > 0 ? (
                          <UrgencyBadge
                            level={urgency.level}
                            score={urgency.score}
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={c.status} />
                        <span className="text-[11px] capitalize text-graphite/50">
                          {c.species}
                        </span>
                      </div>
                      <p className="truncate text-xs text-graphite/55">
                        {c.reporterName}
                      </p>
                      <p className="line-clamp-2 text-xs text-graphite/60">
                        {c.description}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="hidden md:block">
          <TableHeaderPane
            headerRef={headerRef}
            minWidth={TABLE_MIN_WIDTH}
            colGroup={colGroup}
          >
            <tr className="bg-white">
              <th className={tableThClass}>Case</th>
              <th className={tableThClass}>Status</th>
              <th className={tableThClass}>Urgency</th>
              <th className={tableThClass}>Species</th>
              <th className={tableThClass}>Reporter</th>
              <th className={tableThClass}>Description</th>
            </tr>
          </TableHeaderPane>

          <TableBodyPane
            bodyRef={bodyRef}
            onBodyScroll={onBodyScroll}
            minWidth={TABLE_MIN_WIDTH}
            colGroup={colGroup}
            isEmpty={pager.pageItems.length === 0}
            emptyMessage="No cases match your search or filters."
          >
            {pager.pageItems.map((c) => {
              const urgency = resolveCurrentUrgency(c);
              const img = getCasePhotoUrl(c.species, c.photoUrl, c.id);
              return (
                <ClickableRow key={c.id} onOpen={() => setOpenId(c.id)}>
                  <td
                    className={tableTdClass}
                    onClick={stopRowClick}
                    onKeyDown={stopRowClick}
                  >
                    <div className="flex items-center gap-2.5">
                      <AnimalImage
                        src={img}
                        species={c.species}
                        alt={c.caseNumber}
                        containerClassName="h-9 w-9 shrink-0 rounded-lg"
                        sizes="36px"
                        objectPosition="center top"
                        expandable
                        lightboxCaption={c.caseNumber}
                        showExpandHint={false}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-evergreen">
                          {c.caseNumber}
                        </p>
                        <p className="truncate text-[11px] capitalize text-graphite/45">
                          {c.species}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={tableTdClass}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className={tableTdClass}>
                    {urgency.score > 0 ? (
                      <UrgencyBadge
                        level={urgency.level}
                        score={urgency.score}
                      />
                    ) : (
                      <span className="text-graphite/40">-</span>
                    )}
                  </td>
                  <td className={`${tableTdClass} capitalize text-graphite/80`}>
                    {c.species}
                  </td>
                  <td className={`${tableTdClass} text-graphite/80`}>
                    {c.reporterName}
                  </td>
                  <td className={`${tableTdClass} truncate text-graphite/55`}>
                    {c.description}
                  </td>
                </ClickableRow>
              );
            })}
          </TableBodyPane>
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
        </TableCard>
      </div>

      <CaseDetailModal caseId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
