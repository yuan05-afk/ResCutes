"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminModal,
  ModalMeta,
  ModalSection,
} from "@/components/admin/AdminModal";
import {
  CaseMediaStrip,
  CaseMediaStripSkeleton,
} from "@/components/admin/case-media-strip";
import { StatusBadge } from "@/components/status/status-badge";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { Button } from "@/components/ui/button";
import { fetchCaseModalData } from "@/app/actions/modal-data";
import { CaseStaffActions } from "@/app/(dashboard)/rescue-cases/[id]/case-staff-actions";
import { formatDateTime, formatStatus, formatTimelineLabel } from "@/lib/utils";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { cn } from "@/lib/utils";

interface CaseDetailModalProps {
  caseId: string | null;
  onClose: () => void;
}

export function CaseDetailModal({ caseId, onClose }: CaseDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<Awaited<
    ReturnType<typeof fetchCaseModalData>
  > | null>(null);

  useEffect(() => {
    if (!caseId) {
      setPayload(null);
      return;
    }
    let alive = true;
    setLoading(true);
    void fetchCaseModalData(caseId).then((res) => {
      if (!alive) return;
      setPayload(res);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [caseId]);

  const data = payload && "data" in payload ? payload.data : null;
  const caseItem = data?.caseItem;
  const photoSrc = caseItem
    ? getCasePhotoUrl(caseItem.species, caseItem.photoUrl, caseItem.id)
    : "";
  const canManage = Boolean(data?.canManage);

  return (
    <AdminModal
      open={Boolean(caseId)}
      onClose={onClose}
      title={caseItem?.caseNumber ?? "Case details"}
      description={
        caseItem
          ? `${formatStatus(caseItem.species)} · ${formatStatus(caseItem.status)}`
          : loading
            ? "Loading case..."
            : undefined
      }
      headerExtra={
        caseItem ? (
          <>
            <StatusBadge status={caseItem.status} size="sm" />
            {data && data.currentUrgency.score > 0 ? (
              <UrgencyBadge
                level={data.currentUrgency.level}
                score={data.currentUrgency.score}
              />
            ) : null}
          </>
        ) : null
      }
      size="2xl"
      placement="center"
      footer={
        caseId ? (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" asChild>
              <Link href={`/rescue-cases/${caseId}`}>Open full case</Link>
            </Button>
          </div>
        ) : null
      }
    >
      {loading && !data ? <CaseMediaStripSkeleton compact /> : null}

      {data && caseItem ? (
        <div
          className={cn(
            "grid h-full min-h-0 gap-3",
            canManage
              ? "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]"
              : "grid-cols-1",
          )}
        >
          {/* Case information */}
          <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
            <CaseMediaStrip
              compact
              photoSrc={photoSrc}
              species={caseItem.species}
              photoAlt={`${formatStatus(caseItem.species)} rescue`}
              latitude={caseItem.latitude}
              longitude={caseItem.longitude}
              caseId={caseItem.id}
              caseNumber={caseItem.caseNumber}
              urgencyLevel={data.currentUrgency.level}
            />

            <p className="shrink-0 line-clamp-2 rounded-lg border border-sage/15 bg-bone/40 px-3 py-2 text-sm leading-relaxed text-graphite/80">
              {caseItem.description}
            </p>

            <div className="grid shrink-0 grid-cols-2 gap-2">
              <ModalMeta label="Species" value={formatStatus(caseItem.species)} />
              <ModalMeta label="Injury" value={formatStatus(caseItem.injurySeverity)} />
              <ModalMeta
                label="Danger"
                value={formatStatus(caseItem.environmentalDanger)}
              />
              {data.canReporter ? (
                <ModalMeta label="Reporter" value={caseItem.reporterName} />
              ) : (
                <div className="hidden sm:block" aria-hidden />
              )}
            </div>

            {data.assignments[0] ? (
              <ModalMeta
                label="Rescuer"
                value={`${data.assignments[0].rescuerName} (${data.assignments[0].status})`}
                className="shrink-0"
              />
            ) : null}

            {data.history.length > 0 ? (
              <ModalSection title="Recent timeline" className="min-h-0 shrink">
                <ul className="space-y-1">
                  {data.history.slice(0, 2).map((h) => (
                    <li
                      key={h.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-bone/60 px-2.5 py-1.5 text-xs"
                    >
                      <span className="truncate font-medium text-graphite">
                        {formatTimelineLabel(h)}
                      </span>
                      <span className="shrink-0 text-[10px] text-graphite/45">
                        {formatDateTime(h.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </ModalSection>
            ) : null}
          </div>

          {/* Staff actions — same view, right column */}
          {canManage ? (
            <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-sage/25 bg-gradient-to-b from-bone/80 to-white shadow-card">
              <CaseStaffActions
                variant="panel"
                caseId={caseItem.id}
                caseNumber={caseItem.caseNumber}
                caseStatus={caseItem.status}
                species={caseItem.species}
                injurySeverity={caseItem.injurySeverity}
                rescuers={data.rescuers}
                recommendations={data.recommendations}
                assignedShelterId={caseItem.assignedShelterId}
                hasHandoff={!!data.handoff}
                hasAnimal={!!data.animal}
              />
            </aside>
          ) : null}
        </div>
      ) : null}

      {payload && "error" in payload ? (
        <p className="text-sm text-rescue">Could not load case details.</p>
      ) : null}
    </AdminModal>
  );
}
