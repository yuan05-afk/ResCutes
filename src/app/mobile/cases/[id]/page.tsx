import { requireAuth } from "@/lib/auth/session";
import {
  getCaseById,
  getCaseLocation,
  getStatusHistoryForCase,
  getAssignmentsForCase,
  resolveCurrentUrgency,
} from "@/lib/data/service";
import {
  canViewExactLocation,
  canViewReporterInfo,
} from "@/lib/auth/permissions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { formatDateTime, formatStatus, formatTimelineLabel } from "@/lib/utils";
import { CaseActionsClient } from "./case-actions";

export default async function MobileCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const caseItem = getCaseById(id);
  if (!caseItem) notFound();

  const canExact = canViewExactLocation(session.user.roles);
  const canReporter = canViewReporterInfo(session.user.roles);
  const location = getCaseLocation(caseItem, session.user.roles, canExact);
  const history = getStatusHistoryForCase(id);
  const assignments = getAssignmentsForCase(id);
  const myAssignment = assignments.find((a) => a.rescuerId === session.user.id);
  const currentUrgency = resolveCurrentUrgency(caseItem);

  const isCitizenView =
    caseItem.reporterId === session.user.id && !canReporter;

  return (
    <div>
      <header className="border-b border-sage/30 bg-white px-4 py-4">
        <h1 className="text-lg font-semibold text-evergreen">{caseItem.caseNumber}</h1>
        <div className="flex items-center gap-2 mt-2">
          <StatusBadge status={caseItem.status} />
          {currentUrgency.score > 0 && (
            <UrgencyBadge level={currentUrgency.level} score={currentUrgency.score} />
          )}
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {caseItem.photoUrl && (
          <div className="relative h-48 w-full rounded-lg overflow-hidden bg-sage/20">
            <Image
              src={caseItem.photoUrl}
              alt="Animal photo"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Report Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-graphite/60">Species:</span> {formatStatus(caseItem.species)}</p>
            <p><span className="text-graphite/60">Condition:</span> {formatStatus(caseItem.injurySeverity)}</p>
            <p><span className="text-graphite/60">Danger:</span> {formatStatus(caseItem.environmentalDanger)}</p>
            <p className="text-graphite/80">{caseItem.description}</p>
          </CardContent>
        </Card>

        {isCitizenView &&
          (caseItem.status === "shelter_handoff" || caseItem.animalId) && (
          <Card className="border-evergreen/30 bg-evergreen/5">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-evergreen">
                Animal is safe at shelter
              </p>
              <p className="text-sm text-graphite/70 mt-1">
                Your reported animal has been safely transferred to a shelter
                and is receiving care. Medical details are not shared with
                reporters.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-graphite/60 mb-1">
              {canExact ? "Exact coordinates" : "Approximate location"}
            </p>
            <p>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
          </CardContent>
        </Card>

        {canReporter && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reporter</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>{caseItem.reporterName}</p>
              <p className="text-graphite/60 capitalize mt-1">
                Contact: {formatStatus(caseItem.contactPreference)}
              </p>
            </CardContent>
          </Card>
        )}

        {history.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-sage mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium">{formatTimelineLabel(h)}</p>
                    {h.note && <p className="text-graphite/70">{h.note}</p>}
                    <p className="text-xs text-graphite/50">{formatDateTime(h.createdAt)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {myAssignment && (
          <CaseActionsClient
            assignmentId={myAssignment.id}
            caseId={id}
            assignmentStatus={myAssignment.status}
            caseStatus={caseItem.status}
          />
        )}
      </div>
    </div>
  );
}
