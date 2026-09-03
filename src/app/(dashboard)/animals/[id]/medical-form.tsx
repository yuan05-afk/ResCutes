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
  variant?: "default" | "panel";
}

export function MedicalClearanceForm({
  animalId,
  clearanceStatus,
  clearance,
  variant = "default",
}: MedicalClearanceFormProps) {
  const { pending: loading, error, setError, run } = useActionPending();
  const [showTreatmentFields, setShowTreatmentFields] = useState(
    clearanceStatus === "under_treatment" ||
      Boolean(clearance?.treatmentSummary?.trim()),
  );
  const [showFollowUpFields, setShowFollowUpFields] = useState(
    clearanceStatus === "follow_up_required" || Boolean(clearance?.followUpDate),
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

  const isPanel = variant === "panel";
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
      { rewarm: [`/animals/${animalId}`, "/animals", "/dashboard"] },
    );
  }

  function handleScheduleFollowUp() {
    setShowFollowUpFields(true);
    submitStatus("follow_up_required");
  }

  const actionButtons = (
    <div className={cn("space-y-1.5", isPanel && "pt-1")}>
      {clearanceStatus === "awaiting_examination" && (
        <>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            variant="outline"
            size="sm"
            onClick={() => submitStatus("under_examination")}
          >
            {loading ? "Saving..." : "Start Examination"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            size="sm"
            onClick={() => submitStatus("under_treatment")}
          >
            {loading ? "Saving..." : "Requires Treatment"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            variant="secondary"
            size="sm"
            onClick={() => submitStatus("follow_up_required")}
          >
            {loading ? "Saving..." : "Follow-Up Required"}
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
            onClick={() => submitStatus("under_treatment")}
          >
            {loading ? "Saving..." : "Requires Treatment"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            variant="secondary"
            size="sm"
            onClick={() => submitStatus("follow_up_required")}
          >
            {loading ? "Saving..." : "Follow-Up Required"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            variant="outline"
            size="sm"
            onClick={() => submitStatus("medically_cleared")}
          >
            {loading ? "Saving..." : "Mark Medically Cleared"}
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
            {loading ? "Saving..." : "Schedule Follow-Up"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            size="sm"
            onClick={() => submitStatus("medically_cleared")}
          >
            {loading ? "Saving..." : "Mark Medically Cleared"}
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
            onClick={() => submitStatus("under_treatment")}
          >
            {loading ? "Saving..." : "Resume Treatment"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            size="sm"
            onClick={() => submitStatus("medically_cleared")}
          >
            {loading ? "Saving..." : "Mark Medically Cleared"}
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
      {!isPanel && (
        <div className="space-y-1">
          <Label>Veterinarian Notes</Label>
          <Textarea
            value={form.veterinarianNotes}
            onChange={(e) =>
              setForm({ ...form, veterinarianNotes: e.target.value })
            }
            placeholder="Private clinical notes"
          />
        </div>
      )}

      {showTreatmentFields && (
        <>
          <div className="space-y-1">
            <Label className={isPanel ? "text-xs" : undefined}>Treatment</Label>
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
          {!isPanel && (
            <div className="space-y-1">
              <Label>Restrictions</Label>
              <Textarea
                value={form.restrictions}
                onChange={(e) =>
                  setForm({ ...form, restrictions: e.target.value })
                }
                placeholder="Activity or care restrictions"
              />
            </div>
          )}
        </>
      )}

      {showFollowUpFields && (
        <div className="space-y-1">
          <Label className={isPanel ? "text-xs" : undefined}>Follow-up date</Label>
          <Input
            type="date"
            value={form.followUpDate}
            onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
            className={isPanel ? "h-9 text-sm" : undefined}
          />
        </div>
      )}

      {error && <p className="text-xs text-rescue">{error}</p>}
      {actionButtons}
    </>
  );

  if (clearanceStatus === "medically_cleared") {
    const clearedBody = (
      <div className="space-y-2 text-sm">
        <StatusBadge status="medically_cleared" size="sm" />
        <p className="text-xs text-graphite/70">
          Medical clearance is complete. Further veterinary edits are locked.
        </p>
      </div>
    );

    if (isPanel) {
      return (
        <div className="flex flex-col">
          <PanelHeader />
          <div className="p-3">{clearedBody}</div>
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Veterinary Actions</CardTitle>
        </CardHeader>
        <CardContent>{clearedBody}</CardContent>
      </Card>
    );
  }

  if (isPanel) {
    return (
      <div className="flex flex-col">
        <PanelHeader status={clearanceStatus} />
        <div className="space-y-2 p-3">{formFields}</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Veterinary Actions</CardTitle>
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

function PanelHeader({ status }: { status?: string }) {
  return (
    <div className="shrink-0 border-b border-sage/20 bg-evergreen/5 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-evergreen">Veterinary Actions</p>
          <p className="text-[10px] text-graphite/50">Update clearance and treatment</p>
        </div>
        {status ? <StatusBadge status={status} size="sm" /> : null}
      </div>
    </div>
  );
}
