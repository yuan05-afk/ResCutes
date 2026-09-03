"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useActionPending } from "@/components/shared/useActionPending";
import { reviewAdoptionApplicationAction } from "@/app/actions/adoption";
import { toast } from "@/components/ui/toast";

interface AdoptionReviewActionsProps {
  applicationId: string;
  applicantName: string;
  animalLabel: string;
  status: string;
}

export function AdoptionReviewActions({
  applicationId,
  applicantName,
  animalLabel,
  status,
}: AdoptionReviewActionsProps) {
  const { pending, error, setError, run } = useActionPending();
  const [notes, setNotes] = useState("");
  const [confirm, setConfirm] = useState<"approved" | "rejected" | null>(null);

  if (status !== "pending" && status !== "under_review") {
    return (
      <span className="text-xs text-graphite/45">No actions</span>
    );
  }

  async function handleConfirm() {
    if (!confirm) return;
    const decision = confirm;
    const ok = await run(
      () => reviewAdoptionApplicationAction(applicationId, decision, notes),
      {
        rewarm: ["/adoption", "/animals"],
        onSuccess: () => {
          toast(
            decision === "approved"
              ? `Approved adoption for ${animalLabel}`
              : `Rejected application from ${applicantName}`,
            decision === "approved" ? "success" : "info",
          );
          setConfirm(null);
          setNotes("");
        },
      },
    );
    if (!ok) return;
  }

  return (
    <div className="space-y-2">
      {error ? <p className="text-xs text-rescue">{error}</p> : null}
      <Textarea
        placeholder="Review notes (optional)..."
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[3.5rem] resize-none text-xs"
      />
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          disabled={pending}
          onClick={() => {
            setError(null);
            setConfirm("approved");
          }}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() => {
            setError(null);
            setConfirm("rejected");
          }}
        >
          Reject
        </Button>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm === "approved" ? "Approve adoption?" : "Reject application?"
        }
        description={
          confirm === "approved"
            ? `Approve ${applicantName} for ${animalLabel}. The animal pathway will move to transferred.`
            : `Reject the application from ${applicantName} for ${animalLabel}.`
        }
        confirmLabel={confirm === "approved" ? "Approve" : "Reject"}
        variant={confirm === "rejected" ? "destructive" : "default"}
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
