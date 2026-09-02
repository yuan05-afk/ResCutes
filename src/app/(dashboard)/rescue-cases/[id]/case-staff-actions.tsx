"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActionPending } from "@/components/shared/useActionPending";
import {
  verifyCaseAction,
  rejectCaseAction,
  assignRescuerAction,
  selectShelterAction,
  confirmHandoffAction,
  overrideUrgencyAction,
} from "@/app/actions/case";
import { CaseIntakeForm } from "./case-intake-form";
import { cn } from "@/lib/utils";

interface CaseStaffActionsProps {
  caseId: string;
  caseNumber: string;
  caseStatus: string;
  species: string;
  injurySeverity: string;
  rescuers: { id: string; name: string }[];
  recommendations: {
    shelterId: string;
    shelterName: string;
    rank: number;
  }[];
  assignedShelterId?: string;
  hasHandoff?: boolean;
  hasAnimal?: boolean;
  variant?: "default" | "compact" | "panel";
}

function ActionBlock({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-sage/20 bg-white p-2.5 shadow-sm",
        className,
      )}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-graphite/50">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function CaseStaffActions({
  caseId,
  caseNumber,
  caseStatus,
  species,
  injurySeverity,
  rescuers,
  recommendations,
  assignedShelterId,
  hasHandoff,
  hasAnimal,
  variant = "default",
}: CaseStaffActionsProps) {
  const { pending: loading, error: actionError, setError: setActionError, run } =
    useActionPending();
  const [rejectReason, setRejectReason] = useState("");
  const [overrideScore, setOverrideScore] = useState(70);
  const [overrideReason, setOverrideReason] = useState("");
  const [selectedRescuer, setSelectedRescuer] = useState("");
  const [selectedShelter, setSelectedShelter] = useState("");
  const [shelterRejectReason, setShelterRejectReason] = useState("");
  const [handoffNotes, setHandoffNotes] = useState("");

  const temporaryId = `A-${caseNumber.replace("RC-", "")}`;
  const showRescueStageActions =
    !hasHandoff &&
    !["shelter_handoff", "completed", "rejected", "duplicate", "cancelled"].includes(
      caseStatus,
    );

  const isPanel = variant === "panel";
  const isCompact = variant === "compact" || isPanel;
  const inputClass = isCompact ? "h-9 text-sm" : undefined;
  const btnSize = isCompact ? "sm" : "default";

  async function runAction(
    fn: () => Promise<{ error?: string; success?: boolean } | void>,
  ) {
    setActionError(null);
    await run(fn, {
      rewarm: [`/rescue-cases/${caseId}`, "/rescue-cases", "/dashboard"],
    });
  }

  const body = (
    <div className={cn(isPanel ? "space-y-2" : "space-y-4")}>
      {actionError && (
        <p className="rounded-lg border border-rescue/25 bg-rescue/8 px-2.5 py-2 text-xs text-rescue">
          {actionError}
        </p>
      )}

      {(caseStatus === "report_submitted" ||
        caseStatus === "under_verification") && (
        <ActionBlock title="Review report">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              onClick={() => runAction(() => verifyCaseAction(caseId))}
              disabled={loading}
              size={btnSize}
              className="w-full"
            >
              Verify
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                runAction(() => rejectCaseAction(caseId, rejectReason))
              }
              disabled={loading || !rejectReason.trim()}
              size={btnSize}
              className="w-full"
            >
              Reject
            </Button>
          </div>
          <Textarea
            placeholder="Rejection reason (required to reject)..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={2}
            className="min-h-[4rem] resize-none text-sm"
          />
        </ActionBlock>
      )}

      {caseStatus === "verified" && (
        <ActionBlock title="Assign rescuer">
          <Select
            value={selectedRescuer}
            onChange={(e) => setSelectedRescuer(e.target.value)}
            className={inputClass}
          >
            <option value="">Choose rescuer...</option>
            {rescuers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
          <Button
            onClick={() =>
              runAction(() => assignRescuerAction(caseId, selectedRescuer))
            }
            disabled={loading || !selectedRescuer}
            className="w-full"
            size={btnSize}
          >
            Assign Rescuer
          </Button>
        </ActionBlock>
      )}

      {showRescueStageActions && (
        <ActionBlock title="Override urgency">
          <div className="flex gap-2">
            <div className="shrink-0">
              <label className="mb-1 block text-[10px] text-graphite/45">Score</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={overrideScore}
                onChange={(e) => setOverrideScore(parseInt(e.target.value) || 0)}
                className={cn(inputClass, "w-16 text-center font-semibold")}
              />
            </div>
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-[10px] text-graphite/45">Reason</label>
              <Input
                placeholder="Required..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <Button
            variant={overrideReason.trim() ? "default" : "outline"}
            onClick={() =>
              runAction(() =>
                overrideUrgencyAction(caseId, overrideScore, overrideReason),
              )
            }
            disabled={loading || !overrideReason.trim()}
            className="w-full"
            size={btnSize}
          >
            Apply Override
          </Button>
        </ActionBlock>
      )}

      {showRescueStageActions &&
        recommendations.length > 0 &&
        !assignedShelterId && (
          <ActionBlock title="Shelter destination">
            <Select
              value={selectedShelter}
              onChange={(e) => setSelectedShelter(e.target.value)}
              className={inputClass}
            >
              <option value="">Choose shelter...</option>
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
                  placeholder="Why not the top recommendation?"
                  value={shelterRejectReason}
                  onChange={(e) => setShelterRejectReason(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
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
              size={btnSize}
            >
              Confirm Destination
            </Button>
          </ActionBlock>
        )}

      {showRescueStageActions &&
        caseStatus === "awaiting_shelter" &&
        assignedShelterId &&
        !hasHandoff && (
          <ActionBlock title="Shelter handoff">
            <Textarea
              placeholder="Handoff notes (optional)..."
              value={handoffNotes}
              onChange={(e) => setHandoffNotes(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
            <Button
              onClick={() =>
                runAction(() =>
                  confirmHandoffAction(caseId, assignedShelterId, handoffNotes),
                )
              }
              disabled={loading}
              className="w-full"
              size={btnSize}
            >
              Confirm Handoff
            </Button>
          </ActionBlock>
        )}

      {caseStatus === "shelter_handoff" && hasHandoff && !hasAnimal && (
        <ActionBlock title="Shelter intake">
          <CaseIntakeForm
            caseId={caseId}
            species={species}
            temporaryId={temporaryId}
            injurySeverity={injurySeverity}
          />
        </ActionBlock>
      )}
    </div>
  );

  if (isPanel) {
    return (
      <div className="flex flex-col">
        <div className="shrink-0 border-b border-sage/20 bg-evergreen/5 px-3 py-2.5">
          <p className="text-xs font-bold text-evergreen">Staff Actions</p>
          <p className="text-[10px] text-graphite/50">Update case status and routing</p>
        </div>
        <div className="p-2.5">{body}</div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
          Staff actions
        </p>
        {body}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Staff Actions</CardTitle>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
