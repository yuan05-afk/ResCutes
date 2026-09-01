"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "lucide-react";
import {
  acceptAssignmentAction,
  declineAssignmentAction,
  updateCaseStatusAction,
} from "@/app/actions/case";

interface AssignmentActionsClientProps {
  assignmentId: string;
  caseId: string;
  assignmentStatus: string;
  caseStatus: string;
  latitude: number;
  longitude: number;
}

export function AssignmentActionsClient({
  assignmentId,
  caseId,
  assignmentStatus,
  caseStatus,
  latitude,
  longitude,
}: AssignmentActionsClientProps) {
  const router = useRouter();
  const [declineReason, setDeclineReason] = useState("");
  const [showDecline, setShowDecline] = useState(false);
  const [loading, setLoading] = useState(false);

  function openNavigation() {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      "_blank",
    );
  }

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
    router.push("/mobile/cases");
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
        <>
          <Button onClick={handleAccept} disabled={loading} className="w-full">
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

      {showDecline && (
        <div className="space-y-2">
          <Textarea
            placeholder="Reason for declining (required)..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
          <Button variant="destructive" onClick={handleDecline} disabled={loading}>
            Confirm Decline
          </Button>
        </div>
      )}

      {assignmentStatus !== "pending" && (
        <Button variant="outline" onClick={openNavigation} className="w-full">
          <Navigation className="h-4 w-4 mr-2" />
          Open Navigation
        </Button>
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
