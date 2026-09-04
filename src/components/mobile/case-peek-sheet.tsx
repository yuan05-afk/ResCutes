"use client";

import Link from "next/link";
import Image from "next/image";
import { AdminModal, ModalMeta } from "@/components/admin/AdminModal";
import { StatusBadge } from "@/components/status/status-badge";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { Button } from "@/components/ui/button";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { formatStatus } from "@/lib/utils";
import { useNavigationPending } from "@/components/layout/NavigationPending";

export interface CasePeekData {
  id: string;
  caseNumber: string;
  species: string;
  urgencyLevel: string;
  urgencyScore: number;
  status: string;
  description: string;
  photoUrl?: string;
}

interface CasePeekSheetProps {
  caseItem: CasePeekData | null;
  onClose: () => void;
}

export function CasePeekSheet({ caseItem, onClose }: CasePeekSheetProps) {
  const { startPending } = useNavigationPending();

  if (!caseItem) return null;

  const href = `/mobile/cases/${caseItem.id}`;
  const imageUrl = getCasePhotoUrl(
    caseItem.species,
    caseItem.photoUrl,
    caseItem.id,
  );

  return (
    <AdminModal
      open={Boolean(caseItem)}
      onClose={onClose}
      title={caseItem.caseNumber}
      description={`${formatStatus(caseItem.species)} nearby`}
      headerExtra={
        <>
          <StatusBadge status={caseItem.status} size="sm" />
          {caseItem.urgencyScore > 0 ? (
            <UrgencyBadge
              level={caseItem.urgencyLevel}
              score={caseItem.urgencyScore}
            />
          ) : null}
        </>
      }
      size="md"
      placement="sheet"
      fitViewport={false}
      footer={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" asChild className="flex-1">
            <Link
              href={href}
              prefetch
              onClick={() => {
                startPending(href);
                onClose();
              }}
            >
              Open case
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-3">
        <div className="relative aspect-square max-h-[140px] overflow-hidden rounded-xl border border-sage/20 bg-sage/10">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            unoptimized
            sizes="140px"
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-2">
          <ModalMeta label="Status" value={formatStatus(caseItem.status)} />
          <p className="line-clamp-3 text-sm leading-relaxed text-graphite/75">
            {caseItem.description}
          </p>
        </div>
      </div>
    </AdminModal>
  );
}
