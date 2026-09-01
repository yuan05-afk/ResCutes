"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  verifyCaseAction,
  rejectCaseAction,
  assignRescuerAction,
  selectShelterAction,
  confirmHandoffAction,
  overrideUrgencyAction,
} from "@/app/actions/case";

interface CaseStaffActionsProps {
  caseId: string;
  caseStatus: string;
  rescuers: { id: string; name: string }[];
  recommendations: {
    shelterId: string;
    shelterName: string;
    rank: number;
  }[];
  assignedShelterId?: string;
}

export function CaseStaffActions({
  caseId,
  caseStatus,
  rescuers,
  recommendations,
  assignedShelterId,
}: CaseStaffActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [overrideScore, setOverrideScore] = useState(70);
  const [overrideReason, setOverrideReason] = useState("");
  const [selectedRescuer, setSelectedRescuer] = useState("");
  const [selectedShelter, setSelectedShelter] = useState("");
  const [shelterRejectReason, setShelterRejectReason] = useState("");
  const [handoffNotes, setHandoffNotes] = useState("");

  async function runAction(fn: () => Promise<unknown>) {
    setLoading(true);
    await fn();
    router.refresh();
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Staff Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(caseStatus === "report_submitted" || caseStatus === "under_verification") && (
          <div className="space-y-2">
            <Button
              onClick={() => runAction(() => verifyCaseAction(caseId))}
              disabled={loading}
              className="w-full"
            >
              Verify Report
            </Button>
            <Textarea
              placeholder="Rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <Button
              variant="destructive"
              onClick={() =>
                runAction(() => rejectCaseAction(caseId, rejectReason))
              }
              disabled={loading || !rejectReason.trim()}
              className="w-full"
            >
              Reject Report
            </Button>
          </div>
        )}

        {caseStatus === "verified" && (
          <div className="space-y-2">
            <Select
              value={selectedRescuer}
              onChange={(e) => setSelectedRescuer(e.target.value)}
            >
              <option value="">Select rescuer...</option>
              {rescuers.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
            <Button
              onClick={() =>
                runAction(() => assignRescuerAction(caseId, selectedRescuer))
              }
              disabled={loading || !selectedRescuer}
              className="w-full"
            >
              Assign Rescuer
            </Button>
          </div>
        )}

        <div className="space-y-2 border-t border-sage/30 pt-4">
          <p className="text-xs font-medium text-graphite/70">Override Urgency</p>
          <Input
            type="number"
            min={0}
            max={100}
            value={overrideScore}
            onChange={(e) => setOverrideScore(parseInt(e.target.value))}
          />
          <Textarea
            placeholder="Override reason (required)..."
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() =>
              runAction(() =>
                overrideUrgencyAction(caseId, overrideScore, overrideReason),
              )
            }
            disabled={loading || !overrideReason.trim()}
            className="w-full"
          >
            Apply Override
          </Button>
        </div>

        {recommendations.length > 0 && !assignedShelterId && (
          <div className="space-y-2 border-t border-sage/30 pt-4">
            <p className="text-xs font-medium text-graphite/70">Select Shelter</p>
            <Select
              value={selectedShelter}
              onChange={(e) => setSelectedShelter(e.target.value)}
            >
              <option value="">Select shelter...</option>
              {recommendations.map((r) => (
                <option key={r.shelterId} value={r.shelterId}>
                  #{r.rank} {r.shelterName}
                </option>
              ))}
            </Select>
            {selectedShelter &&
              recommendations.find((r) => r.rank === 1)?.shelterId !==
                selectedShelter && (
                <Textarea
                  placeholder="Reason for not selecting top recommendation (required)..."
                  value={shelterRejectReason}
                  onChange={(e) => setShelterRejectReason(e.target.value)}
                />
              )}
            <Button
              onClick={() =>
                runAction(() =>
                  selectShelterAction(
                    caseId,
                    selectedShelter,
                    shelterRejectReason || undefined,
                  ),
                )
              }
              disabled={
                loading ||
                !selectedShelter ||
                (recommendations.find((r) => r.rank === 1)?.shelterId !==
                  selectedShelter &&
                  !shelterRejectReason.trim())
              }
              className="w-full"
            >
              Confirm Destination
            </Button>
          </div>
        )}

        {(caseStatus === "awaiting_shelter" || caseStatus === "animal_secured") &&
          assignedShelterId && (
          <div className="space-y-2 border-t border-sage/30 pt-4">
            <Textarea
              placeholder="Handoff notes..."
              value={handoffNotes}
              onChange={(e) => setHandoffNotes(e.target.value)}
            />
            <Button
              onClick={() =>
                runAction(() =>
                  confirmHandoffAction(caseId, assignedShelterId, handoffNotes),
                )
              }
              disabled={loading}
              className="w-full"
            >
              Confirm Shelter Handoff
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
