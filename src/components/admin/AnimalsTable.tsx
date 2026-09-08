"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status/status-badge";
import { AnimalImage } from "@/components/ui/animal-image";
import { AnimalDetailModal } from "@/components/admin/AnimalDetailModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ToastViewport, toast } from "@/components/ui/toast";
import {
  ClickableRow,
  PaginationBar,
  stopRowClick,
  TableBodyPane,
  TableCard,
  TableColGroup,
  TableHeaderPane,
  TableMetaLine,
  TableToolbar,
  tableTdClass,
  tableThClass,
  thActionsClass,
  tdActionsClass,
  useSyncedTableScroll,
} from "@/components/admin/ClickableTable";
import { useClientPagination } from "@/components/admin/use-client-pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useActionPending } from "@/components/shared/useActionPending";
import { deleteAnimalAction } from "@/app/actions/adoption";
import type { AnimalRecord } from "@/lib/data/types";
import { formatDate, formatStatus } from "@/lib/utils";
import { getCasePhotoUrl } from "@/lib/demo-images";

const ROWS_PER_PAGE = 12;
const TABLE_MIN_WIDTH = 920;

interface AnimalsTableProps {
  animals: AnimalRecord[];
  canManage?: boolean;
}

function columnWidths(canManage: boolean) {
  return canManage
    ? ["16%", "9%", "17%", "11%", "13%", "11%", "9%", "14%"]
    : ["18%", "10%", "20%", "12%", "14%", "13%", "13%"];
}

