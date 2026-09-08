import { requireAuth } from "@/lib/auth/session";
import {
  getAnimalById,
  getMedicalClearanceForAnimal,
  getNotesForAnimal,
  getCaseById,
  getShelterById,
} from "@/lib/data/service";
import {
  canViewMedicalNotes,
  canEditMedical,
  canManageCases,
  canManageSettings,
} from "@/lib/auth/permissions";
import { notFound } from "next/navigation";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { AnimalDetailView } from "@/components/animals/animal-detail-view";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { isUuid } from "@/lib/ids";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) return { title: "Animal" };
  const animal = await getAnimalById(id);
  if (!animal) return { title: "Animal" };
  return { title: animal.name ?? animal.temporaryId };
}

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const session = await requireAuth();
  const animal = await getAnimalById(id);
  if (!animal) notFound();

  const [clearance, notes, rescueCase, shelter] = await Promise.all([
    getMedicalClearanceForAnimal(id),
    getNotesForAnimal(id),
    animal.rescueCaseId ? getCaseById(animal.rescueCaseId) : Promise.resolve(null),
    animal.shelterId ? getShelterById(animal.shelterId) : Promise.resolve(null),
  ]);
  const canMedical = canViewMedicalNotes(session.user.roles);
  const canEdit = canEditMedical(session.user.roles);
  const canManageProfile =
    canManageCases(session.user.roles) ||
    canManageSettings(session.user.roles);

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
          subtitle="Animal profile"
        />
      }
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
          bio: animal.bio,
          temperament: animal.temperament,
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
        notes={notes.map((n) => ({
          id: n.id,
          content: n.content,
          authorName: n.authorName ?? "Staff",
          createdAt: n.createdAt,
          noteType: n.noteType,
        }))}
        canMedical={canMedical}
        canEdit={canEdit}
        canManageProfile={canManageProfile}
      />
    </PageShell>
  );
}
