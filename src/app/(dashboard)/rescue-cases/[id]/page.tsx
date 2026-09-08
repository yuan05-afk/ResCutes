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
  getUserById,
} from "@/lib/data/service";
import { canManageCases, canViewReporterInfo, canViewExactLocation } from "@/lib/auth/permissions";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status/status-badge";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { formatStatus } from "@/lib/utils";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { CaseDetailView } from "@/components/case/case-detail-view";
import { isUuid } from "@/lib/ids";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) return { title: "Rescue case" };
  const caseItem = await getCaseById(id);
  if (!caseItem) return { title: "Rescue case" };
  return { title: caseItem.caseNumber };
}

export default async function RescueCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
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
    reporterUser,
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
    canReporter
      ? getUserById(caseItem.reporterId)
      : Promise.resolve(null),
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
          reporterPhone: reporterUser?.phone,
          reporterEmail: reporterUser?.email,
          createdAt: caseItem.createdAt,
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
