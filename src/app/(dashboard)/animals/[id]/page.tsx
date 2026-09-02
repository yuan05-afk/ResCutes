import { requireAuth } from "@/lib/auth/session";
import {
  getAnimalById,
  getMedicalClearanceForAnimal,
  getNotesForAnimal,
  getCaseById,
  getShelterById,
} from "@/lib/data/service";
import { canViewMedicalNotes, canEditMedical } from "@/lib/auth/permissions";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status/status-badge";
import { formatStatus } from "@/lib/utils";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { AnimalDetailView } from "@/components/animals/animal-detail-view";
import { getCasePhotoUrl } from "@/lib/demo-images";

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const animal = getAnimalById(id);
  if (!animal) notFound();

  const clearance = getMedicalClearanceForAnimal(id);
  const notes = getNotesForAnimal(id);
  const rescueCase = animal.rescueCaseId
    ? getCaseById(animal.rescueCaseId)
    : null;
  const shelter = animal.shelterId ? getShelterById(animal.shelterId) : null;
  const canMedical = canViewMedicalNotes(session.user.roles);
  const canEdit = canEditMedical(session.user.roles);

  const displayTitle = animal.name ?? animal.temporaryId;
  const photoSrc = getCasePhotoUrl(
    animal.species,
    animal.photoUrl,
    animal.rescueCaseId,
  );

  return (
    <PageShell
      header={
        <DashboardHeader
          title={displayTitle}
          subtitle={`${formatStatus(animal.species)} · ${animal.temporaryId}`}
        >
          <div className="flex items-center gap-2">
            <StatusBadge status={animal.clearanceStatus} size="sm" />
            <span className="inline-flex items-center rounded-full bg-sage/20 px-2.5 py-0.5 text-[11px] font-medium text-evergreen capitalize">
              {formatStatus(animal.pathwayStage)}
            </span>
          </div>
        </DashboardHeader>
      }
      className="overflow-hidden"
    >
      <AnimalDetailView
        animal={{
          id: animal.id,
          name: animal.name,
          temporaryId: animal.temporaryId,
          species: animal.species,
          estimatedAge: animal.estimatedAge,
          breed: animal.breed,
          color: animal.color,
          sex: animal.sex,
          intakeDate: animal.intakeDate,
          pathwayStage: animal.pathwayStage,
          recommendedNextAction: animal.recommendedNextAction,
          clearanceStatus: animal.clearanceStatus,
          photoUrl: animal.photoUrl,
          rescueCaseId: animal.rescueCaseId,
        }}
        photoSrc={photoSrc}
        rescueCase={
          rescueCase
            ? {
                id: rescueCase.id,
                caseNumber: rescueCase.caseNumber,
                description: rescueCase.description,
                createdAt: rescueCase.createdAt,
              }
            : null
        }
        shelter={shelter}
        clearance={clearance}
        notes={notes}
        canMedical={canMedical}
        canEdit={canEdit}
      />
    </PageShell>
  );
}
