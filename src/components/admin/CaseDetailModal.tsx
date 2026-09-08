"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AdminModal,
  ModalMeta,
  ModalSection,
} from "@/components/admin/AdminModal";
import { CaseMediaStrip, CaseMediaStripSkeleton } from "@/components/admin/case-media-strip";
import { CaseLocationBlock } from "@/components/case/case-location-block";
import { CaseStatusPipeline } from "@/components/case/case-status-pipeline";
import { StatusBadge } from "@/components/status/status-badge";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { Button } from "@/components/ui/button";
import { fetchCaseModalData } from "@/app/actions/modal-data";
import { CaseStaffActions } from "@/app/(dashboard)/rescue-cases/[id]/case-staff-actions";
import { ReporterDetails } from "@/components/case/reporter-details";
import { formatDateTime, formatStatus, formatTimelineLabel } from "@/lib/utils";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { cn } from "@/lib/utils";

interface CaseDetailModalProps {
  caseId: string | null;
  onClose: () => void;
}

export function CaseDetailModal({ caseId, onClose }: CaseDetailModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [payload, setPayload] = useState<Awaited<
    ReturnType<typeof fetchCaseModalData>
  > | null>(null);

  const reloadModalData = useCallback(() => {
    setReloadToken((n) => n + 1);
    router.refresh();
  }, [router]);

  const loadedCaseIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!caseId) {
      setPayload(null);
      loadedCaseIdRef.current = null;
      return;
    }
    let alive = true;
    const isInitialLoad = loadedCaseIdRef.current !== caseId;
    if (isInitialLoad) setLoading(true);
    void fetchCaseModalData(caseId).then((res) => {
      if (!alive) return;
      setPayload(res);
      loadedCaseIdRef.current = caseId;
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [caseId, reloadToken]);

  const data = payload && "data" in payload ? payload.data : null;
  const caseItem = data?.caseItem;
  const photoSrc = caseItem
    ? getCasePhotoUrl(caseItem.species, caseItem.photoUrl, caseItem.id)
    : "";
  const canManage = Boolean(data?.canManage);
  const canExact = Boolean(data?.canExact);
  const mapLocation = data?.mapLocation;

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
            "grid min-h-0 items-start gap-3",
            canManage
              ? "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]"
              : "grid-cols-1",
          )}
        >
          {/* Case information */}
          <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
            <CaseStatusPipeline status={caseItem.status} className="shrink-0" />

            <CaseMediaStrip
              compact
              mapInteractive
              photoSrc={photoSrc}
              species={caseItem.species}
              photoAlt={`${formatStatus(caseItem.species)} · ${caseItem.caseNumber}`}
              photoCaption={caseItem.caseNumber}
              latitude={mapLocation?.latitude ?? caseItem.latitude}
              longitude={mapLocation?.longitude ?? caseItem.longitude}
              locationLabel={caseItem.locationLabel}
              caseId={caseItem.id}
              caseNumber={caseItem.caseNumber}
              urgencyLevel={data.currentUrgency.level}
            />

            {mapLocation ? (
              <CaseLocationBlock
                compact
                location={{
                  caseNumber: caseItem.caseNumber,
                  locationLabel: caseItem.locationLabel,
                  locationNote: caseItem.locationNote,
                  latitude: mapLocation.latitude,
                  longitude: mapLocation.longitude,
                  isApproximate: !canExact,
                  rescuerNote: caseItem.rescuerNote,
                  showRescuerNote: Boolean(
                    caseItem.rescuerNote && (canManage || canExact),
                  ),
                }}
              />
            ) : null}

            <p className="shrink-0 line-clamp-2 rounded-lg border border-sage/15 bg-bone/40 px-3 py-2 text-sm leading-relaxed text-graphite/80">
              {caseItem.description}
            </p>

            <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2">
              <ModalMeta label="Species" value={formatStatus(caseItem.species)} />
              <ModalMeta label="Injury" value={formatStatus(caseItem.injurySeverity)} />
              <ModalMeta
                label="Danger"
                value={formatStatus(caseItem.environmentalDanger)}
              />
            </div>

            {data.canReporter ? (
              <div className="shrink-0 rounded-lg border border-sage/15 bg-bone/40 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
                  Reporter
                </p>
                <ReporterDetails
                  className="mt-2"
                  name={caseItem.reporterName}
                  contactPreference={caseItem.contactPreference}
                  phone={data.reporterUser?.phone}
                  email={data.reporterUser?.email}
                  reportedAt={caseItem.createdAt}
                />
              </div>
            ) : null}

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

          {/* Staff actions: same view, right column */}
          {canManage ? (
            <aside className="w-full shrink-0 overflow-hidden rounded-xl border border-sage/25 bg-gradient-to-b from-bone/80 to-white shadow-card">
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
                rescuerNote={caseItem.rescuerNote}
                onActionComplete={reloadModalData}
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
