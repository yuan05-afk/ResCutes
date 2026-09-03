"use client";

import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { AnimalImage } from "@/components/ui/animal-image";
import { MedicalClearanceForm } from "@/app/(dashboard)/animals/[id]/medical-form";
import { AnimalProfileEditor } from "@/components/animals/animal-profile-editor";
import { StatusBadge } from "@/components/status/status-badge";
import {
  formatDate,
  formatDateTime,
  formatStatus,
  hasMeaningfulValue,
  cn,
} from "@/lib/utils";
import type { ClearanceStatus } from "@/lib/data/types";
import type { ReactNode } from "react";

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
    bio?: string | null;
    temperament?: string | null;
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
  canManageProfile?: boolean;
}

function displayOrDash(value?: string | null) {
  return value?.trim() ? value : "—";
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-sage/25 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-graphite">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm text-graphite">{value}</dd>
    </div>
  );
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
  canManageProfile = false,
}: AnimalDetailViewProps) {
  const displayTitle = animal.name ?? animal.temporaryId;
  const recentNotes = notes.slice(0, 3);
  const showAside = canEdit || canMedical || canManageProfile;

  const medicalFields = clearance
    ? (
        [
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
        ] as ({ label: string; value: string } | false | undefined | "")[]
      ).filter(Boolean) as { label: string; value: string }[]
    : [];

  return (
    <div
      className={cn(
        "grid gap-4",
        showAside
          ? "xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]"
          : "grid-cols-1",
      )}
    >
      <div className="space-y-4">
        {/* Hero identity — single source of truth */}
        <section className="overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card">
          <div className="grid sm:grid-cols-[220px_1fr]">
            <AnimalImage
              src={photoSrc}
              species={animal.species}
              alt={displayTitle}
              containerClassName="relative aspect-[4/3] w-full sm:aspect-auto sm:min-h-[220px]"
              sizes="(max-width: 640px) 100vw, 220px"
              objectPosition="center top"
              expandable
              lightboxCaption={`${animal.temporaryId} · ${formatStatus(animal.species)}`}
            />
            <div className="flex flex-col justify-between gap-3 p-4 sm:p-5">
              <div>
                <Link
                  href="/animals"
                  className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-graphite/50 transition hover:text-evergreen"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  All animals
                </Link>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold tracking-tight text-graphite sm:text-2xl">
                      {displayTitle}
                    </h2>
                    <p className="mt-0.5 text-sm text-graphite/55">
                      {animal.temporaryId} · {formatStatus(animal.species)}
                      {animal.breed ? ` · ${animal.breed}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge status={animal.clearanceStatus} size="sm" />
                    <StatusBadge status={animal.pathwayStage} size="sm" />
                  </div>
                </div>
                {animal.temperament ? (
                  <p className="mt-3 text-sm leading-relaxed text-graphite/70">
                    {animal.temperament}
                  </p>
                ) : null}
                {animal.recommendedNextAction ? (
                  <p className="mt-2 rounded-lg bg-evergreen/5 px-3 py-2 text-xs font-medium text-evergreen">
                    Next: {animal.recommendedNextAction}
                  </p>
                ) : null}
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-sage/15 pt-3 sm:grid-cols-4">
                <Fact label="Sex" value={displayOrDash(animal.sex)} />
                <Fact label="Age" value={displayOrDash(animal.estimatedAge)} />
                <Fact label="Color" value={displayOrDash(animal.color)} />
                <Fact
                  label="Intake"
                  value={
                    animal.intakeDate ? formatDate(animal.intakeDate) : "—"
                  }
                />
              </dl>
            </div>
          </div>
        </section>

        {animal.bio ? (
          <Section title="Story">
            <p className="text-sm leading-relaxed text-graphite/75">
              {animal.bio}
            </p>
          </Section>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {rescueCase ? (
            <Section
              title="Rescue case"
              action={
                <Link
                  href={`/rescue-cases/${rescueCase.id}`}
                  className="text-xs font-semibold text-evergreen hover:underline"
                >
                  Open
                </Link>
              }
            >
              <p className="text-sm font-semibold text-graphite">
                {rescueCase.caseNumber}
              </p>
              <p className="mt-1.5 text-[11px] text-graphite/45">
                Reported {formatDateTime(rescueCase.createdAt)}
              </p>
            </Section>
          ) : (
            <Section title="Rescue case">
              <p className="text-sm text-graphite/50">
                No linked rescue case yet.
              </p>
            </Section>
          )}

          {shelter ? (
            <Section title="Intake shelter">
              <p className="text-sm font-semibold text-graphite">{shelter.name}</p>
              <p className="mt-1.5 flex items-start gap-1.5 text-sm leading-relaxed text-graphite/65">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {shelter.address}
              </p>
            </Section>
          ) : (
            <Section title="Intake shelter">
              <p className="text-sm text-graphite/50">No shelter on file.</p>
            </Section>
          )}
        </div>

        {canMedical && medicalFields.length > 0 ? (
          <Section title="Medical summary">
            <dl className="grid gap-3 sm:grid-cols-2">
              {medicalFields.map((field) => (
                <div key={field.label}>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
                    {field.label}
                  </dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-graphite">
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Section>
        ) : null}

        {recentNotes.length > 0 ? (
          <Section title="Recent notes">
            <ul className="space-y-2">
              {recentNotes.map((n) => (
                <li
                  key={n.id}
                  className="rounded-lg border border-sage/15 bg-bone/40 px-3 py-2"
                >
                  <p className="text-sm leading-relaxed text-graphite">
                    {n.content}
                  </p>
                  <p className="mt-1 text-[11px] text-graphite/45">
                    {n.authorName} · {formatStatus(n.noteType)} ·{" "}
                    {formatDateTime(n.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {!canMedical ? (
          <p className="rounded-xl border border-sage/20 bg-bone/50 px-4 py-3 text-sm text-graphite/60">
            Medical details are limited to authorized staff and veterinarians.
          </p>
        ) : null}
      </div>

      {showAside ? (
        <aside className="space-y-4 xl:sticky xl:top-3 xl:self-start">
          {canManageProfile ? (
            <AnimalProfileEditor
              animal={{
                id: animal.id,
                name: animal.name,
                temporaryId: animal.temporaryId,
                bio: animal.bio,
                temperament: animal.temperament,
                pathwayStage: animal.pathwayStage,
                sex: animal.sex,
                estimatedAge: animal.estimatedAge,
                breed: animal.breed,
                color: animal.color,
              }}
            />
          ) : null}

          {canEdit ? (
            <div className="overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card">
              <MedicalClearanceForm
                variant="panel"
                animalId={animal.id}
                clearanceStatus={animal.clearanceStatus as ClearanceStatus}
                clearance={clearance ?? undefined}
              />
            </div>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
