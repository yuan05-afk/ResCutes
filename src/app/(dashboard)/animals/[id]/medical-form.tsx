"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import { useActionPending } from "@/components/shared/useActionPending";
import { updateMedicalClearanceAction } from "@/app/actions/case";
import type { ClearanceStatus } from "@/lib/data/service";
import { formatStatus } from "@/lib/utils";

const PRIORITIES = ["routine", "urgent", "emergency"];

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
}

export function MedicalClearanceForm({
  animalId,
  clearanceStatus,
  clearance,
}: MedicalClearanceFormProps) {
  const { pending: loading, error, setError, run } = useActionPending();
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

    if (
      targetStatus === "follow_up_required" &&
      !showFollowUpFields
    ) {
      setShowFollowUpFields(true);
      setError("Set a follow-up date below, then submit again.");
      return;
    }

    setError(null);

    await run(
      () =>
        updateMedicalClearanceAction(animalId, {
          generalCondition: form.generalCondition,
          medicalPriority: form.medicalPriority,
          treatmentSummary: form.treatmentSummary,
          restrictions: form.restrictions,
          followUpDate: form.followUpDate
            ? new Date(form.followUpDate).toISOString()
            : undefined,
          clearanceStatus: targetStatus,
          veterinarianNotes: form.veterinarianNotes,
        }),
      { rewarm: [`/animals/${animalId}`, "/animals", "/dashboard"] },
    );
  }

  function handleScheduleFollowUp() {
    setShowFollowUpFields(true);
    submitStatus("follow_up_required");
  }

  if (clearanceStatus === "medically_cleared") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Veterinary Actions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <StatusBadge status="medically_cleared" size="md" />
          <p className="text-graphite/70">
            Medical clearance is complete. Further veterinary edits are locked.
          </p>
        </CardContent>
      </Card>
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
          <div className="space-y-1">
            <Label>General Condition</Label>
            <Textarea
              value={form.generalCondition}
              onChange={(e) =>
                setForm({ ...form, generalCondition: e.target.value })
              }
              placeholder="Examination findings and overall condition"
            />
          </div>
          <div className="space-y-1">
            <Label>Medical Priority</Label>
            <Select
              value={form.medicalPriority}
              onChange={(e) =>
                setForm({ ...form, medicalPriority: e.target.value })
              }
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{formatStatus(p)}</option>
              ))}
            </Select>
          </div>
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

          {showTreatmentFields && (
            <>
              <div className="space-y-1">
                <Label>Treatment Summary</Label>
                <Textarea
                  value={form.treatmentSummary}
                  onChange={(e) =>
                    setForm({ ...form, treatmentSummary: e.target.value })
                  }
                  placeholder="Treatment provided or planned"
                />
              </div>
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
            </>
          )}

          {showFollowUpFields && (
            <div className="space-y-1">
              <Label>Follow-up Date</Label>
              <Input
                type="date"
                value={form.followUpDate}
                onChange={(e) =>
                  setForm({ ...form, followUpDate: e.target.value })
                }
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-rescue">{error}</p>
          )}

          <div className="space-y-2 pt-2">
            {clearanceStatus === "awaiting_examination" && (
              <>
                <Button
                  type="button"
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                  onClick={() => submitStatus("under_examination")}
                >
                  {loading ? "Saving..." : "Start Examination"}
                </Button>
                <Button
                  type="button"
                  disabled={loading}
                  className="w-full"
                  onClick={() => submitStatus("under_treatment")}
                >
                  {loading ? "Saving..." : "Record Examination — Requires Treatment"}
                </Button>
                <Button
                  type="button"
                  disabled={loading}
                  className="w-full"
                  variant="secondary"
                  onClick={() => submitStatus("follow_up_required")}
                >
                  {loading ? "Saving..." : "Record Examination — Follow-Up Required"}
                </Button>
              </>
            )}

            {clearanceStatus === "under_examination" && (
              <>
                <Button
                  type="button"
                  disabled={loading}
                  className="w-full"
                  onClick={() => submitStatus("under_treatment")}
                >
                  {loading ? "Saving..." : "Requires Treatment"}
                </Button>
                <Button
                  type="button"
                  disabled={loading}
                  className="w-full"
                  variant="secondary"
                  onClick={() => submitStatus("follow_up_required")}
                >
                  {loading ? "Saving..." : "Follow-Up Required"}
                </Button>
                <Button
                  type="button"
                  disabled={loading}
                  className="w-full"
                  variant="outline"
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
                  onClick={handleScheduleFollowUp}
                >
                  {loading ? "Saving..." : "Schedule Follow-Up"}
                </Button>
                <Button
                  type="button"
                  disabled={loading}
                  className="w-full"
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
                  onClick={() => submitStatus("under_treatment")}
                >
                  {loading ? "Saving..." : "Resume Treatment"}
                </Button>
                <Button
                  type="button"
                  disabled={loading}
                  className="w-full"
                  onClick={() => submitStatus("medically_cleared")}
                >
                  {loading ? "Saving..." : "Mark Medically Cleared"}
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
