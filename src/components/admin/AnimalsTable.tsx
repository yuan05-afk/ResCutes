"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
} from "@/components/admin/ClickableTable";
import { useClientPagination } from "@/components/admin/use-client-pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useActionPending } from "@/components/shared/useActionPending";
import { deleteAnimalAction } from "@/app/actions/adoption";
import type { AnimalRecord } from "@/lib/data/types";
import { formatDate, formatStatus } from "@/lib/utils";
import { getCasePhotoUrl } from "@/lib/demo-images";

const ROWS_PER_PAGE = 12;

interface AnimalsTableProps {
  animals: AnimalRecord[];
  canManage?: boolean;
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
        <div className="flex shrink-0 flex-wrap gap-2 items-end">
          <div className="w-full min-w-0 flex-1 sm:min-w-[12rem]">
            <Input
              placeholder="Search animals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>
          <Select
            value={clearance}
            onChange={(e) => setClearance(e.target.value)}
            className="h-9 w-full min-w-0 sm:w-auto sm:min-w-[10rem]"
          >
            <option value="">All clearance</option>
            <option value="awaiting_examination">Awaiting examination</option>
            <option value="under_examination">Under examination</option>
            <option value="under_treatment">Under treatment</option>
            <option value="follow_up_required">Follow-up required</option>
            <option value="medically_cleared">Medically cleared</option>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setClearance("");
            }}
          >
            Clear
          </Button>
        </div>

        <div className="flex flex-col rounded-xl border border-sage/25 bg-white shadow-card lg:min-h-0 lg:flex-1 lg:overflow-hidden">
          <p className="shrink-0 border-b border-sage/15 px-4 py-2 text-xs text-graphite/50">
            {filtered.length} animal{filtered.length !== 1 ? "s" : ""} · click a
            row to open
          </p>
          <div className="rc-scroll overflow-x-auto lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="sticky top-0 z-10 bg-bone/95 backdrop-blur-sm">
                <tr className="border-b border-sage/20 text-left text-[10px] font-semibold uppercase tracking-wide text-graphite/50">
                  <th className="px-4 py-2.5">Animal</th>
                  <th className="px-4 py-2.5">Species</th>
                  <th className="px-4 py-2.5">Temperament</th>
                  <th className="px-4 py-2.5">Intake</th>
                  <th className="px-4 py-2.5">Medical</th>
                  <th className="px-4 py-2.5">Pathway</th>
                  <th className="px-4 py-2.5">Case</th>
                  {canManage ? <th className="px-4 py-2.5">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {pager.pageItems.map((a) => {
                  const img = getCasePhotoUrl(
                    a.species,
                    a.photoUrl,
                    a.rescueCaseId,
                  );
                  return (
                    <ClickableRow key={a.id} onOpen={() => setOpenId(a.id)}>
                      <td
                        className="px-4 py-2.5"
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
                      <td className="px-4 py-2.5 capitalize text-graphite/80">
                        {a.species}
                      </td>
                      <td className="px-4 py-2.5 text-graphite/65">
                        <p className="line-clamp-2 max-w-[12rem] text-xs">
                          {a.temperament ?? a.bio ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 text-graphite/70">
                        {formatDate(a.intakeDate)}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={a.clearanceStatus} />
                      </td>
                      <td className="px-4 py-2.5 capitalize text-graphite/70">
                        {formatStatus(a.pathwayStage)}
                      </td>
                      <td
                        className="px-4 py-2.5"
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
                          "—"
                        )}
                      </td>
                      {canManage ? (
                        <td
                          className="px-4 py-2.5"
                          onClick={stopRowClick}
                          onKeyDown={stopRowClick}
                        >
                          <div className="flex gap-1.5">
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
