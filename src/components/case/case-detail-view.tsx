"use client";

import Link from "next/link";
import { CaseMediaStrip } from "@/components/admin/case-media-strip";
import { ModalMeta, ModalSection } from "@/components/admin/AdminModal";
import { CaseStaffActions } from "@/app/(dashboard)/rescue-cases/[id]/case-staff-actions";
import { formatDateTime, formatStatus, formatTimelineLabel } from "@/lib/utils";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { cn } from "@/lib/utils";

interface TimelineEntry {
  id: string;
  note?: string | null;
  createdAt: string;
  fromStatus?: string | null;
  toStatus: string;
}

interface AssignmentEntry {
  id: string;
  rescuerName: string;
  status: string;
  declineReason?: string | null;
}

interface RecommendationEntry {
  id: string;
  shelterId: string;
  shelterName: string;
  rank: number;
  matchScore: number;
  distanceKm: number | null;
}

interface CaseDetailViewProps {
  caseItem: {
    id: string;
    caseNumber: string;
    status: string;
    species: string;
    injurySeverity: string;
    environmentalDanger: string;
    vulnerability: string;
    description: string;
    reporterName: string;
    contactPreference: string;
    latitude: number;
    longitude: number;
    photoUrl?: string;
    assignedShelterId?: string;
    urgencyOverrideReason?: string;
  };
  currentUrgency: {
    level: string;
    score: number;
    explanation: string;
    factors: { label: string; explanation: string; points: number; maxPoints: number }[];
  };
  history: TimelineEntry[];
  assignments: AssignmentEntry[];
  recommendations: RecommendationEntry[];
  rescuers: { id: string; name: string }[];
  canManage: boolean;
  canReporter: boolean;
  hasHandoff: boolean;
  hasAnimal: boolean;
  shelter?: { name: string; address: string } | null;
  animal?: { id: string; name?: string | null; temporaryId: string } | null;
}

export function CaseDetailView({
  caseItem,
  currentUrgency,
  history,
  assignments,
  recommendations,
  rescuers,
  canManage,
  canReporter,
  hasHandoff,
  hasAnimal,
  shelter,
  animal,
}: CaseDetailViewProps) {
  const photoSrc = getCasePhotoUrl(
    caseItem.species,
    caseItem.photoUrl,
    caseItem.id,
  );
  const acceptedAssignment = assignments.find(
    (a) => a.status === "accepted" || a.status === "completed",
  );

  return (
    <div
      className={cn(
        "grid h-full min-h-0 gap-3",
        canManage
          ? "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]"
          : "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]",
      )}
    >
      {/* Left — case intelligence */}
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
          urgencyLevel={currentUrgency.level}
          mapInteractive
        />

        <p className="shrink-0 line-clamp-2 rounded-lg border border-sage/15 bg-bone/40 px-3 py-2 text-sm leading-relaxed text-graphite/80">
          {caseItem.description}
        </p>

        <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3">
          <ModalMeta label="Species" value={formatStatus(caseItem.species)} />
          <ModalMeta label="Injury" value={formatStatus(caseItem.injurySeverity)} />
          <ModalMeta label="Danger" value={formatStatus(caseItem.environmentalDanger)} />
          <ModalMeta label="Vulnerability" value={formatStatus(caseItem.vulnerability)} />
          {canReporter ? (
            <ModalMeta label="Reporter" value={caseItem.reporterName} />
          ) : null}
          {acceptedAssignment ? (
            <ModalMeta
              label="Rescuer"
              value={`${acceptedAssignment.rescuerName} (${acceptedAssignment.status})`}
            />
          ) : null}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex min-h-0 flex-col rounded-lg border border-sage/20 bg-white p-2.5 shadow-card">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
              Urgency
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-graphite/75">
              {currentUrgency.explanation}
            </p>
            {currentUrgency.factors.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {currentUrgency.factors.slice(0, 3).map((f) => (
                  <li
                    key={f.label}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span className="truncate text-graphite/70">{f.label}</span>
                    <span className="shrink-0 font-semibold text-evergreen">
                      {f.points}/{f.maxPoints}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {caseItem.urgencyOverrideReason ? (
              <p className="mt-1.5 line-clamp-1 text-[11px] text-ochre">
                Override: {caseItem.urgencyOverrideReason}
              </p>
            ) : null}
          </div>

          <ModalSection title="Timeline" className="min-h-0 flex flex-col">
            <ul className="min-h-0 space-y-1 overflow-hidden">
              {history.slice(0, 4).map((h) => (
                <li
                  key={h.id}
                  className="rounded-lg bg-bone/60 px-2.5 py-1.5 text-[11px]"
                >
                  <p className="truncate font-medium text-graphite">
                    {formatTimelineLabel(h)}
                  </p>
                  <p className="text-[10px] text-graphite/45">
                    {formatDateTime(h.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </ModalSection>
        </div>

        {(shelter || animal || recommendations.length > 0) && (
          <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3">
            {shelter ? (
              <ModalMeta
                label="Destination"
                value={
                  <span className="line-clamp-2">
                    {shelter.name}
                  </span>
                }
              />
            ) : null}
            {animal ? (
              <ModalMeta
                label="Animal"
                value={
                  <Link
                    href={`/animals/${animal.id}`}
                    className="text-evergreen hover:underline"
                  >
                    {animal.name ?? animal.temporaryId}
                  </Link>
                }
              />
            ) : null}
            {recommendations[0] ? (
              <ModalMeta
                label="Top shelter match"
                value={`${recommendations[0].shelterName} (${recommendations[0].matchScore}%)`}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Right — context + staff actions */}
      <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
        {!canReporter && !canManage ? null : (
          <div className="grid shrink-0 grid-cols-1 gap-2">
            {canReporter ? (
              <ModalMeta
                label="Contact"
                value={formatStatus(caseItem.contactPreference)}
              />
            ) : null}
            <ModalMeta
              label="Coordinates"
              value={`${caseItem.latitude.toFixed(4)}, ${caseItem.longitude.toFixed(4)}`}
            />
          </div>
        )}

        {canManage ? (
          <aside className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-sage/25 bg-gradient-to-b from-bone/80 to-white shadow-card">
            <CaseStaffActions
              variant="panel"
              caseId={caseItem.id}
              caseNumber={caseItem.caseNumber}
              caseStatus={caseItem.status}
              species={caseItem.species}
              injurySeverity={caseItem.injurySeverity}
              rescuers={rescuers}
              recommendations={recommendations}
              assignedShelterId={caseItem.assignedShelterId}
              hasHandoff={hasHandoff}
              hasAnimal={hasAnimal}
            />
          </aside>
        ) : (
          <div className="rounded-xl border border-sage/20 bg-bone/30 p-4 text-sm text-graphite/60">
            Staff actions are not available for your role.
          </div>
        )}
      </div>
    </div>
  );
}
