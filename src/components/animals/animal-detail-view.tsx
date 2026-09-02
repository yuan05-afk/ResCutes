"use client";

import Link from "next/link";
import { ModalMeta, ModalSection } from "@/components/admin/AdminModal";
import { AnimalImage } from "@/components/ui/animal-image";
import { MedicalClearanceForm } from "@/app/(dashboard)/animals/[id]/medical-form";
import {
  formatDate,
  formatDateTime,
  formatStatus,
  hasMeaningfulValue,
} from "@/lib/utils";
import type { ClearanceStatus } from "@/lib/data/service";
import { cn } from "@/lib/utils";

interface NoteEntry {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  noteType: string;
}

interface AnimalDetailViewProps {
  animal: {
    id: string;
    name?: string | null;
    temporaryId: string;
    species: string;
    estimatedAge?: string | null;
    breed?: string | null;
    color?: string | null;
    sex?: string | null;
    intakeDate?: string | null;
    pathwayStage: string;
    recommendedNextAction?: string | null;
    clearanceStatus: string;
    photoUrl?: string | null;
    rescueCaseId?: string | null;
  };
  photoSrc: string;
  rescueCase?: {
    id: string;
    caseNumber: string;
    description: string;
    createdAt: string;
  } | null;
  shelter?: { name: string; address: string } | null;
  clearance?: {
    examinationDate?: string;
    veterinarianName?: string;
    generalCondition?: string;
    medicalPriority?: string;
    treatmentSummary?: string;
    restrictions?: string;
    followUpDate?: string;
    veterinarianNotes?: string;
    clearanceStatus: string;
  } | null;
  notes: NoteEntry[];
  canMedical: boolean;
  canEdit: boolean;
}

function displayOrUnknown(value?: string | null) {
  return value?.trim() ? value : "Unknown";
}

export function AnimalDetailView({
  animal,
  photoSrc,
  rescueCase,
  shelter,
  clearance,
  notes,
  canMedical,
  canEdit,
}: AnimalDetailViewProps) {
  const displayTitle = animal.name ?? animal.temporaryId;
  const recentNotes = notes.slice(0, 2);

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
      ].filter(Boolean) as { label: string; value: string }[]
    : [];

  return (
    <div
      className={cn(
        "grid h-full min-h-0 gap-3",
        canEdit || canMedical
          ? "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]"
          : "grid-cols-1",
      )}
    >
      <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
        <div className="grid shrink-0 grid-cols-1 gap-2 overflow-hidden rounded-xl border border-sage/20 bg-white shadow-card sm:grid-cols-[140px_1fr]">
          <AnimalImage
            src={photoSrc}
            species={animal.species}
            alt={displayTitle}
            containerClassName="relative h-[120px] w-full sm:h-full sm:min-h-[120px]"
            sizes="140px"
          />
          <div className="flex flex-col justify-center border-t border-sage/15 px-3 py-2 sm:border-l sm:border-t-0">
            <p className="text-lg font-bold text-graphite">{displayTitle}</p>
            <p className="text-xs text-graphite/55">{animal.temporaryId}</p>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-graphite/65">
              {animal.recommendedNextAction ?? "No next action specified"}
            </p>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-3">
          <ModalMeta label="Species" value={formatStatus(animal.species)} />
          <ModalMeta label="Breed" value={displayOrUnknown(animal.breed)} />
          <ModalMeta label="Sex" value={displayOrUnknown(animal.sex)} />
          <ModalMeta label="Age" value={displayOrUnknown(animal.estimatedAge)} />
          <ModalMeta label="Color" value={displayOrUnknown(animal.color)} />
          <ModalMeta
            label="Intake"
            value={animal.intakeDate ? formatDate(animal.intakeDate) : "Unknown"}
          />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
          {rescueCase ? (
            <ModalSection title="Rescue case">
              <div className="rounded-lg border border-sage/20 bg-bone/50 px-2.5 py-2 text-xs">
                <Link
                  href={`/rescue-cases/${rescueCase.id}`}
                  className="font-semibold text-evergreen hover:underline"
                >
                  {rescueCase.caseNumber}
                </Link>
                <p className="mt-1 line-clamp-3 leading-relaxed text-graphite/70">
                  {rescueCase.description}
                </p>
                <p className="mt-1 text-[10px] text-graphite/45">
                  {formatDateTime(rescueCase.createdAt)}
                </p>
              </div>
            </ModalSection>
          ) : null}

          {shelter ? (
            <ModalSection title="Intake shelter">
              <div className="rounded-lg border border-sage/20 bg-bone/50 px-2.5 py-2 text-xs">
                <p className="font-semibold text-graphite">{shelter.name}</p>
                <p className="mt-1 line-clamp-2 text-graphite/65">{shelter.address}</p>
              </div>
            </ModalSection>
          ) : null}

          {canMedical && medicalFields.length > 0 ? (
            <ModalSection
              title="Medical summary"
              className={cn(!rescueCase || !shelter ? "" : "sm:col-span-2")}
            >
              <div className="grid grid-cols-2 gap-1.5">
                {medicalFields.slice(0, 4).map((field) => (
                  <ModalMeta key={field.label} label={field.label} value={field.value} />
                ))}
              </div>
            </ModalSection>
          ) : null}
        </div>

        {recentNotes.length > 0 ? (
          <ModalSection title="Recent notes" className="shrink-0">
            <ul className="space-y-1">
              {recentNotes.map((n) => (
                <li
                  key={n.id}
                  className="rounded-lg bg-bone/60 px-2.5 py-1.5 text-[11px]"
                >
                  <p className="line-clamp-2 text-graphite">{n.content}</p>
                  <p className="mt-0.5 text-[10px] text-graphite/45">
                    {n.authorName} · {formatStatus(n.noteType)}
                  </p>
                </li>
              ))}
            </ul>
          </ModalSection>
        ) : null}

        {!canMedical ? (
          <p className="shrink-0 rounded-lg border border-sage/20 bg-bone/40 px-3 py-2 text-xs text-graphite/60">
            Medical information is restricted to authorized staff and veterinarians.
          </p>
        ) : null}
      </div>

      {(canEdit || canMedical) && (
        <aside className="flex min-h-0 flex-col gap-2 overflow-hidden">
          <div className="grid shrink-0 grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
            <ModalMeta
              label="Shelter pathway"
              value={formatStatus(animal.pathwayStage)}
            />
            <ModalMeta
              label="Clearance status"
              value={formatStatus(animal.clearanceStatus)}
            />
          </div>

          {canEdit ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-sage/25 bg-gradient-to-b from-bone/80 to-white shadow-card">
              <MedicalClearanceForm
                variant="panel"
                animalId={animal.id}
                clearanceStatus={animal.clearanceStatus as ClearanceStatus}
                clearance={clearance ?? undefined}
              />
            </div>
          ) : null}
        </aside>
      )}
    </div>
  );
}
