"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimalImage } from "@/components/ui/animal-image";
import { StatusBadge } from "@/components/status/status-badge";
import { formatStatus } from "@/lib/utils";
import type { AnimalRecord } from "@/lib/data/types";
import { getCasePhotoUrl } from "@/lib/demo-images";

interface AdoptionAnimalCardProps {
  animal: AnimalRecord;
  canApply: boolean;
  onApply: (animal: AnimalRecord) => void;
}

export function AdoptionAnimalCard({
  animal,
  canApply,
  onApply,
}: AdoptionAnimalCardProps) {
  const title = animal.name ?? animal.temporaryId;
  const photoSrc = getCasePhotoUrl(
    animal.species,
    animal.photoUrl,
    animal.rescueCaseId,
  );

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card transition hover:border-sage/40 hover:shadow-card-hover">
      <AnimalImage
        src={photoSrc}
        species={animal.species}
        alt={title}
        containerClassName="relative aspect-[4/3] w-full"
        sizes="(max-width: 768px) 100vw, 280px"
        objectPosition="center top"
        expandable
        lightboxCaption={`${formatStatus(animal.species)} · ${formatStatus(animal.estimatedAge ?? "unknown")}`}
      />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-graphite">{title}</h3>
            <p className="text-[11px] text-graphite/50">
              {formatStatus(animal.species)} ·{" "}
              {formatStatus(animal.estimatedAge ?? "unknown")}
            </p>
          </div>
          <StatusBadge status={animal.pathwayStage} size="sm" />
        </div>
        {animal.temperament ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-graphite/65">
            {animal.temperament}
          </p>
        ) : animal.bio ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-graphite/65">
            {animal.bio}
          </p>
        ) : (
          <p className="text-xs text-graphite/45">No temperament notes yet.</p>
        )}
        <div className="mt-auto flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/animals/${animal.id}`}>View</Link>
          </Button>
          {canApply ? (
            <Button size="sm" className="flex-1" onClick={() => onApply(animal)}>
              {animal.pathwayStage === "ready_for_foster"
                ? "Apply to foster"
                : "Apply to adopt"}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