export function AnimalsTable({
  animals,
  canManage = false,
}: AnimalsTableProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [clearance, setClearance] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AnimalRecord | null>(null);
  const debouncedSearch = useDebouncedValue(search, 250);
  const { pending, run } = useActionPending();
  const { bodyRef, headerRef, onBodyScroll } = useSyncedTableScroll();
  const widths = columnWidths(canManage);

  const filtered = useMemo(() => {
    let result = [...animals];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) ||
          a.temporaryId.toLowerCase().includes(q) ||
          a.species.toLowerCase().includes(q) ||
          a.temperament?.toLowerCase().includes(q) ||
          a.bio?.toLowerCase().includes(q),
      );
    }
    if (clearance) {
      result = result.filter((a) => a.clearanceStatus === clearance);
    }
    return result;
  }, [animals, debouncedSearch, clearance]);

  const pager = useClientPagination(filtered, ROWS_PER_PAGE);
  const colGroup = <TableColGroup widths={widths} />;

  useEffect(() => {
    pager.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, clearance]);

  async function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    await run(() => deleteAnimalAction(target.id), {
      rewarm: ["/animals", "/adoption"],
      onSuccess: () => {
        toast(`${target.name ?? target.temporaryId} deleted`, "info");
        setDeleteTarget(null);
        if (openId === target.id) setOpenId(null);
      },
    });
  }

  return (
    <>
      <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
        <TableToolbar>
          <div className="relative w-full min-w-0 flex-1 sm:min-w-[14rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/40" />
            <Input
              placeholder="Search animals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-lg pl-9"
              aria-label="Search animals"
            />
          </div>
          <Select
            value={clearance}
            onChange={(e) => setClearance(e.target.value)}
            className="h-10 w-full min-w-0 rounded-lg sm:w-auto sm:min-w-[11rem]"
            aria-label="Filter by medical clearance"
          >
            <option value="">All clearance</option>
            <option value="awaiting_examination">Awaiting exam</option>
            <option value="under_examination">Under exam</option>
            <option value="under_treatment">Under treatment</option>
            <option value="follow_up_required">Follow-up</option>
            <option value="medically_cleared">Cleared</option>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 rounded-lg px-4"
            onClick={() => {
              setSearch("");
              setClearance("");
            }}
          >
            Clear
          </Button>
        </TableToolbar>

        <TableCard>
          <TableMetaLine>
            {filtered.length} animal{filtered.length !== 1 ? "s" : ""} · click a
            row to open
          </TableMetaLine>

          {/* Mobile card stack */}
          <div className="space-y-2 p-2 md:hidden">
            {pager.pageItems.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-graphite/50">
                No animals match your search or filters.
              </p>
            ) : (
              pager.pageItems.map((a) => {
                const img = getCasePhotoUrl(
                  a.species,
                  a.photoUrl,
                  a.rescueCaseId,
                );
                return (
                  <div
                    key={a.id}
                    className="rounded-xl border border-sage/20 bg-white p-3 shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(a.id)}
                      className="flex w-full gap-3 text-left"
                    >
                      <AnimalImage
                        src={img}
                        species={a.species}
                        alt={a.name ?? a.temporaryId}
                        containerClassName="h-14 w-14 shrink-0 rounded-lg"
                        sizes="56px"
                        objectPosition="center top"
                        expandable={false}
                      />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="font-semibold text-graphite">
                          {a.name ?? a.temporaryId}
                        </p>
                        <p className="text-[11px] text-graphite/45">
                          {a.temporaryId} · {formatStatus(a.species)}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <StatusBadge status={a.clearanceStatus} />
                          <span className="text-[11px] capitalize text-graphite/50">
                            {formatStatus(a.pathwayStage)}
                          </span>
                        </div>
                      </div>
                    </button>
                    {canManage ? (
                      <div className="mt-2.5 flex justify-end gap-1.5 border-t border-sage/15 pt-2.5">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/animals/${a.id}`}>Edit</Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteTarget(a)}
                        >
                          Delete
                        </Button>
                      </div>
                    ) : null}
                  </div>
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
              <th className={tableThClass}>Animal</th>
              <th className={tableThClass}>Species</th>
              <th className={tableThClass}>Temperament</th>
              <th className={tableThClass}>Intake</th>
              <th className={tableThClass}>Medical</th>
              <th className={tableThClass}>Pathway</th>
              <th className={tableThClass}>Case</th>
              {canManage ? (
                <th className={thActionsClass}>Actions</th>
              ) : null}
            </tr>
          </TableHeaderPane>

          <TableBodyPane
            bodyRef={bodyRef}
            onBodyScroll={onBodyScroll}
            minWidth={TABLE_MIN_WIDTH}
            colGroup={colGroup}
            isEmpty={pager.pageItems.length === 0}
            emptyMessage="No animals match your search or filters."
          >
            {pager.pageItems.map((a) => {
              const img = getCasePhotoUrl(
                a.species,
                a.photoUrl,
                a.rescueCaseId,
              );
              return (
                <ClickableRow key={a.id} onOpen={() => setOpenId(a.id)}>
                  <td
                    className={tableTdClass}
                    onClick={stopRowClick}
                    onKeyDown={stopRowClick}
                  >
                    <div className="flex items-center gap-2.5">
                      <AnimalImage
                        src={img}
                        species={a.species}
                        alt={a.name ?? a.temporaryId}
                        containerClassName="h-9 w-9 shrink-0 rounded-lg"
                        sizes="36px"
                        objectPosition="center top"
                        expandable
                        lightboxCaption={a.temporaryId}
                        showExpandHint={false}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-graphite">
                          {a.name ?? a.temporaryId}
                        </p>
                        <p className="text-[11px] text-graphite/45">
                          {a.temporaryId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={`${tableTdClass} capitalize text-graphite/80`}>
                    {a.species}
                  </td>
                  <td className={`${tableTdClass} text-graphite/65`}>
                    <p className="line-clamp-2 text-xs leading-relaxed">
                      {a.temperament ?? a.bio ?? "-"}
                    </p>
                  </td>
                  <td className={`${tableTdClass} text-graphite/70`}>
                    {formatDate(a.intakeDate)}
                  </td>
                  <td className={tableTdClass}>
                    <StatusBadge status={a.clearanceStatus} />
                  </td>
                  <td className={`${tableTdClass} capitalize text-graphite/70`}>
                    {formatStatus(a.pathwayStage)}
                  </td>
                  <td
                    className={tableTdClass}
                    onClick={stopRowClick}
                    onKeyDown={stopRowClick}
                  >
                    {a.rescueCaseId ? (
                      <Link
                        href={`/rescue-cases/${a.rescueCaseId}`}
                        className="text-xs font-medium text-evergreen hover:underline"
                      >
                        {a.caseNumber ?? "View case"}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                  {canManage ? (
                    <td
                      className={tdActionsClass}
                      onClick={stopRowClick}
                      onKeyDown={stopRowClick}
                    >
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/animals/${a.id}`}>Edit</Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteTarget(a)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  ) : null}
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

      <AnimalDetailModal animalId={openId} onClose={() => setOpenId(null)} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete animal?"
        description={
          deleteTarget
            ? `Permanently delete ${deleteTarget.name ?? deleteTarget.temporaryId}. Related medical and adoption records will also be removed.`
            : undefined
        }
        confirmLabel="Delete"
        variant="destructive"
        pending={pending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      <ToastViewport />
    </>
  );
}
