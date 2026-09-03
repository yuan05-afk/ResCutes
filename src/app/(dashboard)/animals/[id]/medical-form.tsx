"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import { SelectWithOtherSplit } from "@/components/ui/select-with-other";
import { useActionPending } from "@/components/shared/useActionPending";
import { updateMedicalClearanceAction } from "@/app/actions/case";
import type { ClearanceStatus } from "@/lib/data/types";
import { formatStatus, cn } from "@/lib/utils";
import {
  GENERAL_CONDITION_OPTIONS,
  MEDICAL_PRIORITY_VALUES,
  resolveSelectOther,
  splitSelectOther,
  validateSelectOther,
} from "@/lib/forms/animal-field-options";

const PRIORITIES = MEDICAL_PRIORITY_VALUES;

interface MedicalClearanceFormProps {
  animalId: string;
  clearanceStatus: ClearanceStatus;
  clearance?: {
    examinationDate?: string;
    generalCondition?: string;
    medicalPriority?: string;
    treatmentSummary?: string;
    restrictions?: string;
    followUpDate?: string;
    clearanceStatus: string;
    veterinarianNotes?: string;
  };
  variant?: "default" | "panel" | "workspace";
}

export function MedicalClearanceForm({
  animalId,
  clearanceStatus,
  clearance,
  variant = "default",
}: MedicalClearanceFormProps) {
  const { pending: loading, error, setError, run } = useActionPending();
  const isWorkspace = variant === "workspace";
  const isPanel = variant === "panel";
  const showFullFields = variant === "default" || isWorkspace;

  const [showTreatmentFields, setShowTreatmentFields] = useState(
    clearanceStatus === "under_treatment" ||
      Boolean(clearance?.treatmentSummary?.trim()),
  );
  const [showFollowUpFields, setShowFollowUpFields] = useState(
    clearanceStatus === "follow_up_required" ||
      Boolean(clearance?.followUpDate),
  );
  const [form, setForm] = useState({
    generalCondition: clearance?.generalCondition ?? "",
    medicalPriority: clearance?.medicalPriority ?? "routine",
    treatmentSummary: clearance?.treatmentSummary ?? "",
    restrictions: clearance?.restrictions ?? "",
    veterinarianNotes: clearance?.veterinarianNotes ?? "",
    followUpDate: clearance?.followUpDate?.split("T")[0] ?? "",
  });
  const conditionInit = splitSelectOther(
    clearance?.generalCondition,
    GENERAL_CONDITION_OPTIONS,
  );
  const [conditionChoice, setConditionChoice] = useState(
    conditionInit.choice || "",
  );
  const [conditionOther, setConditionOther] = useState(conditionInit.other);

  const isExamPhase =
    clearanceStatus === "awaiting_examination" ||
    clearanceStatus === "under_examination";

  async function submitStatus(targetStatus: ClearanceStatus) {
    if (
      targetStatus === "under_treatment" &&
      !showTreatmentFields &&
      isExamPhase
    ) {
      setShowTreatmentFields(true);
      setError("Add treatment details below, then submit again.");
      return;
    }

    if (targetStatus === "follow_up_required" && !showFollowUpFields) {
      setShowFollowUpFields(true);
      setError("Set a follow-up date below, then submit again.");
      return;
    }

    if (
      targetStatus === "under_treatment" &&
      !form.treatmentSummary.trim()
    ) {
      setShowTreatmentFields(true);
      setError("Treatment summary is required before starting treatment.");
      return;
    }

    if (targetStatus === "follow_up_required" && !form.followUpDate) {
      setShowFollowUpFields(true);
      setError("Follow-up date is required.");
      return;
    }

    if (
      targetStatus === "medically_cleared" &&
      !conditionChoice &&
      !conditionOther.trim()
    ) {
      setError("Record general condition before marking medically cleared.");
      return;
    }

    setError(null);
    const conditionErr = validateSelectOther(
      "General condition",
      conditionChoice,
      conditionOther,
    );
    if (conditionErr) {
      setError(conditionErr);
      return;
    }
    const generalCondition =
      resolveSelectOther(conditionChoice, conditionOther) ?? "";
    const payload = { ...form, generalCondition };

    await run(
      () =>
        updateMedicalClearanceAction(animalId, {
          generalCondition: payload.generalCondition,
          medicalPriority: payload.medicalPriority,
          treatmentSummary: payload.treatmentSummary,
          restrictions: payload.restrictions,
          followUpDate: payload.followUpDate
            ? new Date(payload.followUpDate).toISOString()
            : undefined,
          clearanceStatus: targetStatus,
          veterinarianNotes: payload.veterinarianNotes,
        }),
      {
        rewarm: [
          `/animals/${animalId}`,
          "/animals",
          "/medical",
          "/dashboard",
          "/adoption",
        ],
      },
    );
  }

  function handleScheduleFollowUp() {
    setShowFollowUpFields(true);
    void submitStatus("follow_up_required");
  }

  const actionButtons = (
    <div className={cn("space-y-1.5", (isPanel || isWorkspace) && "pt-1")}>
      {clearanceStatus === "awaiting_examination" && (
        <>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            size="sm"
            onClick={() => void submitStatus("under_examination")}
          >
            {loading ? "Saving..." : "Start examination"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            variant="outline"
            size="sm"
            onClick={() => void submitStatus("under_treatment")}
          >
            {loading ? "Saving..." : "Needs treatment"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            variant="secondary"
            size="sm"
            onClick={() => void submitStatus("follow_up_required")}
          >
            {loading ? "Saving..." : "Schedule follow-up"}
          </Button>
        </>
      )}

      {clearanceStatus === "under_examination" && (
        <>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            size="sm"
            onClick={() => void submitStatus("under_treatment")}
          >
            {loading ? "Saving..." : "Needs treatment"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            variant="secondary"
            size="sm"
            onClick={() => void submitStatus("follow_up_required")}
          >
            {loading ? "Saving..." : "Schedule follow-up"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            variant="outline"
            size="sm"
            onClick={() => void submitStatus("medically_cleared")}
          >
            {loading ? "Saving..." : "Mark medically cleared"}
          </Button>
        </>
      )}

      {clearanceStatus === "under_treatment" && (
        <>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            variant="secondary"
            size="sm"
            onClick={handleScheduleFollowUp}
          >
            {loading ? "Saving..." : "Schedule follow-up"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            size="sm"
            onClick={() => void submitStatus("medically_cleared")}
          >
            {loading ? "Saving..." : "Mark medically cleared"}
          </Button>
        </>
      )}

      {clearanceStatus === "follow_up_required" && (
        <>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            variant="outline"
            size="sm"
            onClick={() => void submitStatus("under_treatment")}
          >
            {loading ? "Saving..." : "Resume treatment"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            size="sm"
            onClick={() => void submitStatus("medically_cleared")}
          >
            {loading ? "Saving..." : "Mark medically cleared"}
          </Button>
        </>
      )}
    </div>
  );

  const formFields = (
    <>
      <SelectWithOtherSplit
        id="medical-general-condition"
        label="General condition"
        options={GENERAL_CONDITION_OPTIONS}
        choice={conditionChoice}
        other={conditionOther}
        onChoiceChange={setConditionChoice}
        onOtherChange={setConditionOther}
        placeholder="Select condition"
        selectClassName={isPanel ? "h-9 text-sm" : undefined}
      />
      <div className="space-y-1">
        <Label className={isPanel ? "text-xs" : undefined}>Medical priority</Label>
        <Select
          value={form.medicalPriority}
          onChange={(e) => setForm({ ...form, medicalPriority: e.target.value })}
          className={isPanel ? "h-9 text-sm" : undefined}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {formatStatus(p)}
            </option>
          ))}
        </Select>
      </div>

      {showFullFields ? (
        <div className="space-y-1">
          <Label>Clinical notes</Label>
          <Textarea
            value={form.veterinarianNotes}
            onChange={(e) =>
              setForm({ ...form, veterinarianNotes: e.target.value })
            }
            placeholder="Exam findings, vaccines, parasite prevention, disclosures for adopters"
            rows={isWorkspace ? 3 : 4}
            className={cn(isWorkspace && "resize-none text-sm")}
          />
        </div>
      ) : null}

      {showTreatmentFields ? (
        <>
          <div className="space-y-1">
            <Label className={isPanel ? "text-xs" : undefined}>
              Treatment plan
            </Label>
            <Textarea
              value={form.treatmentSummary}
              onChange={(e) =>
                setForm({ ...form, treatmentSummary: e.target.value })
              }
              placeholder="Treatment provided or planned"
              rows={isPanel ? 2 : 3}
              className={cn(isPanel && "min-h-0 resize-none text-sm")}
            />
          </div>
          {showFullFields ? (
            <div className="space-y-1">
              <Label>Care restrictions</Label>
              <Textarea
                value={form.restrictions}
                onChange={(e) =>
                  setForm({ ...form, restrictions: e.target.value })
                }
                placeholder="Activity limits, isolation, meds to send with adopter"
                rows={2}
                className={cn(isWorkspace && "resize-none text-sm")}
              />
            </div>
          ) : null}
        </>
      ) : null}

      {showFollowUpFields ? (
        <div className="space-y-1">
          <Label className={isPanel ? "text-xs" : undefined}>Follow-up date</Label>
          <Input
            type="date"
            value={form.followUpDate}
            onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
            className={isPanel ? "h-9 text-sm" : undefined}
          />
        </div>
      ) : null}

      {error ? <p className="text-xs text-rescue">{error}</p> : null}
      {actionButtons}
    </>
  );

  if (clearanceStatus === "medically_cleared") {
    const clearedBody = (
      <div className="space-y-2 text-sm">
        <StatusBadge status="medically_cleared" size="sm" />
        <p className="text-xs leading-relaxed text-graphite/70">
          Medical clearance is complete. Pathway moves to behavior assessment;
          staff can then set Adoption ready or Foster ready.
        </p>
        {clearance?.generalCondition ? (
          <p className="text-xs text-graphite/65">
            <span className="font-medium text-graphite">Condition: </span>
            {clearance.generalCondition}
          </p>
        ) : null}
        {clearance?.veterinarianNotes ? (
          <p className="text-xs text-graphite/65">
            <span className="font-medium text-graphite">Notes: </span>
            {clearance.veterinarianNotes}
          </p>
        ) : null}
      </div>
    );

    if (isPanel || isWorkspace) {
      return (
        <div className="flex flex-col">
          <FormHeader variant={variant} />
          <div className="p-3">{clearedBody}</div>
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Medical clearance</CardTitle>
        </CardHeader>
        <CardContent>{clearedBody}</CardContent>
      </Card>
    );
  }

  if (isPanel || isWorkspace) {
    return (
      <div className="flex flex-col">
        <FormHeader variant={variant} status={clearanceStatus} />
        <div className={cn("space-y-2.5", isWorkspace ? "p-3.5" : "p-3")}>
          {formFields}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Medical clearance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <StatusBadge status={clearanceStatus} size="md" />
        </div>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          {formFields}
        </form>
      </CardContent>
    </Card>
  );
}

function FormHeader({
  status,
  variant,
}: {
  status?: string;
  variant: "default" | "panel" | "workspace";
}) {
  return (
    <div className="shrink-0 border-b border-sage/20 bg-evergreen/5 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-evergreen">
            {variant === "workspace" ? "Update clearance" : "Medical actions"}
          </p>
          <p className="text-[10px] text-graphite/50">
            Exam, treatment, and clearance decisions
          </p>
        </div>
        {status ? <StatusBadge status={status} size="sm" /> : null}
      </div>
    </div>
  );
}
