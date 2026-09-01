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
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import { formatDate, formatDateTime, formatStatus, hasMeaningfulValue } from "@/lib/utils";
import { MedicalClearanceForm } from "./medical-form";
import type { ClearanceStatus } from "@/lib/data/service";
import { PageShell } from "@/components/layout/dashboard-header";
import { AnimalImage } from "@/components/ui/animal-image";
import { getCasePhotoUrl } from "@/lib/demo-images";

function displayOrUnknown(value?: string) {
  return value?.trim() ? value : "Unknown";
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-graphite/60">{label}</p>
      <p className="font-medium text-graphite mt-0.5">{value}</p>
    </div>
  );
}

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

  const staffNotes = notes.filter((n) => n.noteType === "staff");
  const behaviorNotes = notes.filter((n) => n.noteType === "behavior");
  const fieldNotes = notes.filter(
    (n) => n.noteType === "field" || n.noteType === "rescue",
  );

  const displayTitle = animal.name ?? animal.temporaryId;
  const showTemporaryId =
    animal.name && animal.name.trim() !== animal.temporaryId;

  const photoSrc = getCasePhotoUrl(
    animal.species,
    animal.photoUrl,
    animal.rescueCaseId,
  );

  const medicalFields = clearance
    ? [
        clearance.examinationDate && {
          label: "Examination",
          value: formatDate(clearance.examinationDate),
        },
        hasMeaningfulValue(clearance.veterinarianName) && {
          label: "Veterinarian",
          value: clearance.veterinarianName!,
        },
        hasMeaningfulValue(clearance.generalCondition) && {
          label: "Condition",
          value: clearance.generalCondition!,
        },
        hasMeaningfulValue(clearance.medicalPriority) && {
          label: "Priority",
          value: formatStatus(clearance.medicalPriority!),
        },
        hasMeaningfulValue(clearance.treatmentSummary) && {
          label: "Treatment",
          value: clearance.treatmentSummary!,
        },
        hasMeaningfulValue(clearance.restrictions) && {
          label: "Restrictions",
          value: clearance.restrictions!,
        },
        clearance.followUpDate && {
          label: "Follow-up",
          value: formatDate(clearance.followUpDate),
        },
        hasMeaningfulValue(clearance.veterinarianNotes) && {
          label: "Notes",
          value: clearance.veterinarianNotes!,
        },
      ].filter(Boolean) as { label: string; value: string }[]
    : [];

  return (
    <PageShell className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-5 min-w-0">
          <AnimalImage
            src={photoSrc}
            species={animal.species}
            alt={displayTitle}
            containerClassName="h-24 w-24 shrink-0 rounded-xl"
            sizes="96px"
          />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-graphite md:text-[28px]">
              {displayTitle}
            </h1>
            <p className="mt-1 text-sm text-graphite/60 capitalize">
              {formatStatus(animal.species)}
              {showTemporaryId ? ` · ${animal.temporaryId}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <StatusBadge status={animal.clearanceStatus} size="md" />
          <span className="inline-flex items-center rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-evergreen capitalize">
            {formatStatus(animal.pathwayStage)}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <InfoField label="Species" value={formatStatus(animal.species)} />
              <InfoField label="Age" value={displayOrUnknown(animal.estimatedAge)} />
              <InfoField label="Breed" value={displayOrUnknown(animal.breed)} />
              <InfoField label="Color" value={displayOrUnknown(animal.color)} />
              <InfoField label="Sex" value={displayOrUnknown(animal.sex)} />
              <InfoField
                label="Intake"
                value={animal.intakeDate ? formatDate(animal.intakeDate) : "Unknown"}
              />
            </CardContent>
          </Card>

          {rescueCase && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rescue History</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>
                  <Link
                    href={`/rescue-cases/${rescueCase.id}`}
                    className="text-evergreen hover:underline font-medium"
                  >
                    {rescueCase.caseNumber}
                  </Link>
                </p>
                <p className="text-graphite/70">{rescueCase.description}</p>
                <p className="text-xs text-graphite/50">
                  Reported {formatDateTime(rescueCase.createdAt)}
                </p>
              </CardContent>
            </Card>
          )}

          {shelter && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Intake Details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{shelter.name}</p>
                <p className="text-graphite/70 mt-1">{shelter.address}</p>
              </CardContent>
            </Card>
          )}

          {canMedical && clearance && medicalFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Medical Handoff & Clearance</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                {medicalFields.map((field) => (
                  <InfoField
                    key={field.label}
                    label={field.label}
                    value={field.value}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {!canMedical && (
            <Card>
              <CardContent className="p-4 text-sm text-graphite/70">
                Medical information is restricted to authorized staff and
                veterinarians.
              </CardContent>
            </Card>
          )}

          {behaviorNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Behavior Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {behaviorNotes.map((n) => (
                  <div key={n.id} className="text-sm border-b border-sage/20 pb-2 last:border-0">
                    <p>{n.content}</p>
                    <p className="text-xs text-graphite/50 mt-1">
                      {n.authorName} — {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {staffNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Staff Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {staffNotes.map((n) => (
                  <div key={n.id} className="text-sm border-b border-sage/20 pb-2 last:border-0">
                    <p>{n.content}</p>
                    <p className="text-xs text-graphite/50 mt-1">
                      {n.authorName} — {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {fieldNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Field / Rescue Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fieldNotes.map((n) => (
                  <div key={n.id} className="text-sm border-b border-sage/20 pb-2 last:border-0">
                    <p>{n.content}</p>
                    <p className="text-xs text-graphite/50 mt-1">
                      {n.authorName} — {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shelter Pathway</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="capitalize font-medium text-graphite">
                {formatStatus(animal.pathwayStage)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommended Next Action</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-graphite/80 leading-relaxed">
              {animal.recommendedNextAction ?? "No action specified"}
            </CardContent>
          </Card>

          {canEdit && (
            <MedicalClearanceForm
              animalId={id}
              clearanceStatus={animal.clearanceStatus as ClearanceStatus}
              clearance={clearance}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}
