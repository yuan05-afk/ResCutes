"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AttentionQueueItem } from "@/components/dashboard/attention-queue-item";
import { CaseDetailModal } from "@/components/admin/CaseDetailModal";
import { DashboardMapClient } from "@/app/(dashboard)/dashboard/dashboard-map";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { StatusBadge } from "@/components/status/status-badge";
import { AnimalImage } from "@/components/ui/animal-image";
import { Button } from "@/components/ui/button";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { resolveCurrentUrgency } from "@/lib/data/urgency";
import type { RescueCaseRecord } from "@/lib/data/types";
import { formatStatus, cn } from "@/lib/utils";

interface QueueItem {
  id: string;
  caseNumber: string;
  species: string;
  status: string;
  latitude: number;
  longitude: number;
  urgencyLevel: string;
  urgencyScore: number;
  description: string;
  photoUrl?: string;
  animalName?: string;
}

interface MapCaseItem {
  id: string;
  latitude: number;
  longitude: number;
  caseNumber: string;
  species: string;
  status: string;
  urgencyLevel: string;
}

interface DashboardInteractiveSectionsProps {
  mapCases: MapCaseItem[];
  criticalCases: QueueItem[];
  waitingForRescuer: RescueCaseRecord[];
  className?: string;
}

type FocusCase = {
  id: string;
  caseNumber: string;
  species: string;
  status: string;
  latitude: number;
  longitude: number;
  urgencyLevel: string;
  urgencyScore: number;
  description: string;
  photoUrl?: string;
  animalName?: string;
};

function mergeMapCases(
  base: MapCaseItem[],
  criticalCases: QueueItem[],
  waitingForRescuer: RescueCaseRecord[],
): MapCaseItem[] {
  const byId = new Map(base.map((item) => [item.id, item]));

  for (const item of criticalCases) {
    if (byId.has(item.id)) continue;
    if (!Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)) {
      continue;
    }
    byId.set(item.id, {
      id: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
      caseNumber: item.caseNumber,
      species: item.species,
      status: item.status,
      urgencyLevel: item.urgencyLevel,
    });
  }

  for (const item of waitingForRescuer) {
    if (byId.has(item.id)) continue;
    if (!Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)) {
      continue;
    }
    byId.set(item.id, {
      id: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
      caseNumber: item.caseNumber,
      species: item.species,
      status: item.status,
      urgencyLevel: resolveCurrentUrgency(item).level,
    });
  }

  return [...byId.values()];
}

