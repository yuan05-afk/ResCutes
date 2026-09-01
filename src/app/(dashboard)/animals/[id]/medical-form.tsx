"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateMedicalClearanceAction } from "@/app/actions/case";

const CLEARANCE_STATUSES = [
  "awaiting_examination",
  "under_examination",
  "under_treatment",
  "follow_up_required",
  "medically_cleared",
];

const PRIORITIES = ["routine", "urgent", "emergency"];

interface MedicalClearanceFormProps {
  animalId: string;
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
  clearance,
}: MedicalClearanceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    generalCondition: clearance?.generalCondition ?? "",
    medicalPriority: clearance?.medicalPriority ?? "routine",
    treatmentSummary: clearance?.treatmentSummary ?? "",
    restrictions: clearance?.restrictions ?? "",
    clearanceStatus: clearance?.clearanceStatus ?? "awaiting_examination",
    veterinarianNotes: clearance?.veterinarianNotes ?? "",
    followUpDate: clearance?.followUpDate?.split("T")[0] ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await updateMedicalClearanceAction(animalId, {
      examinationDate: new Date().toISOString(),
      generalCondition: form.generalCondition,
      medicalPriority: form.medicalPriority,
      treatmentSummary: form.treatmentSummary,
      restrictions: form.restrictions,
      followUpDate: form.followUpDate
        ? new Date(form.followUpDate).toISOString()
        : undefined,
      clearanceStatus: form.clearanceStatus,
      veterinarianNotes: form.veterinarianNotes,
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Update Medical Clearance</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>General Condition</Label>
            <Textarea
              value={form.generalCondition}
              onChange={(e) =>
                setForm({ ...form, generalCondition: e.target.value })
              }
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
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Treatment Summary</Label>
            <Textarea
              value={form.treatmentSummary}
              onChange={(e) =>
                setForm({ ...form, treatmentSummary: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Restrictions</Label>
            <Textarea
              value={form.restrictions}
              onChange={(e) =>
                setForm({ ...form, restrictions: e.target.value })
              }
            />
          </div>
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
          <div className="space-y-1">
            <Label>Clearance Status</Label>
            <Select
              value={form.clearanceStatus}
              onChange={(e) =>
                setForm({ ...form, clearanceStatus: e.target.value })
              }
            >
              {CLEARANCE_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
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
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Medical Record"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
