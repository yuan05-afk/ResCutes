"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  ClipboardPlus,
  Stethoscope,
  Syringe,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import { ModalTabs } from "@/components/admin/AdminModal";
import { MedicalClearanceForm } from "@/app/(dashboard)/animals/[id]/medical-form";
import { AnimalImage } from "@/components/ui/animal-image";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import { ToastViewport } from "@/components/ui/toast";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { formatDate, formatStatus, cn, hasMeaningfulValue } from "@/lib/utils";
import type {
  AnimalRecord,
  ClearanceStatus,
  MedicalClearanceRecord,
} from "@/lib/data/types";

export type MedicalQueueItem = {
  animal: AnimalRecord;
  clearance: MedicalClearanceRecord | null;
};

type QueueTab =
  | "awaiting_examination"
  | "under_examination"
  | "under_treatment"
  | "follow_up_required"
  | "medically_cleared";

const WORKFLOW_STEPS = [
  {
    id: "awaiting_examination" as const,
    label: "Intake exam",
    hint: "Assess within 24h of intake",
    icon: ClipboardPlus,
  },
  {
    id: "under_examination" as const,
    label: "Full exam",
    hint: "Document condition & priority",
    icon: Stethoscope,
  },
  {
    id: "under_treatment" as const,
    label: "Treatment",
    hint: "Treat or isolate as needed",
    icon: Syringe,
  },
  {
    id: "follow_up_required" as const,
    label: "Follow-up",
    hint: "Recheck before clearing",
    icon: CalendarClock,
  },
  {
    id: "medically_cleared" as const,
    label: "Cleared",
    hint: "Then behavior → adoption",
    icon: CheckCircle2,
  },
];

const TAB_ORDER: QueueTab[] = [
  "awaiting_examination",
  "under_examination",
  "under_treatment",
  "follow_up_required",
  "medically_cleared",
];

function priorityRank(priority?: string) {
  if (priority === "emergency") return 0;
  if (priority === "urgent") return 1;
  return 2;
}

function checklistFor(
  animal: AnimalRecord,
  clearance: MedicalClearanceRecord | null,
) {
  const status = animal.clearanceStatus as ClearanceStatus;
  const items = [
    {
      id: "exam",
      label: "Intake / physical exam started",
      done:
        status !== "awaiting_examination" ||
        Boolean(clearance?.examinationDate),
    },
    {
      id: "condition",
      label: "General condition recorded",
      done: hasMeaningfulValue(clearance?.generalCondition),
    },
    {
      id: "priority",
      label: "Medical priority set",
      done: hasMeaningfulValue(clearance?.medicalPriority),
    },
    {
      id: "treatment",
      label: "Treatment plan documented (if needed)",
      done:
        status === "awaiting_examination" ||
        status === "under_examination" ||
        status === "medically_cleared" ||
        hasMeaningfulValue(clearance?.treatmentSummary),
    },
    {
      id: "followup",
      label: "Follow-up scheduled or not required",
      done:
        status !== "follow_up_required" || Boolean(clearance?.followUpDate),
    },
    {
      id: "notes",
      label: "Clinical notes for adopter disclosure",
      done:
        hasMeaningfulValue(clearance?.veterinarianNotes) ||
        hasMeaningfulValue(clearance?.restrictions) ||
        status === "awaiting_examination",
    },
    {
      id: "cleared",
      label: "Marked medically cleared",
      done: status === "medically_cleared",
    },
  ];
  return items;
}

interface MedicalWorkspaceProps {
  items: MedicalQueueItem[];
  canEdit: boolean;
}

