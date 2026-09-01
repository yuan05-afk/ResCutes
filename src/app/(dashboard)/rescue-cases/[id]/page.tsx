import { requireAuth } from "@/lib/auth/session";
import {
  getCaseById,
  getStatusHistoryForCase,
  getAssignmentsForCase,
  getRecommendationsForCase,
  getHandoffForCase,
  getAnimalById,
  getShelterById,
  getRescuers,
} from "@/lib/data/service";
import { canManageCases, canViewReporterInfo } from "@/lib/auth/permissions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { formatDateTime, formatStatus } from "@/lib/utils";
import { calculateUrgencyScore } from "@/lib/urgency/scoring";
import { CaseStaffActions } from "./case-staff-actions";

export default async function RescueCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const caseItem = getCaseById(id);
  if (!caseItem) notFound();

  const canManage = canManageCases(session.user.roles);
  const canReporter = canViewReporterInfo(session.user.roles);
  const history = getStatusHistoryForCase(id);
  const assignments = getAssignmentsForCase(id);
  const recommendations = getRecommendationsForCase(id);
  const handoff = getHandoffForCase(id);
  const animal = caseItem.animalId ? getAnimalById(caseItem.animalId) : null;
  const shelter = caseItem.assignedShelterId
    ? getShelterById(caseItem.assignedShelterId)
    : null;
  const rescuers = getRescuers();

  const urgencyBreakdown = calculateUrgencyScore({
    injurySeverity: caseItem.injurySeverity as "none_visible",
    environmentalDanger: caseItem.environmentalDanger as "none",
    vulnerability: caseItem.vulnerability as "adult_healthy",
    verifiedAt: caseItem.verifiedAt ? new Date(caseItem.verifiedAt) : null,
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-evergreen">{caseItem.caseNumber}</h1>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={caseItem.status} />
            {caseItem.urgencyScore > 0 && (
              <UrgencyBadge level={caseItem.urgencyLevel} score={caseItem.urgencyScore} />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {caseItem.photoUrl && (
            <div className="relative h-64 w-full rounded-lg overflow-hidden bg-sage/20">
              <Image
                src={caseItem.photoUrl}
                alt="Animal"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <p><span className="text-graphite/60">Species:</span> {formatStatus(caseItem.species)}</p>
              <p><span className="text-graphite/60">Injury:</span> {formatStatus(caseItem.injurySeverity)}</p>
              <p><span className="text-graphite/60">Danger:</span> {formatStatus(caseItem.environmentalDanger)}</p>
              <p><span className="text-graphite/60">Vulnerability:</span> {formatStatus(caseItem.vulnerability)}</p>
              <p className="sm:col-span-2">{caseItem.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Urgency Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-graphite/80">{urgencyBreakdown.explanation}</p>
              {urgencyBreakdown.factors.map((f) => (
                <div key={f.label} className="flex justify-between text-sm border-b border-sage/20 pb-2">
                  <div>
                    <p className="font-medium">{f.label}</p>
                    <p className="text-xs text-graphite/60">{f.explanation}</p>
                  </div>
                  <span className="text-evergreen font-medium">
                    {f.points}/{f.maxPoints}
                  </span>
                </div>
              ))}
              {caseItem.urgencyOverrideReason && (
                <p className="text-sm text-ochre">
                  Override: {caseItem.urgencyOverrideReason}
                </p>
              )}
            </CardContent>
          </Card>

          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Shelter Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-md border border-sage/30 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{r.shelterName}</span>
                      <span className="text-sm text-evergreen">
                        Match: {r.matchScore}%
                      </span>
                    </div>
                    {r.distanceKm !== null && (
                      <p className="text-xs text-graphite/60 mt-1">
                        {r.distanceKm.toFixed(1)} km away
                      </p>
                    )}
                    {r.reasons.length > 0 && (
                      <ul className="text-xs text-graphite/70 mt-2 space-y-0.5">
                        {r.reasons.map((reason) => (
                          <li key={reason}>+ {reason}</li>
                        ))}
                      </ul>
                    )}
                    {r.warnings.length > 0 && (
                      <ul className="text-xs text-ochre mt-1 space-y-0.5">
                        {r.warnings.map((w) => (
                          <li key={w}>! {w}</li>
                        ))}
                      </ul>
                    )}
                    {r.missingCapabilities.length > 0 && (
                      <p className="text-xs text-rescue mt-1">
                        Missing: {r.missingCapabilities.join(", ")}
                      </p>
                    )}
                    <span className="text-xs text-graphite/50 mt-1 block capitalize">
                      Status: {r.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-sage mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium">{formatStatus(h.toStatus)}</p>
                    {h.note && <p className="text-graphite/70">{h.note}</p>}
                    <p className="text-xs text-graphite/50">{formatDateTime(h.createdAt)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="text-graphite/60">Exact coordinates (staff)</p>
              <p>{caseItem.latitude.toFixed(5)}, {caseItem.longitude.toFixed(5)}</p>
              <p className="text-graphite/60 mt-2">Approximate (public)</p>
              <p>
                {caseItem.approximateLatitude.toFixed(5)},{" "}
                {caseItem.approximateLongitude.toFixed(5)}
              </p>
            </CardContent>
          </Card>

          {canReporter && (
            <Card>
              <CardHeader>
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

          {assignments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rescuer Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {assignments.map((a) => (
                  <div key={a.id}>
                    <p className="font-medium">{a.rescuerName}</p>
                    <p className="text-graphite/60 capitalize">{a.status}</p>
                    {a.declineReason && (
                      <p className="text-rescue text-xs">{a.declineReason}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {shelter && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Destination</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{shelter.name}</p>
                <p className="text-graphite/60">{shelter.address}</p>
              </CardContent>
            </Card>
          )}

          {handoff && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Handoff</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{handoff.handoffNotes}</p>
                <p className="text-xs text-graphite/50 mt-1">
                  {formatDateTime(handoff.confirmedAt)}
                </p>
              </CardContent>
            </Card>
          )}

          {animal && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Animal Record</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{animal.name ?? animal.temporaryId}</p>
                <a
                  href={`/animals/${animal.id}`}
                  className="text-evergreen hover:underline text-xs"
                >
                  View animal profile →
                </a>
              </CardContent>
            </Card>
          )}

          {canManage && (
            <CaseStaffActions
              caseId={id}
              caseStatus={caseItem.status}
              rescuers={rescuers}
              recommendations={recommendations}
              assignedShelterId={caseItem.assignedShelterId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
