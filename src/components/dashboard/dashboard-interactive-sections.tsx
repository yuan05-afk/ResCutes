"use client";

import { useState } from "react";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { StatusBadge } from "@/components/status/status-badge";
import { AttentionQueueItem } from "@/components/dashboard/attention-queue-item";
import { CaseDetailModal } from "@/components/admin/CaseDetailModal";
import { ClickableRow } from "@/components/admin/ClickableTable";
import { DashboardMapClient } from "@/app/(dashboard)/dashboard/dashboard-map";
import { resolveCurrentUrgency } from "@/lib/data/service";
import type { DemoCase } from "@/lib/data/demo-store";
import { cn } from "@/lib/utils";

interface QueueItem {
  id: string;
  caseNumber: string;
  species: string;
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
  urgencyLevel: string;
}

interface DashboardInteractiveSectionsProps {
  mapCases: MapCaseItem[];
  criticalCases: QueueItem[];
  waitingForRescuer: DemoCase[];
}

export function DashboardInteractiveSections({
  mapCases,
  criticalCases,
  waitingForRescuer,
}: DashboardInteractiveSectionsProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [panel, setPanel] = useState<"queue" | "waiting">("queue");

  return (
    <>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Map — fills remaining height */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card lg:col-span-7">
          <div className="flex shrink-0 items-center justify-between border-b border-sage/15 px-4 py-2.5">
            <h2 className="text-sm font-semibold text-graphite">Live Rescue Activity</h2>
            <span className="text-xs text-graphite/45">{mapCases.length} active pins</span>
          </div>
          <div className="relative min-h-0 flex-1 p-2">
            <DashboardMapClient
              cases={mapCases}
              onMarkerClick={(id) => setOpenId(id)}
              selectedMarkerId={openId ?? undefined}
              className="h-full min-h-[180px]"
            />
          </div>
        </section>

        {/* Right panel — queue or waiting list */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card lg:col-span-5">
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

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 space-y-2">
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
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
                    <th className="px-2 py-1.5">Case</th>
                    <th className="px-2 py-1.5">Status</th>
                    <th className="px-2 py-1.5">Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {waitingForRescuer.slice(0, 8).map((c) => {
                    const urgency = resolveCurrentUrgency(c);
                    return (
                      <ClickableRow
                        key={c.id}
                        onOpen={() => setOpenId(c.id)}
                      >
                        <td className="px-2 py-2 font-semibold text-evergreen text-xs">
                          {c.caseNumber}
                        </td>
                        <td className="px-2 py-2">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-2 py-2">
                          {urgency.score > 0 ? (
                            <UrgencyBadge
                              level={urgency.level}
                              score={urgency.score}
                            />
                          ) : (
                            <span className="text-graphite/40">—</span>
                          )}
                        </td>
                      </ClickableRow>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <CaseDetailModal caseId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
