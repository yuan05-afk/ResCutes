import { requireAuth } from "@/lib/auth/session";
import {
  getAssignmentById,
  getCaseById,
  getShelterById,
  resolveCurrentUrgency,
  canAccessAssignment,
} from "@/lib/data/service";
import { isAdministrator } from "@/lib/auth/permissions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { StatusBadge } from "@/components/status/status-badge";
import { AssignmentActionsClient } from "./assignment-actions";
import { CaseLocationBlock } from "@/components/case/case-location-block";

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

  return (
    <div>
      <header className="border-b border-sage/30 bg-white px-4 py-4">
        <h1 className="text-lg font-semibold text-evergreen">Assignment</h1>
        <p className="text-sm text-graphite/70">{caseItem.caseNumber}</p>
      </header>

      <div className="px-4 py-6 space-y-4">
        {caseItem.photoUrl && (
          <div className="relative h-48 w-full rounded-lg overflow-hidden bg-sage/20">
            <Image
              src={caseItem.photoUrl}
              alt="Animal"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={assignment.status} />
          <StatusBadge status={caseItem.status} />
          <StatusBadge status={caseItem.status} />
          <UrgencyBadge level={currentUrgency.level} score={currentUrgency.score} />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Case Details</CardTitle>
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
