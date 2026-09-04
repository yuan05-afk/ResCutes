"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import { SelectWithOtherSplit } from "@/components/ui/select-with-other";
import { DatePicker } from "@/components/ui/date-picker";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useActionPending } from "@/components/shared/useActionPending";
import { updateMedicalClearanceAction } from "@/app/actions/case";
import type { ClearanceStatus } from "@/lib/data/types";
import {
  getClearanceRollbackOptions,
  isClearanceRollback,
  type ClearanceRollbackOption,
} from "@/lib/data/medical-clearance-workflow";
import { formatStatus, cn } from "@/lib/utils";
import {
  GENERAL_CONDITION_OPTIONS,
  MEDICAL_PRIORITY_VALUES,
  resolveSelectOther,
  splitSelectOther,
  validateSelectOther,
} from "@/lib/forms/animal-field-options";
import {
  followUpDateBounds,
  validateIsoDate,
} from "@/lib/forms/date-validation";

const PRIORITIES = MEDICAL_PRIORITY_VALUES;

interface MedicalClearanceFormProps {
  animalId: string;
  clearanceStatus: ClearanceStatus;
  pathwayStage?: string;
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
  pathwayStage,
  clearance,
  variant = "default",
}: MedicalClearanceFormProps) {
  const { pending: loading, error, setError, run } = useActionPending();
  const isWorkspace = variant === "workspace";
  const isPanel = variant === "panel";
  const showFullFields = variant === "default" || isWorkspace;
  const followUpBounds = followUpDateBounds();
  const treatmentInputRef = useRef<HTMLTextAreaElement>(null);
  const [focusTreatment, setFocusTreatment] = useState(false);
  const [rollbackTarget, setRollbackTarget] =
    useState<ClearanceRollbackOption | null>(null);
  const initialFollowUpDate =
    clearance?.followUpDate?.slice(0, 10) ?? "";

  const rollbackOptions = useMemo(
    () => getClearanceRollbackOptions(clearanceStatus, pathwayStage),
    [clearanceStatus, pathwayStage],
  );

  const [showTreatmentFields, setShowTreatmentFields] = useState(
    clearanceStatus === "under_treatment" ||
      Boolean(clearance?.treatmentSummary?.trim()),
  );
  const [showFollowUpFields, setShowFollowUpFields] = useState(
    clearanceStatus === "follow_up_required" ||
      Boolean(clearance?.followUpDate),
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  /** After Schedule follow-up, picking a date submits immediately. */
  const [autoSubmitOnPick, setAutoSubmitOnPick] = useState(false);
  /** Saved follow-up day; Confirm stays disabled until the user picks a different day. */
  const [baselineFollowUpDate, setBaselineFollowUpDate] =
    useState(initialFollowUpDate);

  const [form, setForm] = useState({
    generalCondition: clearance?.generalCondition ?? "",
    medicalPriority: clearance?.medicalPriority ?? "routine",
    treatmentSummary: clearance?.treatmentSummary ?? "",
    restrictions: clearance?.restrictions ?? "",
    veterinarianNotes: clearance?.veterinarianNotes ?? "",
    followUpDate: initialFollowUpDate,
  });
  const conditionInit = splitSelectOther(
    clearance?.generalCondition,
    GENERAL_CONDITION_OPTIONS,
  );
  const [conditionChoice, setConditionChoice] = useState(
    conditionInit.choice || "",
  );
  const [conditionOther, setConditionOther] = useState(conditionInit.other);

  useEffect(() => {
    if (!focusTreatment || !showTreatmentFields) return;
    treatmentInputRef.current?.focus();
    setFocusTreatment(false);
  }, [focusTreatment, showTreatmentFields]);

  function openTreatmentPlanner() {
    setShowTreatmentFields(true);
    setFocusTreatment(true);
    setError(null);
  }

  const followUpDirty =
    Boolean(form.followUpDate) &&
    form.followUpDate !== baselineFollowUpDate;
  const followUpDisplayError =
    followUpDirty || autoSubmitOnPick ? dateError : null;

  async function submitStatus(
    targetStatus: ClearanceStatus,
    followUpOverride?: string,
    opts?: { rollback?: boolean },
  ) {
    const followUpDate = followUpOverride ?? form.followUpDate;
    const rollback =
      opts?.rollback ??
      isClearanceRollback(clearanceStatus, targetStatus);

    // Same pattern as Schedule follow-up: reveal fields first, warn only on
    // a second attempt while the treatment plan is still empty.
    if (
      !rollback &&
      targetStatus === "under_treatment" &&
      !form.treatmentSummary.trim()
    ) {
      if (!showTreatmentFields) {
        openTreatmentPlanner();
        return;
      }
      setError("Treatment summary is required before starting treatment.");
      return;
    }

    if (!rollback && targetStatus === "follow_up_required") {
      const dateErr = validateIsoDate(followUpDate, {
        required: true,
        label: "Follow-up date",
        notBeforeToday: true,
        min: followUpBounds.min,
        max: followUpBounds.max,
      });
      if (dateErr) {
        setShowFollowUpFields(true);
        setCalendarOpen(true);
        setDateError(dateErr);
        setError(null);
        return;
      }
      // Already scheduled for this day - do not re-save or rewrite the date.
      if (
        clearanceStatus === "follow_up_required" &&
        followUpDate === baselineFollowUpDate
      ) {
        setDateError(null);
        setError(null);
        return;
      }
      setDateError(null);
    }

    if (
      !rollback &&
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
    const payload = { ...form, generalCondition, followUpDate };

    if (rollback) {
      setDateError(null);
      setError(null);
    }

    await run(
      () =>
        updateMedicalClearanceAction(animalId, {
          generalCondition: payload.generalCondition,
          medicalPriority: payload.medicalPriority,
          treatmentSummary: payload.treatmentSummary,
          restrictions: payload.restrictions,
          // Only send follow-up when staying on / moving to follow-up.
          // Leaving follow-up via Correct status must not re-validate a stale date.
          followUpDate:
            targetStatus === "follow_up_required"
              ? followUpDate || undefined
              : undefined,
          clearanceStatus: targetStatus,
          veterinarianNotes: payload.veterinarianNotes,
          statusChangeNote: rollback
            ? `Corrected from ${formatStatus(clearanceStatus)}.`
            : undefined,
        }),
      {
        rewarm: [
          `/animals/${animalId}`,
          "/animals",
          "/medical",
          "/dashboard",
          "/adoption",
        ],
        onSuccess: () => {
          if (targetStatus === "follow_up_required" && followUpDate) {
            setBaselineFollowUpDate(followUpDate);
            setForm((prev) => ({ ...prev, followUpDate }));
            setAutoSubmitOnPick(false);
          }
          if (
            rollback &&
            clearanceStatus === "follow_up_required" &&
            targetStatus !== "follow_up_required"
          ) {
            setBaselineFollowUpDate("");
            setForm((prev) => ({ ...prev, followUpDate: "" }));
            setShowFollowUpFields(false);
          }
          setRollbackTarget(null);
        },
      },
    );
  }

  function openFollowUpScheduler() {
    setAutoSubmitOnPick(true);
    setShowFollowUpFields(true);
    setError(null);
    setDateError(null);
    setCalendarOpen(true);
  }

  function handleFollowUpDateChange(iso: string) {
    setForm((prev) => ({ ...prev, followUpDate: iso }));
    const err = validateIsoDate(iso, {
      required: true,
      label: "Follow-up date",
      notBeforeToday: true,
      min: followUpBounds.min,
      max: followUpBounds.max,
    });
    setDateError(err);
    if (!err && iso && autoSubmitOnPick) {
      setAutoSubmitOnPick(false);
      void submitStatus("follow_up_required", iso);
    }
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
            onClick={() => {
              if (!form.treatmentSummary.trim() && !showTreatmentFields) {
                openTreatmentPlanner();
                return;
              }
              void submitStatus("under_treatment");
            }}
          >
            {loading
              ? "Saving..."
              : showTreatmentFields && !form.treatmentSummary.trim()
                ? "Confirm treatment"
                : "Needs treatment"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            variant="secondary"
            size="sm"
            onClick={openFollowUpScheduler}
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
            onClick={() => {
              if (!form.treatmentSummary.trim() && !showTreatmentFields) {
                openTreatmentPlanner();
                return;
              }
              void submitStatus("under_treatment");
            }}
          >
            {loading
              ? "Saving..."
              : showTreatmentFields && !form.treatmentSummary.trim()
                ? "Confirm treatment"
                : "Needs treatment"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full"
            variant="secondary"
            size="sm"
            onClick={openFollowUpScheduler}
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
            onClick={openFollowUpScheduler}
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
            onClick={() => {
              if (!form.treatmentSummary.trim() && !showTreatmentFields) {
                openTreatmentPlanner();
                return;
              }
              void submitStatus("under_treatment");
            }}
          >
            {loading
              ? "Saving..."
              : showTreatmentFields && !form.treatmentSummary.trim()
                ? "Confirm treatment"
                : "Resume treatment"}
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
              ref={treatmentInputRef}
              value={form.treatmentSummary}
              onChange={(e) =>
                setForm({ ...form, treatmentSummary: e.target.value })
              }
              placeholder="Treatment provided or planned"
              rows={isPanel ? 2 : 3}
              className={cn(isPanel && "min-h-0 resize-none text-sm")}
            />
            {!form.treatmentSummary.trim() ? (
              <p className="text-[11px] text-graphite/50">
                Add the treatment plan, then confirm to move this animal under
                treatment.
              </p>
            ) : null}
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
        <div className="space-y-1.5 rounded-lg border border-sage/25 bg-bone/40 p-2.5">
          <DatePicker
            id="medical-follow-up-date"
            label="Follow-up date"
            value={form.followUpDate}
            onChange={handleFollowUpDateChange}
            open={calendarOpen}
            onOpenChange={setCalendarOpen}
            notBeforeToday
            min={followUpBounds.min}
            max={followUpBounds.max}
            required
            disabled={loading}
            placeholder="Pick follow-up day"
            error={followUpDisplayError}
          />
          <p className="text-[11px] text-graphite/50">
            {baselineFollowUpDate
              ? "Change the day above to reschedule. Confirm stays off until the date changes."
              : "Choose a day from today through the next 12 months. Selecting a day schedules the follow-up."}
          </p>
          {followUpDirty && !autoSubmitOnPick ? (
            <Button
              type="button"
              size="sm"
              className="w-full"
              disabled={loading || Boolean(dateError)}
              onClick={() => void submitStatus("follow_up_required")}
            >
              {loading ? "Saving..." : "Confirm follow-up"}
            </Button>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-xs text-rescue">{error}</p> : null}
      {actionButtons}
      <StatusRollbackSection
        options={rollbackOptions}
        loading={loading}
        onSelect={setRollbackTarget}
      />
    </>
  );

  const rollbackDialog = (
    <ConfirmDialog
      open={rollbackTarget !== null}
      title={rollbackTarget?.title ?? ""}
      message={rollbackTarget?.message}
      confirmLabel={rollbackTarget?.confirmLabel ?? "Confirm"}
      variant="danger"
      pending={loading}
      onConfirm={() => {
        if (!rollbackTarget) return;
        void submitStatus(rollbackTarget.target, undefined, { rollback: true });
      }}
      onClose={() => setRollbackTarget(null)}
    />
  );

  if (clearanceStatus === "medically_cleared") {
    const clearedBody = (
      <div className="space-y-2 text-sm">
        <StatusBadge status="medically_cleared" size="sm" />
        <p className="text-xs leading-relaxed text-graphite/70">
          Medical clearance is complete. Use Transfer to adoption on the Medical
          workspace, or set Adoption ready / Foster ready on the animal profile.
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
        <StatusRollbackSection
          options={rollbackOptions}
          loading={loading}
          onSelect={setRollbackTarget}
        />
      </div>
    );

    if (isPanel || isWorkspace) {
      return (
        <>
          <div className="flex flex-col">
            <FormHeader variant={variant} />
            <div className="p-3">{clearedBody}</div>
          </div>
          {rollbackDialog}
        </>
      );
    }

    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Medical clearance</CardTitle>
          </CardHeader>
          <CardContent>{clearedBody}</CardContent>
        </Card>
        {rollbackDialog}
      </>
    );
  }

  if (isPanel || isWorkspace) {
    return (
      <>
        <div className="flex flex-col">
          <FormHeader variant={variant} status={clearanceStatus} />
          <div className={cn("space-y-2.5", isWorkspace ? "p-3.5" : "p-3")}>
            {formFields}
          </div>
        </div>
        {rollbackDialog}
      </>
    );
  }

  return (
    <>
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
      {rollbackDialog}
    </>
  );
}

function StatusRollbackSection({
  options,
  loading,
  onSelect,
}: {
  options: ClearanceRollbackOption[];
  loading: boolean;
  onSelect: (option: ClearanceRollbackOption) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 border-t border-sage/20 pt-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
        Correct status
      </p>
      <p className="text-[11px] leading-relaxed text-graphite/50">
        Use if the workflow stage was set by mistake. Clinical notes and exam
        records are kept; a correction note is added to the animal file.
      </p>
      {options.map((option) => (
        <Button
          key={option.target}
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-sage/35 text-graphite/75 hover:border-rescue/30 hover:bg-rescue/5 hover:text-rescue"
          disabled={loading}
          onClick={() => onSelect(option)}
        >
          {option.confirmLabel}
        </Button>
      ))}
    </div>
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