export function MedicalWorkspace({ items, canEdit }: MedicalWorkspaceProps) {
  const searchParams = useSearchParams();
  const animalFromUrl = searchParams.get("animal");

  const counts = useMemo(() => {
    const map: Record<QueueTab, number> = {
      awaiting_examination: 0,
      under_examination: 0,
      under_treatment: 0,
      follow_up_required: 0,
      medically_cleared: 0,
    };
    for (const item of items) {
      const key = item.animal.clearanceStatus as QueueTab;
      if (key in map) map[key] += 1;
    }
    return map;
  }, [items]);

  const initialTab = useMemo((): QueueTab => {
    if (animalFromUrl) {
      const match = items.find((i) => i.animal.id === animalFromUrl);
      if (match) return match.animal.clearanceStatus as QueueTab;
    }
    return TAB_ORDER.find((t) => counts[t] > 0) ?? "awaiting_examination";
  }, [animalFromUrl, counts, items]);

  const [tab, setTab] = useState<QueueTab>(initialTab);
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    animalFromUrl && items.some((i) => i.animal.id === animalFromUrl)
      ? animalFromUrl
      : null,
  );
  const [urlSynced, setUrlSynced] = useState(false);

  // Sync from ?animal= once after mount / URL change - do not fight tab clicks.
  useEffect(() => {
    if (!animalFromUrl) {
      setUrlSynced(true);
      return;
    }
    const match = items.find((i) => i.animal.id === animalFromUrl);
    if (match) {
      setTab(match.animal.clearanceStatus as QueueTab);
      setSelectedId(match.animal.id);
    }
    setUrlSynced(true);
  }, [animalFromUrl, items]);

  const filtered = useMemo(() => {
    return items
      .filter((i) => i.animal.clearanceStatus === tab)
      .sort((a, b) => {
        const pr =
          priorityRank(a.clearance?.medicalPriority) -
          priorityRank(b.clearance?.medicalPriority);
        if (pr !== 0) return pr;
        return (a.animal.name ?? a.animal.temporaryId).localeCompare(
          b.animal.name ?? b.animal.temporaryId,
        );
      });
  }, [items, tab]);

  useEffect(() => {
    if (!urlSynced) return;
    if (selectedId && filtered.some((i) => i.animal.id === selectedId)) return;
    setSelectedId(filtered[0]?.animal.id ?? null);
  }, [filtered, selectedId, urlSynced]);

  const selected = items.find((i) => i.animal.id === selectedId) ?? null;
  const checklist = selected
    ? checklistFor(selected.animal, selected.clearance)
    : [];
  const checklistDone = checklist.filter((c) => c.done).length;
  const activeStepIndex = WORKFLOW_STEPS.findIndex(
    (s) => s.id === (selected?.animal.clearanceStatus ?? tab),
  );

  function selectTab(next: QueueTab) {
    setTab(next);
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="shrink-0 overflow-hidden rounded-xl border border-sage/25 bg-white p-3 shadow-card">
          <div className="mb-3">
            <p className="text-sm font-semibold text-graphite">
              Clearance pathway
            </p>
            <p className="text-xs text-graphite/55">
              Click a stage to filter the queue. Intake exam → treatment → clear
              → behavior → adoption.
            </p>
          </div>
          <ol className="grid gap-2 sm:grid-cols-5">
            {WORKFLOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = tab === step.id;
              const isDone = index < activeStepIndex;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => selectTab(step.id)}
                    className={cn(
                      "h-full w-full rounded-lg border px-2.5 py-2 text-left transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen/40",
                      isActive
                        ? "border-evergreen/40 bg-evergreen/8 ring-1 ring-evergreen/20"
                        : isDone
                          ? "border-sage/30 bg-bone/50 hover:border-evergreen/25"
                          : "border-sage/20 bg-white hover:border-sage/40 hover:bg-bone/40",
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5",
                          isActive ? "text-evergreen" : "text-graphite/40",
                        )}
                      />
                      <span
                        className={cn(
                          "text-[11px] font-semibold",
                          isActive ? "text-evergreen" : "text-graphite/70",
                        )}
                      >
                        {index + 1}. {step.label}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] leading-snug text-graphite/50">
                      {step.hint}
                    </p>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <ModalTabs
          tabs={TAB_ORDER.map((id) => ({
            id,
            label: `${formatStatus(id)} (${counts[id]})`,
          }))}
          active={tab}
          onChange={(id) => selectTab(id as QueueTab)}
          className="overflow-x-auto"
        />

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
          {/* Queue list */}
          <div className="flex max-h-[40vh] min-h-[12rem] flex-col overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card lg:max-h-none lg:min-h-0">
            <div className="shrink-0 border-b border-sage/20 bg-bone/40 px-4 py-2.5 text-xs text-graphite/55">
              {filtered.length} animal{filtered.length !== 1 ? "s" : ""} · click
              a row to review
            </div>
            <div className="rc-scroll min-h-0 flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm text-graphite/50">
                  No animals in this stage.
                </p>
              ) : (
                <ul className="divide-y divide-sage/15">
                  {filtered.map(({ animal, clearance }) => {
                    const img = getCasePhotoUrl(
                      animal.species,
                      animal.photoUrl,
                      animal.rescueCaseId,
                    );
                    const isSelected = animal.id === selectedId;
                    const priority = clearance?.medicalPriority;
                    return (
                      <li key={animal.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(animal.id)}
                          aria-pressed={isSelected}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-evergreen/35",
                            isSelected
                              ? "bg-evergreen/10 ring-1 ring-inset ring-evergreen/25"
                              : "hover:bg-bone/60",
                          )}
                        >
                          <AnimalImage
                            src={img}
                            species={animal.species}
                            alt={animal.name ?? animal.temporaryId}
                            containerClassName="pointer-events-none h-11 w-11 shrink-0 rounded-lg"
                            sizes="44px"
                            objectPosition="center top"
                            expandable={false}
                            showExpandHint={false}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-semibold text-graphite">
                                {animal.name ?? animal.temporaryId}
                              </p>
                              {priority && priority !== "routine" ? (
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                    priority === "emergency"
                                      ? "bg-rescue/12 text-rescue"
                                      : "bg-ochre/12 text-ochre",
                                  )}
                                >
                                  {formatStatus(priority)}
                                </span>
                              ) : null}
                            </div>
                            <p className="truncate text-[11px] text-graphite/50">
                              {animal.temporaryId} ·{" "}
                              {formatStatus(animal.species)}
                              {clearance?.generalCondition
                                ? ` · ${clearance.generalCondition}`
                                : ""}
                            </p>
                          </div>
                          <StatusBadge
                            status={animal.clearanceStatus}
                            size="sm"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Detail + form - one scrollable column so actions are never clipped */}
          <div className="rc-scroll min-h-0 flex-1 overflow-y-auto rounded-xl border border-sage/25 bg-bone/30 lg:min-h-0">
            {selected ? (
              <div className="space-y-3 p-3">
                <div className="rounded-xl border border-sage/25 bg-white p-3.5 shadow-card">
                  <div className="flex items-start gap-3">
                    <AnimalImage
                      src={getCasePhotoUrl(
                        selected.animal.species,
                        selected.animal.photoUrl,
                        selected.animal.rescueCaseId,
                      )}
                      species={selected.animal.species}
                      alt={
                        selected.animal.name ?? selected.animal.temporaryId
                      }
                      containerClassName="h-16 w-16 shrink-0 rounded-xl"
                      sizes="64px"
                      objectPosition="center top"
                      expandable
                      lightboxCaption={
                        selected.animal.name ?? selected.animal.temporaryId
                      }
                      showExpandHint={false}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-graphite">
                        {selected.animal.name ?? selected.animal.temporaryId}
                      </p>
                      <p className="text-xs text-graphite/50">
                        {selected.animal.temporaryId} ·{" "}
                        {formatStatus(selected.animal.species)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <StatusBadge
                          status={selected.animal.clearanceStatus}
                          size="sm"
                        />
                        <StatusBadge
                          status={selected.animal.pathwayStage}
                          size="sm"
                        />
                      </div>
                      {selected.clearance?.examinationDate ? (
                        <p className="mt-2 text-[11px] text-graphite/45">
                          Exam {formatDate(selected.clearance.examinationDate)}
                          {selected.clearance.veterinarianName
                            ? ` · ${selected.clearance.veterinarianName}`
                            : ""}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/animals/${selected.animal.id}`}>
                        Animal profile
                      </Link>
                    </Button>
                    {selected.animal.clearanceStatus === "medically_cleared" ? (
                      <Button size="sm" asChild>
                        <Link href="/adoption">
                          Adoption queue
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-xl border border-sage/25 bg-white p-3.5 shadow-card">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-graphite/50">
                      Before adoption-ready
                    </p>
                    <p className="text-[11px] text-graphite/45">
                      {checklistDone}/{checklist.length}
                    </p>
                  </div>
                  <ul className="space-y-1.5">
                    {checklist.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-2 text-xs text-graphite/75"
                      >
                        {item.done ? (
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-evergreen" />
                        ) : (
                          <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-graphite/30" />
                        )}
                        <span className={cn(item.done && "text-graphite/50")}>
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] leading-relaxed text-graphite/45">
                    After medical clearance, staff complete behavior assessment,
                    then set pathway to Adoption ready or Foster ready.
                  </p>
                </div>

                <div className="overflow-visible rounded-xl border border-sage/25 bg-white shadow-card">
                  {canEdit ? (
                    <MedicalClearanceForm
                      key={`${selected.animal.id}-${selected.animal.clearanceStatus}`}
                      variant="workspace"
                      animalId={selected.animal.id}
                      pathwayStage={selected.animal.pathwayStage}
                      clearanceStatus={
                        selected.animal.clearanceStatus as ClearanceStatus
                      }
                      clearance={selected.clearance ?? undefined}
                    />
                  ) : (
                    <div className="space-y-2 p-4 text-sm text-graphite/65">
                      <p className="font-medium text-graphite">
                        View-only medical record
                      </p>
                      <p>
                        Only veterinarians can update clearance. Staff can
                        review summaries and move the animal along pathway after
                        clearance.
                      </p>
                      {selected.clearance?.treatmentSummary ? (
                        <p>
                          <span className="font-medium text-graphite">
                            Treatment:{" "}
                          </span>
                          {selected.clearance.treatmentSummary}
                        </p>
                      ) : null}
                      {selected.clearance?.veterinarianNotes ? (
                        <p>
                          <span className="font-medium text-graphite">
                            Notes:{" "}
                          </span>
                          {selected.clearance.veterinarianNotes}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[12rem] items-center justify-center px-4 py-10 text-center text-sm text-graphite/50">
                Select an animal from the queue to review medical clearance.
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastViewport />
    </>
  );
}
