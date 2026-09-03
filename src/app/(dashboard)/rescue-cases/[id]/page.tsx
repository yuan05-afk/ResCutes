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
  resolveCurrentUrgency,
  getCaseLocation,
} from "@/lib/data/service";
import { canManageCases, canViewReporterInfo, canViewExactLocation } from "@/lib/auth/permissions";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status/status-badge";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { formatStatus } from "@/lib/utils";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { CaseDetailView } from "@/components/case/case-detail-view";

export default async function RescueCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const caseItem = await getCaseById(id);
  if (!caseItem) notFound();

  const canManage = canManageCases(session.user.roles);
  const canReporter = canViewReporterInfo(session.user.roles);
  const canExact = canViewExactLocation(session.user.roles);
  const mapLocation = getCaseLocation(caseItem, session.user.roles, canExact);
  const [
    history,
    assignments,
    recommendations,
    handoff,
    animal,
    shelter,
    rescuers,
  ] = await Promise.all([
    getStatusHistoryForCase(id),
    getAssignmentsForCase(id),
    getRecommendationsForCase(id),
    getHandoffForCase(id),
    caseItem.animalId ? getAnimalById(caseItem.animalId) : Promise.resolve(null),
    caseItem.assignedShelterId
      ? getShelterById(caseItem.assignedShelterId)
      : Promise.resolve(null),
    getRescuers(),
  ]);
  const currentUrgency = resolveCurrentUrgency(caseItem);

  return (
    <PageShell
      header={
        <DashboardHeader
          title={caseItem.caseNumber}
          subtitle={`${formatStatus(caseItem.species)} · ${formatStatus(caseItem.status)}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={caseItem.status} size="sm" />
            {currentUrgency.score > 0 && (
              <UrgencyBadge
                level={currentUrgency.level}
                score={currentUrgency.score}
              />
            )}
          </div>
        </DashboardHeader>
      }
    >
      <CaseDetailView
        caseItem={{
          id: caseItem.id,
          caseNumber: caseItem.caseNumber,
          status: caseItem.status,
          species: caseItem.species,
          injurySeverity: caseItem.injurySeverity,
          environmentalDanger: caseItem.environmentalDanger,
          vulnerability: caseItem.vulnerability,
          description: caseItem.description,
          reporterName: caseItem.reporterName,
          contactPreference: caseItem.contactPreference,
          locationLabel: caseItem.locationLabel,
          locationNote: caseItem.locationNote,
          rescuerNote: caseItem.rescuerNote,
          latitude: mapLocation.latitude,
          longitude: mapLocation.longitude,
          isApproximateLocation: !canExact,
          showRescuerNote: Boolean(
            caseItem.rescuerNote && (canManage || canExact),
          ),
          photoUrl: caseItem.photoUrl,
          assignedShelterId: caseItem.assignedShelterId,
          urgencyOverrideReason: caseItem.urgencyOverrideReason,
        }}
        currentUrgency={currentUrgency}
        history={history}
        assignments={assignments}
        recommendations={recommendations}
        rescuers={rescuers}
        canManage={canManage}
        canReporter={canReporter}
        hasHandoff={!!handoff}
        hasAnimal={!!animal}
        shelter={shelter}
        animal={animal}
      />
    </PageShell>
  );
}
