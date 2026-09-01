import Link from "next/link";
import Image from "next/image";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { formatStatus } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface AttentionQueueItemProps {
  id: string;
  caseNumber: string;
  species: string;
  urgencyLevel: string;
  urgencyScore: number;
  description: string;
  photoUrl?: string;
  animalName?: string;
}

export function AttentionQueueItem({
  id,
  caseNumber,
  species,
  urgencyLevel,
  urgencyScore,
  description,
  photoUrl,
  animalName,
}: AttentionQueueItemProps) {
  const imageUrl = getCasePhotoUrl(species, photoUrl, id);

  return (
    <Link
      href={`/rescue-cases/${id}`}
      className="flex gap-3 rounded-xl border border-sage/20 bg-white p-3 transition-all hover:border-evergreen/30 hover:shadow-card"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sage/20">
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
          unoptimized
          sizes="56px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-graphite text-sm">
              {animalName ?? formatStatus(species)}
            </p>
            <p className="text-xs text-graphite/50">{caseNumber}</p>
          </div>
          <UrgencyBadge level={urgencyLevel} score={urgencyScore} />
        </div>
        <p className="mt-1.5 text-xs text-graphite/65 line-clamp-2">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-graphite/30 self-center" aria-hidden />
    </Link>
  );
}
