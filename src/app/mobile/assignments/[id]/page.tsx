import { requireAuth } from "@/lib/auth/session";
import { getAssignmentById, getCaseById } from "@/lib/data/service";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { StatusBadge } from "@/components/status/status-badge";
import { AssignmentActionsClient } from "./assignment-actions";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const assignment = getAssignmentById(id);
  if (!assignment) notFound();

  const caseItem = getCaseById(assignment.caseId);
  if (!caseItem) notFound();

  if (assignment.rescuerId !== session.user.id) {
    notFound();
  }

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

        <div className="flex items-center gap-2">
          <StatusBadge status={assignment.status} />
          <UrgencyBadge level={caseItem.urgencyLevel} score={caseItem.urgencyScore} />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Case Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>{caseItem.description}</p>
            <p className="text-graphite/60">
              Location: {caseItem.latitude.toFixed(4)}, {caseItem.longitude.toFixed(4)}
            </p>
          </CardContent>
        </Card>

        <AssignmentActionsClient
          assignmentId={assignment.id}
          caseId={caseItem.id}
          assignmentStatus={assignment.status}
          caseStatus={caseItem.status}
          latitude={caseItem.latitude}
          longitude={caseItem.longitude}
        />
      </div>
    </div>
  );
}
