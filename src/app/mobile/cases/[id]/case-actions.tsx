"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import {
  acceptAssignmentAction,
  declineAssignmentAction,
  updateCaseStatusAction,
} from "@/app/actions/case";

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
  const router = useRouter();
  const [declineReason, setDeclineReason] = useState("");
  const [showDecline, setShowDecline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function runAction(fn: () => Promise<ActionResult>) {
    setLoading(true);
    setActionError(null);
    const result = await fn();
    if (result && typeof result === "object" && "error" in result && result.error) {
      setActionError(result.error);
      setLoading(false);
      return;
    }
    router.refresh();
    setLoading(false);
  }

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

      {assignmentStatus === "accepted" && caseStatus === "rescue_accepted" && (
        <Button
          onClick={() =>
            runAction(() => updateCaseStatusAction(caseId, "rescue_in_progress"))
          }
          disabled={loading}
          className="w-full"
        >
          Start Rescue
        </Button>
      )}

      {assignmentStatus === "accepted" && caseStatus === "rescue_in_progress" && (
        <Button
          onClick={() =>
            runAction(() => updateCaseStatusAction(caseId, "animal_secured"))
          }
          disabled={loading}
          className="w-full"
        >
          Mark Animal Secured
        </Button>
      )}

      {assignmentStatus === "accepted" && caseStatus === "animal_secured" && (
        <Button
          onClick={() =>
            runAction(() => updateCaseStatusAction(caseId, "awaiting_shelter"))
          }
          disabled={loading}
          className="w-full"
        >
          Request Shelter Placement
        </Button>
      )}

      {assignmentStatus === "accepted" && caseStatus === "awaiting_shelter" && (
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
                Shelter placement requested
              </p>
              <p className="mt-1 text-xs text-graphite/65 leading-relaxed">
                Shelter staff will review recommendations and confirm a
                destination.
              </p>
            </div>
          </div>
        </div>
      )}

      {(assignmentStatus === "completed" || caseStatus === "shelter_handoff") && (
        <div
          className="rounded-xl border border-evergreen/25 bg-evergreen/5 p-4"
          role="status"
        >
          <p className="text-sm font-semibold text-evergreen">
            Shelter Handoff Complete
          </p>
          <p className="mt-1 text-xs text-graphite/65">
            Rescue operations are complete. Shelter staff will complete intake.
          </p>
        </div>
      )}
    </div>
  );
}
