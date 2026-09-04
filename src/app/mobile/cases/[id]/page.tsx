import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import {
  getCaseById,
  getCaseLocation,
  getStatusHistoryForCase,
  getAssignmentsForCase,
  resolveCurrentUrgency,
} from "@/lib/data/service";
import {
  canAccessMobileCase,
  canViewExactLocation,
  canViewReporterInfo,
} from "@/lib/auth/permissions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { formatDateTime, formatStatus, formatTimelineLabel } from "@/lib/utils";
import { CaseLocationBlock } from "@/components/case/case-location-block";
import { CaseActionsClient } from "./case-actions";
import { MobileCaseTimeline } from "./case-timeline";

export default async function MobileCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const caseItem = await getCaseById(id);
  if (!caseItem) notFound();

  const assignments = await getAssignmentsForCase(id);
  if (
    !canAccessMobileCase({
      userId: session.user.id,
      userRoles: session.user.roles,
      reporterId: caseItem.reporterId,
      assignedRescuerIds: assignments.map((a) => a.rescuerId),
    })
  ) {
    notFound();
  }

  const canExact = canViewExactLocation(session.user.roles);
  const canReporter = canViewReporterInfo(session.user.roles);
  const location = getCaseLocation(caseItem, session.user.roles, canExact);
  const history = await getStatusHistoryForCase(id);
  const myAssignment = assignments.find((a) => a.rescuerId === session.user.id);
  const currentUrgency = resolveCurrentUrgency(caseItem);

  const isCitizenView =
    caseItem.reporterId === session.user.id && !canReporter;

  const backHref = myAssignment
    ? `/mobile/assignments/${myAssignment.id}`
    : "/mobile/cases";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-bone">
      <header className="shrink-0 border-b border-sage/20 bg-white px-2 py-2.5">
        <div className="flex items-center gap-1">
          <Link
            href={backHref}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-graphite/70 active:bg-bone"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
          <div className="min-w-0 flex-1 pr-3">
            <h1 className="truncate text-base font-bold text-graphite">
              {caseItem.caseNumber}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StatusBadge status={caseItem.status} />
              {currentUrgency.score > 0 ? (
                <UrgencyBadge
                  level={currentUrgency.level}
                  score={currentUrgency.score}
                  size="sm"
                />
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3">
        {caseItem.photoUrl ? (
          <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-sage/15">
            <Image
              src={caseItem.photoUrl}
              alt="Animal photo"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : null}

        <Card className="border-sage/20 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-graphite/55">Species:</span>{" "}
              {formatStatus(caseItem.species)}
            </p>
            <p>
              <span className="text-graphite/55">Condition:</span>{" "}
              {formatStatus(caseItem.injurySeverity)}
            </p>
            <p className="text-graphite/80">{caseItem.description}</p>
          </CardContent>
        </Card>

        {isCitizenView &&
        (caseItem.status === "shelter_handoff" ||
          caseItem.status === "completed" ||
          caseItem.animalId) ? (
          <div className="rounded-2xl border border-evergreen/25 bg-evergreen/5 px-4 py-3">
            <p className="text-sm font-semibold text-evergreen">
              Animal is safe at shelter
            </p>
            <p className="mt-1 text-xs text-graphite/60">
              Medical details stay with shelter staff.
            </p>
          </div>
        ) : null}

        <CaseLocationBlock
          location={{
            caseNumber: caseItem.caseNumber,
            locationLabel: caseItem.locationLabel,
            locationNote: caseItem.locationNote,
            latitude: location.latitude,
            longitude: location.longitude,
            isApproximate: !canExact,
            rescuerNote: caseItem.rescuerNote,
            showRescuerNote: Boolean(
              caseItem.rescuerNote &&
                (canExact || myAssignment?.status === "accepted"),
            ),
          }}
        />

        {canReporter ? (
          <Card className="border-sage/20 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reporter</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>{caseItem.reporterName}</p>
              <p className="mt-1 capitalize text-graphite/55">
                Contact: {formatStatus(caseItem.contactPreference)}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {history.length > 0 ? (
          <MobileCaseTimeline
            entries={history.map((h) => ({
              id: h.id,
              label: formatTimelineLabel(h),
              note: h.note,
              at: formatDateTime(h.createdAt),
            }))}
          />
        ) : null}
      </div>

      {myAssignment ? (
        <div className="z-20 shrink-0 border-t border-sage/20 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(24,60,53,0.06)]">
          <CaseActionsClient
            assignmentId={myAssignment.id}
            caseId={id}
            assignmentStatus={myAssignment.status}
            caseStatus={caseItem.status}
          />
        </div>
      ) : null}
    </div>
  );
}
