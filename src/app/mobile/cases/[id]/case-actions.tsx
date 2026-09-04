"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { useActionPending } from "@/components/shared/useActionPending";
import {
  acceptAssignmentAction,
  declineAssignmentAction,
  updateCaseStatusAction,
} from "@/app/actions/case";
import {
  isAnimalSecuredStatus,
  isAtShelterStatus,
  isWithRescuerStatus,
} from "@/lib/rescue-stages";

interface CaseActionsClientProps {
  assignmentId: string;
  caseId: string;
  assignmentStatus: string;
  caseStatus: string;
}

type ActionResult = { error?: string; success?: boolean } | void;

export function CaseActionsClient({
  assignmentId,
  caseId,
  assignmentStatus,
  caseStatus,
}: CaseActionsClientProps) {
  const { pending: loading, error: actionError, setError: setActionError, run } =
    useActionPending();
  const [declineReason, setDeclineReason] = useState("");
  const [showDecline, setShowDecline] = useState(false);

  async function runAction(fn: () => Promise<ActionResult>) {
    setActionError(null);
    await run(fn, {
      rewarm: [`/mobile/cases/${caseId}`, "/mobile/cases", "/mobile"],
    });
  }

  const canMarkSecured =
    assignmentStatus === "accepted" && isWithRescuerStatus(caseStatus);
  const waitingForStaff =
    assignmentStatus === "accepted" && isAnimalSecuredStatus(caseStatus);
  const handoffDone =
    assignmentStatus === "completed" ||
    isAtShelterStatus(caseStatus) ||
    caseStatus === "completed";

  return (
    <div className="space-y-3">
      {actionError && (
        <p className="text-sm text-rescue rounded-lg border border-rescue/20 bg-rescue/5 px-3 py-2">
          {actionError}
        </p>
      )}

      {assignmentStatus === "pending" && (
        <div className="flex gap-2">
          <Button
            onClick={() => runAction(() => acceptAssignmentAction(assignmentId))}
            disabled={loading}
            className="flex-1"
          >
            Accept Assignment
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDecline(!showDecline)}
            disabled={loading}
          >
            Decline
          </Button>
        </div>
      )}

      {showDecline && assignmentStatus === "pending" && (
        <div className="space-y-2">
          <Textarea
            placeholder="Reason for declining..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
          <Button
            variant="destructive"
            onClick={() => {
              if (!declineReason.trim()) {
                setActionError("Reason required");
                return;
              }
              runAction(() =>
                declineAssignmentAction(assignmentId, declineReason),
              );
            }}
            disabled={loading}
          >
            Confirm Decline
          </Button>
        </div>
      )}

      {canMarkSecured && (
        <Button
          onClick={() =>
            runAction(() => updateCaseStatusAction(caseId, "animal_secured"))
          }
          disabled={loading}
          className="w-full"
        >
          {loading ? "Updating..." : "Mark Animal Secured"}
        </Button>
      )}

      {waitingForStaff && (
        <div
          className="rounded-xl border border-evergreen/25 bg-evergreen/5 p-4"
          role="status"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="h-5 w-5 shrink-0 text-evergreen mt-0.5"
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold text-evergreen">
                Animal secured
              </p>
              <p className="mt-1 text-xs text-graphite/65 leading-relaxed">
                Shelter staff will confirm the destination and complete handoff.
              </p>
            </div>
          </div>
        </div>
      )}

      {handoffDone && (
        <div
          className="rounded-xl border border-evergreen/25 bg-evergreen/5 p-4"
          role="status"
        >
          <p className="text-sm font-semibold text-evergreen">
            Shelter Handoff Complete
          </p>
          <p className="mt-1 text-xs text-graphite/65">
            Rescue operations are complete. Shelter staff will finish intake.
          </p>
        </div>
      )}
    </div>
  );
}
