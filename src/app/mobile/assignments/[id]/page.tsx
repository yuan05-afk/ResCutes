import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import {
  getAssignmentById,
  getCaseById,
  getShelterById,
  getUserById,
  resolveCurrentUrgency,
  canAccessAssignment,
} from "@/lib/data/service";
import {
  canViewReporterInfo,
  isAdministrator,
} from "@/lib/auth/permissions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { StatusBadge } from "@/components/status/status-badge";
import { CaseLocationBlock } from "@/components/case/case-location-block";
import { ReporterDetails } from "@/components/case/reporter-details";
import { AssignmentActionsClient } from "./assignment-actions";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const assignment = await getAssignmentById(id);
  if (!assignment) notFound();

  const caseItem = await getCaseById(assignment.caseId);
  if (!caseItem) notFound();

  if (
    !(await canAccessAssignment(id, session.user.id, {
      adminOverride: isAdministrator(session.user.roles),
    }))
  ) {
    notFound();
  }

  const currentUrgency = resolveCurrentUrgency(caseItem);
  const shelter = caseItem.assignedShelterId
    ? await getShelterById(caseItem.assignedShelterId)
    : null;

  // Assigned rescuer (and staff/admin) need reporter contact before accepting.
  const showReporter =
    canViewReporterInfo(session.user.roles) ||
    assignment.rescuerId === session.user.id;
  const reporterUser = showReporter
    ? await getUserById(caseItem.reporterId)
    : null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-bone">
      <header className="shrink-0 border-b border-sage/20 bg-white px-2 py-2.5">
        <div className="flex items-center gap-1">
          <Link
            href="/mobile/cases"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-graphite/70 active:bg-bone"
            aria-label="Back to cases"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
          <div className="min-w-0 flex-1 pr-3">
            <h1 className="truncate text-base font-bold text-graphite">
              Assignment
            </h1>
            <p className="truncate text-xs text-graphite/60">
              {caseItem.caseNumber}
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3">
        {caseItem.photoUrl ? (
          <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-sage/20">
            <Image
              src={caseItem.photoUrl}
              alt="Animal"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={assignment.status} />
          <StatusBadge status={caseItem.status} />
          {currentUrgency.score > 0 ? (
            <UrgencyBadge
              level={currentUrgency.level}
              score={currentUrgency.score}
              size="sm"
            />
          ) : null}
        </div>

        <Card className="border-sage/20 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Case details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{caseItem.description}</p>
          </CardContent>
        </Card>

        <CaseLocationBlock
          location={{
            caseNumber: caseItem.caseNumber,
            locationLabel: caseItem.locationLabel,
            locationNote: caseItem.locationNote,
            latitude: caseItem.latitude,
            longitude: caseItem.longitude,
            rescuerNote: caseItem.rescuerNote,
            showRescuerNote: Boolean(caseItem.rescuerNote),
          }}
        />

        {showReporter ? (
          <Card className="border-sage/20 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reporter</CardTitle>
            </CardHeader>
            <CardContent>
              <ReporterDetails
                name={caseItem.reporterName}
                contactPreference={caseItem.contactPreference}
                phone={reporterUser?.phone}
                email={reporterUser?.email}
                reportedAt={caseItem.createdAt}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="z-20 shrink-0 border-t border-sage/20 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(24,60,53,0.06)]">
        <AssignmentActionsClient
          assignmentId={assignment.id}
          caseId={caseItem.id}
          assignmentStatus={assignment.status}
          caseStatus={caseItem.status}
          latitude={caseItem.latitude}
          longitude={caseItem.longitude}
          caseNumber={caseItem.caseNumber}
          locationLabel={caseItem.locationLabel}
          locationNote={caseItem.locationNote}
          shelterName={shelter?.name}
          shelterAddress={shelter?.address}
        />
      </div>
    </div>
  );
}