export function DashboardInteractiveSections({
  mapCases,
  criticalCases,
  waitingForRescuer,
  className,
}: DashboardInteractiveSectionsProps) {
  const [focusId, setFocusId] = useState<string | null>(null);
  const [cameraRequestId, setCameraRequestId] = useState(0);
  const [modalId, setModalId] = useState<string | null>(null);
  const [panel, setPanel] = useState<"queue" | "waiting">("queue");

  const mapPins = useMemo(
    () => mergeMapCases(mapCases, criticalCases, waitingForRescuer),
    [mapCases, criticalCases, waitingForRescuer],
  );

  const focusCases = useMemo(() => {
    const byId = new Map<string, FocusCase>();

    for (const item of criticalCases) {
      byId.set(item.id, item);
    }
    for (const item of waitingForRescuer) {
      const urgency = resolveCurrentUrgency(item);
      byId.set(item.id, {
        id: item.id,
        caseNumber: item.caseNumber,
        species: item.species,
        status: item.status,
        latitude: item.latitude,
        longitude: item.longitude,
        urgencyLevel: urgency.level,
        urgencyScore: urgency.score,
        description: item.description,
        photoUrl: item.photoUrl,
      });
    }
    for (const item of mapPins) {
      if (byId.has(item.id)) continue;
      byId.set(item.id, {
        id: item.id,
        caseNumber: item.caseNumber,
        species: item.species,
        status: item.status,
        latitude: item.latitude,
        longitude: item.longitude,
        urgencyLevel: item.urgencyLevel,
        urgencyScore: 0,
        description: "",
      });
    }
    return byId;
  }, [criticalCases, waitingForRescuer, mapPins]);

  const focused = focusId ? focusCases.get(focusId) ?? null : null;

  function focusCase(id: string) {
    setFocusId(id);
    setCameraRequestId((n) => n + 1);
  }

  return (
    <>
      <div
        className={cn(
          "grid h-full min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12 lg:grid-rows-1",
          className,
        )}
      >
        <section className="flex h-full min-h-[240px] flex-col overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card sm:min-h-[280px] lg:col-span-7 lg:min-h-0">
          <div className="flex shrink-0 items-center justify-between border-b border-sage/15 px-4 py-2.5">
            <h2 className="text-sm font-semibold text-graphite">
              Live Rescue Activity
            </h2>
            <span className="text-xs text-graphite/45">
              {mapPins.length} active pins
            </span>
          </div>

          {focused ? (
            <div className="shrink-0 px-3 pb-2 pt-2">
              <div
                data-testid="dashboard-case-focus-card"
                className="rounded-xl border border-sage/25 bg-white p-3 shadow-sm"
              >
              <div className="flex items-start gap-2.5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <AnimalImage
                    src={getCasePhotoUrl(
                      focused.species,
                      focused.photoUrl,
                      focused.id,
                    )}
                    species={focused.species}
                    alt={focused.animalName ?? focused.caseNumber}
                    containerClassName="absolute inset-0 h-full w-full rounded-lg"
                    sizes="48px"
                    objectPosition="center top"
                    expandable
                    showExpandHint={false}
                    lightboxCaption={focused.caseNumber}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-1">
                        <StatusBadge status={focused.status} size="sm" />
                        <UrgencyBadge
                          level={focused.urgencyLevel}
                          score={focused.urgencyScore || undefined}
                        />
                      </div>
                      <h3 className="truncate text-sm font-bold text-graphite">
                        {focused.animalName ?? formatStatus(focused.species)}
                      </h3>
                      <p className="text-[11px] text-graphite/50">
                        {focused.caseNumber} · {formatStatus(focused.species)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFocusId(null)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-graphite/50 hover:bg-bone hover:text-graphite"
                      aria-label="Close case preview"
                    >
                      Close
                    </button>
                  </div>
                  {focused.description ? (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-graphite/65">
                      {focused.description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setModalId(focused.id)}
                    >
                      Open case
                    </Button>
                    <Button
                      asChild
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                    >
                      <Link href={`/rescue-cases/${focused.id}`}>Full page</Link>
                    </Button>
                  </div>
                </div>
              </div>
              </div>
            </div>
          ) : null}

          <div className="relative min-h-0 flex-1 p-2">
            <DashboardMapClient
              cases={mapPins}
              onMarkerClick={focusCase}
              selectedMarkerId={focusId ?? undefined}
              cameraRequestId={cameraRequestId}
              className="h-full min-h-[200px]"
            />
            {mapPins.length === 0 ? (
              <div className="pointer-events-none absolute inset-2 flex items-center justify-center rounded-lg bg-bone/70 backdrop-blur-[1px]">
                <p className="max-w-[16rem] text-center text-sm text-graphite/60">
                  No active rescue pins yet. New verified cases will appear here.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="flex h-full min-h-[280px] flex-col overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card lg:col-span-5 lg:min-h-0">
          <div className="flex shrink-0 items-center gap-1 border-b border-sage/15 px-3 py-2">
            <button
              type="button"
              onClick={() => setPanel("queue")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                panel === "queue"
                  ? "bg-evergreen text-white"
                  : "text-graphite/55 hover:bg-bone",
              )}
            >
              Attention ({criticalCases.length})
            </button>
            <button
              type="button"
              onClick={() => setPanel("waiting")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                panel === "waiting"
                  ? "bg-evergreen text-white"
                  : "text-graphite/55 hover:bg-bone",
              )}
            >
              Waiting ({waitingForRescuer.length})
            </button>
          </div>

          <div className="rc-scroll min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
            {panel === "queue" ? (
              criticalCases.length === 0 ? (
                <p className="py-8 text-center text-sm text-graphite/50">
                  No critical cases right now.
                </p>
              ) : (
                criticalCases.map((c) => (
                  <AttentionQueueItem
                    key={c.id}
                    id={c.id}
                    caseNumber={c.caseNumber}
                    species={c.species}
                    urgencyLevel={c.urgencyLevel}
                    urgencyScore={c.urgencyScore}
                    description={c.description}
                    photoUrl={c.photoUrl}
                    animalName={c.animalName}
                    selected={focusId === c.id}
                    onOpen={() => focusCase(c.id)}
                    compact
                  />
                ))
              )
            ) : waitingForRescuer.length === 0 ? (
              <p className="py-8 text-center text-sm text-graphite/50">
                No cases waiting for rescuer.
              </p>
            ) : (
              waitingForRescuer.slice(0, 8).map((c) => {
                const urgency = resolveCurrentUrgency(c);
                return (
                  <AttentionQueueItem
                    key={c.id}
                    id={c.id}
                    caseNumber={c.caseNumber}
                    species={c.species}
                    urgencyLevel={urgency.level}
                    urgencyScore={urgency.score}
                    description={c.description}
                    photoUrl={c.photoUrl}
                    selected={focusId === c.id}
                    onOpen={() => focusCase(c.id)}
                    compact
                  />
                );
              })
            )}
          </div>
        </section>
      </div>

      <CaseDetailModal caseId={modalId} onClose={() => setModalId(null)} />
    </>
  );
}
