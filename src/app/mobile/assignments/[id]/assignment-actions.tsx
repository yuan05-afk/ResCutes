"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Navigation, CheckCircle2 } from "lucide-react";
import { useActionPending } from "@/components/shared/useActionPending";
import {
  googleMapsCaseDirectionsUrl,
  type CaseMapsLocation,
} from "@/lib/maps/case-links";
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

interface AssignmentActionsClientProps {
  assignmentId: string;
  caseId: string;
  assignmentStatus: string;
  caseStatus: string;
  latitude: number;
  longitude: number;
  caseNumber: string;
  locationLabel?: string;
  locationNote?: string;
  shelterName?: string;
  shelterAddress?: string;
}

type ActionResult = { error?: string; success?: boolean } | void;

export function AssignmentActionsClient({
  assignmentId,
  caseId,
  assignmentStatus,
  caseStatus,
  latitude,
  longitude,
  caseNumber,
  locationLabel,
  locationNote,
  shelterName,
  shelterAddress,
}: AssignmentActionsClientProps) {
  const { pending: loading, error: actionError, setError: setActionError, run } =
    useActionPending();
  const [declineReason, setDeclineReason] = useState("");
  const [showDecline, setShowDecline] = useState(false);

  function openNavigation() {
    const mapsLocation: CaseMapsLocation = {
      caseNumber,
      locationLabel,
      locationNote,
      latitude,
      longitude,
    };
    window.open(googleMapsCaseDirectionsUrl(mapsLocation), "_blank");
  }

  async function runAction(fn: () => Promise<ActionResult>) {
    setActionError(null);
    await run(fn, {
      rewarm: [
        `/mobile/assignments/${assignmentId}`,
        `/mobile/cases/${caseId}`,
        "/mobile",
      ],
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
        <>
          <Button
            onClick={() => runAction(() => acceptAssignmentAction(assignmentId))}
            disabled={loading}
            className="w-full"
          >
            Accept Assignment
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDecline(!showDecline)}
            disabled={loading}
            className="w-full"
          >
            Decline
          </Button>
        </>
      )}

      {showDecline && assignmentStatus === "pending" && (
        <div className="space-y-2">
          <Textarea
            placeholder="Reason for declining (required)..."
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

      {assignmentStatus === "accepted" && !handoffDone && (
        <Button variant="outline" onClick={openNavigation} className="w-full">
          <Navigation className="h-4 w-4 mr-2" />
          Open Navigation
        </Button>
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
                You will see an update when the animal is at the shelter.
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
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="h-5 w-5 shrink-0 text-evergreen mt-0.5"
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold text-evergreen">
                Shelter Handoff Complete
              </p>
              <p className="mt-1 text-xs text-graphite/65 leading-relaxed">
                The animal has been safely transferred to:
              </p>
              {shelterName && (
                <p className="mt-2 text-sm font-medium text-graphite">
                  {shelterName}
                </p>
              )}
              {shelterAddress && (
                <p className="text-xs text-graphite/60">{shelterAddress}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
