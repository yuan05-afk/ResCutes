"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

  async function handleAccept() {
    setLoading(true);
    await acceptAssignmentAction(assignmentId);
    router.refresh();
    setLoading(false);
  }

  async function handleDecline() {
    if (!declineReason.trim()) return;
    setLoading(true);
    await declineAssignmentAction(assignmentId, declineReason);
    router.refresh();
    setLoading(false);
  }

  async function handleStatusUpdate(status: string) {
    setLoading(true);
    await updateCaseStatusAction(caseId, status);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      {assignmentStatus === "pending" && (
        <div className="flex gap-2">
          <Button onClick={handleAccept} disabled={loading} className="flex-1">
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

      {showDecline && (
        <div className="space-y-2">
          <Textarea
            placeholder="Reason for declining..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
          <Button variant="destructive" onClick={handleDecline} disabled={loading}>
            Confirm Decline
          </Button>
        </div>
      )}

      {assignmentStatus === "accepted" && caseStatus === "rescue_accepted" && (
        <Button onClick={() => handleStatusUpdate("rescue_in_progress")} disabled={loading} className="w-full">
          Start Rescue
        </Button>
      )}

      {caseStatus === "rescue_in_progress" && (
        <Button onClick={() => handleStatusUpdate("animal_secured")} disabled={loading} className="w-full">
          Mark Animal Secured
        </Button>
      )}

      {caseStatus === "animal_secured" && (
        <Button onClick={() => handleStatusUpdate("awaiting_shelter")} disabled={loading} className="w-full">
          Request Shelter Placement
        </Button>
      )}
    </div>
  );
}
