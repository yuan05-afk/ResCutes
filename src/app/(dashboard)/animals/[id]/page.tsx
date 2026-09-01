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
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import { formatDate, formatDateTime, formatStatus } from "@/lib/utils";
import { MedicalClearanceForm } from "./medical-form";

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

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-start gap-6">
        {animal.photoUrl && (
          <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-sage/20 shrink-0">
            <Image
              src={animal.photoUrl}
              alt={animal.name ?? "Animal"}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-evergreen">
            {animal.name ?? animal.temporaryId}
          </h1>
          <p className="text-sm text-graphite/70">{animal.temporaryId}</p>
          <div className="flex gap-2 mt-2">
            <StatusBadge status={animal.clearanceStatus} />
            <span className="text-xs rounded-full bg-sage/20 px-2 py-0.5 text-evergreen capitalize">
              {formatStatus(animal.pathwayStage)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <p><span className="text-graphite/60">Species:</span> {formatStatus(animal.species)}</p>
              <p><span className="text-graphite/60">Age:</span> {animal.estimatedAge ?? "—"}</p>
              <p><span className="text-graphite/60">Breed:</span> {animal.breed ?? "—"}</p>
              <p><span className="text-graphite/60">Color:</span> {animal.color ?? "—"}</p>
              <p><span className="text-graphite/60">Sex:</span> {animal.sex ?? "—"}</p>
              <p><span className="text-graphite/60">Intake:</span> {formatDate(animal.intakeDate)}</p>
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
                    className="text-evergreen hover:underline"
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
                <p className="text-graphite/70">{shelter.address}</p>
              </CardContent>
            </Card>
          )}

          {canMedical && clearance && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Medical Handoff & Clearance</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><span className="text-graphite/60">Examination:</span> {formatDate(clearance.examinationDate)}</p>
                <p><span className="text-graphite/60">Veterinarian:</span> {clearance.veterinarianName ?? "—"}</p>
                <p><span className="text-graphite/60">Condition:</span> {clearance.generalCondition ?? "—"}</p>
                <p><span className="text-graphite/60">Priority:</span> {clearance.medicalPriority ? formatStatus(clearance.medicalPriority) : "—"}</p>
                <p><span className="text-graphite/60">Treatment:</span> {clearance.treatmentSummary ?? "—"}</p>
                <p><span className="text-graphite/60">Restrictions:</span> {clearance.restrictions ?? "—"}</p>
                <p><span className="text-graphite/60">Follow-up:</span> {formatDate(clearance.followUpDate)}</p>
                <p><span className="text-graphite/60">Notes:</span> {clearance.veterinarianNotes ?? "—"}</p>
              </CardContent>
            </Card>
          )}

          {!canMedical && (
            <Card>
              <CardContent className="p-4 text-sm text-graphite/70">
                Medical information is restricted to authorized staff and veterinarians.
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
                  <div key={n.id} className="text-sm border-b border-sage/20 pb-2">
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
                  <div key={n.id} className="text-sm border-b border-sage/20 pb-2">
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
                  <div key={n.id} className="text-sm border-b border-sage/20 pb-2">
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shelter Pathway</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="capitalize font-medium">{formatStatus(animal.pathwayStage)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommended Next Action</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-graphite/80">
              {animal.recommendedNextAction ?? "No action specified"}
            </CardContent>
          </Card>

          {canEdit && (
            <MedicalClearanceForm
              animalId={id}
              clearance={clearance}
            />
          )}
        </div>
      </div>
    </div>
  );
}
