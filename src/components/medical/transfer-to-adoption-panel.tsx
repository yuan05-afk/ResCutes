"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, HeartHandshake, Home } from "lucide-react";
import { transferAnimalToAdoptionAction } from "@/app/actions/adoption";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useActionPending } from "@/components/shared/useActionPending";
import { toast } from "@/components/ui/toast";
import { formatStatus } from "@/lib/utils";

type Destination = "ready_for_adoption" | "ready_for_foster";

interface TransferToAdoptionPanelProps {
  animalId: string;
  animalLabel: string;
  pathwayStage: string;
  canTransfer: boolean;
}

export function TransferToAdoptionPanel({
  animalId,
  animalLabel,
  pathwayStage,
  canTransfer,
}: TransferToAdoptionPanelProps) {
  const { pending, error, setError, run } = useActionPending();
  const [confirmTarget, setConfirmTarget] = useState<Destination | null>(null);

  const alreadyAdoption = pathwayStage === "ready_for_adoption";
  const alreadyFoster = pathwayStage === "ready_for_foster";
  const alreadyListed = alreadyAdoption || alreadyFoster;

  async function confirmTransfer() {
    if (!confirmTarget) return;
    const destination = confirmTarget;
    const label =
      destination === "ready_for_foster" ? "foster ready" : "adoption ready";

    const ok = await run(
      () => transferAnimalToAdoptionAction(animalId, destination),
      {
        rewarm: ["/medical", "/adoption", "/mobile/adoption"],
        onSuccess: () => {
          setConfirmTarget(null);
          toast(`${animalLabel} transferred to ${label}`, "success");
        },
      },
    );

    if (!ok) return;
  }

  if (alreadyListed) {
    return (
      <div className="mt-3 rounded-lg border border-evergreen/25 bg-evergreen/5 p-3">
        <p className="text-sm font-medium text-evergreen">
          Listed as {formatStatus(pathwayStage)}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-graphite/60">
          This animal left the medical queue and is available for families.
        </p>
        <Button size="sm" className="mt-2.5" asChild>
          <Link href="/adoption">
            Open adoption queue
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    );
  }

  if (!canTransfer) {
    return (
      <p className="mt-3 text-[11px] leading-relaxed text-graphite/45">
        Shelter staff can transfer this animal to Adoption ready from this panel.
      </p>
    );
  }

  return (
    <>
      <div className="mt-3 rounded-lg border border-sage/30 bg-bone/40 p-3">
        <p className="text-sm font-semibold text-graphite">
          Transfer to adoption
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-graphite/60">
          Marks {animalLabel} as Adoption ready and lists it for families on web
          and mobile. Use Foster ready if the animal needs a temporary home
          first.
        </p>
        {error ? (
          <p className="mt-2 text-xs text-rescue" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() => {
              setError(null);
              setConfirmTarget("ready_for_adoption");
            }}
          >
            <HeartHandshake className="mr-1.5 h-3.5 w-3.5" />
            Transfer to adoption
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => {
              setError(null);
              setConfirmTarget("ready_for_foster");
            }}
          >
            <Home className="mr-1.5 h-3.5 w-3.5" />
            Foster ready
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmTarget !== null}
        title={
          confirmTarget === "ready_for_foster"
            ? `Mark ${animalLabel} foster ready?`
            : `Transfer ${animalLabel} to adoption?`
        }
        description={
          confirmTarget === "ready_for_foster"
            ? "Sets pathway to Foster ready. The animal leaves the medical queue and can be placed with a foster home."
            : "Sets pathway to Adoption ready. The animal leaves the medical queue and appears in the adoption listing for families."
        }
        confirmLabel={
          confirmTarget === "ready_for_foster"
            ? "Mark foster ready"
            : "Transfer to adoption"
        }
        pending={pending}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => confirmTransfer()}
      />
    </>
  );
}
