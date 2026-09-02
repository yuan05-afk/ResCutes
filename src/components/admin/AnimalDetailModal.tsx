"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminModal,
  ModalMeta,
  ModalSection,
  ModalTabs,
} from "@/components/admin/AdminModal";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import { AnimalImage } from "@/components/ui/animal-image";
import { fetchAnimalModalData } from "@/app/actions/modal-data";
import { formatDate, formatDateTime, formatStatus } from "@/lib/utils";
import { getCasePhotoUrl } from "@/lib/demo-images";

interface AnimalDetailModalProps {
  animalId: string | null;
  onClose: () => void;
}

type AnimalTab = "overview" | "notes";

export function AnimalDetailModal({ animalId, onClose }: AnimalDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<AnimalTab>("overview");
  const [payload, setPayload] = useState<Awaited<
    ReturnType<typeof fetchAnimalModalData>
  > | null>(null);

  useEffect(() => {
    if (!animalId) {
      setPayload(null);
      return;
    }
    setTab("overview");
    let alive = true;
    setLoading(true);
    void fetchAnimalModalData(animalId).then((res) => {
      if (!alive) return;
      setPayload(res);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [animalId]);

  const data = payload && "data" in payload ? payload.data : null;
  const animal = data?.animal;
  const hasNotes = Boolean(data?.notes.length);

  return (
    <AdminModal
      open={Boolean(animalId)}
      onClose={onClose}
      title={animal?.name ?? animal?.temporaryId ?? "Animal record"}
      description={
        animal
          ? `${formatStatus(animal.species)} · ${formatStatus(animal.pathwayStage)}`
          : loading
            ? "Loading animal..."
            : undefined
      }
      headerExtra={
        animal ? (
          <>
            <StatusBadge status={animal.clearanceStatus} size="sm" />
            <span className="inline-flex items-center rounded-full bg-sage/20 px-2.5 py-0.5 text-[11px] font-medium text-evergreen capitalize">
              {formatStatus(animal.pathwayStage)}
            </span>
          </>
        ) : null
      }
      size="lg"
      placement="center"
      footer={
        animalId ? (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" asChild>
              <Link href={`/animals/${animalId}`}>Open full record</Link>
            </Button>
          </div>
        ) : null
      }
    >
      {loading && !data ? (
        <div className="h-[140px] animate-pulse rounded-xl bg-sage/15" />
      ) : null}

      {data && animal ? (
        <div className="flex h-full min-h-0 flex-col gap-2">
          {hasNotes ? (
            <ModalTabs
              tabs={[
                { id: "overview", label: "Overview" },
                { id: "notes", label: `Notes (${data.notes.length})` },
              ]}
              active={tab}
              onChange={(id) => setTab(id as AnimalTab)}
            />
          ) : null}

          {tab === "overview" || !hasNotes ? (
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
              <div className="grid shrink-0 grid-cols-1 gap-2 overflow-hidden rounded-xl border border-sage/20 bg-bone/30 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <AnimalImage
                  src={getCasePhotoUrl(
                    animal.species,
                    animal.photoUrl,
                    animal.rescueCaseId,
                  )}
                  species={animal.species}
                  alt={animal.name ?? animal.temporaryId}
                  containerClassName="relative h-[130px] w-full sm:h-[140px]"
                  sizes="(max-width: 640px) 100vw, 280px"
                />
                <div className="flex flex-col justify-center border-t border-sage/15 px-3 py-2 sm:border-l sm:border-t-0">
                  <p className="text-base font-bold text-graphite">
                    {animal.name ?? "Unnamed"}
                  </p>
                  <p className="text-xs text-graphite/50">{animal.temporaryId}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-graphite/65">
                    {animal.recommendedNextAction ?? "No next action specified"}
                  </p>
                </div>
              </div>

              <div className="grid shrink-0 grid-cols-1 gap-1.5 sm:grid-cols-3">
                <ModalMeta label="Species" value={formatStatus(animal.species)} />
                <ModalMeta
                  label="Intake"
                  value={animal.intakeDate ? formatDate(animal.intakeDate) : "—"}
                />
                <ModalMeta
                  label="Stage"
                  value={formatStatus(animal.pathwayStage)}
                />
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                {data.rescueCase ? (
                  <ModalSection title="Linked case">
                    <div className="rounded-lg border border-sage/20 bg-bone/50 px-2.5 py-2 text-xs">
                      <p className="font-semibold text-evergreen">
                        {data.rescueCase.caseNumber}
                      </p>
                      <p className="mt-1 line-clamp-3 leading-relaxed text-graphite/70">
                        {data.rescueCase.description}
                      </p>
                    </div>
                  </ModalSection>
                ) : null}

                {data.canMedical && data.clearance ? (
                  <ModalSection title="Medical">
                    <div className="space-y-1.5">
                      {data.clearance.generalCondition ? (
                        <ModalMeta
                          label="Condition"
                          value={data.clearance.generalCondition}
                        />
                      ) : null}
                      {data.clearance.treatmentSummary ? (
                        <ModalMeta
                          label="Treatment"
                          value={data.clearance.treatmentSummary}
                        />
                      ) : null}
                    </div>
                  </ModalSection>
                ) : null}
              </div>

              {hasNotes ? (
                <p className="shrink-0 text-center text-[11px] text-graphite/45">
                  <button
                    type="button"
                    className="font-semibold text-evergreen hover:underline"
                    onClick={() => setTab("notes")}
                  >
                    View {data.notes.length} staff notes
                  </button>
                </p>
              ) : null}
            </div>
          ) : (
            <ModalSection title="Recent notes" className="min-h-0 flex-1">
              <ul className="space-y-1.5">
                {data.notes.slice(0, 4).map((n) => (
                  <li
                    key={n.id}
                    className="rounded-lg border border-sage/15 bg-bone/60 px-2.5 py-2 text-xs"
                  >
                    <p className="line-clamp-3 leading-relaxed text-graphite">
                      {n.content}
                    </p>
                    <p className="mt-1 text-[10px] text-graphite/45">
                      {n.authorName} — {formatDateTime(n.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </ModalSection>
          )}
        </div>
      ) : null}

      {payload && "error" in payload ? (
        <p className="text-sm text-rescue">Could not load animal details.</p>
      ) : null}
    </AdminModal>
  );
}
