"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AnimalImage } from "@/components/ui/animal-image";
import { StatusBadge } from "@/components/status/status-badge";
import { useActionPending } from "@/components/shared/useActionPending";
import { setAnimalAdoptionListingAction } from "@/app/actions/adoption";
import { toast } from "@/components/ui/toast";
import { formatStatus } from "@/lib/utils";
import type { AnimalRecord } from "@/lib/data/types";
import { getCasePhotoUrl } from "@/lib/demo-images";

interface AdoptionAnimalCardProps {
  animal: AnimalRecord;
  canApply: boolean;
  canManage?: boolean;
  onApply: (animal: AnimalRecord) => void;
}

export function AdoptionAnimalCard({
  animal,
  canApply,
  canManage = false,
  onApply,
}: AdoptionAnimalCardProps) {
  const router = useRouter();
  const { pending, run } = useActionPending();
  const title = animal.name ?? animal.temporaryId;
  const photoSrc = getCasePhotoUrl(
    animal.species,
    animal.photoUrl,
    animal.rescueCaseId,
  );
  const isListed =
    animal.pathwayStage === "ready_for_adoption" ||
    animal.pathwayStage === "ready_for_foster";

  async function toggleListing() {
    await run(() => setAnimalAdoptionListingAction(animal.id, !isListed), {
      rewarm: ["/adoption", "/animals", `/animals/${animal.id}`],
      onSuccess: () => {
        toast(isListed ? "Removed from adoption listing" : "Published to adoption listing");
        router.refresh();
      },
    });
  }

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
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
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
          {canManage && isListed ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled={pending}
              onClick={() => void toggleListing()}
            >
              {pending ? "Updating..." : "Unpublish"}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
