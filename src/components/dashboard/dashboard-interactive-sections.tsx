"use client";

import { useMemo, useState } from "react";
import { AttentionQueueItem } from "@/components/dashboard/attention-queue-item";
import { CaseDetailModal } from "@/components/admin/CaseDetailModal";
import { DashboardMapClient } from "@/app/(dashboard)/dashboard/dashboard-map";
import { resolveCurrentUrgency } from "@/lib/data/urgency";
import type { RescueCaseRecord } from "@/lib/data/types";
import { cn } from "@/lib/utils";

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
  const [openId, setOpenId] = useState<string | null>(null);
  const [panel, setPanel] = useState<"queue" | "waiting">("queue");

  const mapPins = useMemo(
    () => mergeMapCases(mapCases, criticalCases, waitingForRescuer),
    [mapCases, criticalCases, waitingForRescuer],
  );

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
          <div className="relative min-h-0 flex-1 p-2">
            <DashboardMapClient
              cases={mapPins}
              onMarkerClick={(id) => setOpenId(id)}
              selectedMarkerId={openId ?? undefined}
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
                    onOpen={() => setOpenId(c.id)}
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
                    onOpen={() => setOpenId(c.id)}
                    compact
                  />
                );
              })
            )}
          </div>
        </section>
      </div>

      <CaseDetailModal caseId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
