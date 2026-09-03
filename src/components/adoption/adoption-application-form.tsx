"use client";

import { useState } from "react";
import { AdminModal } from "@/components/admin/AdminModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionPending } from "@/components/shared/useActionPending";
import { submitAdoptionApplicationAction } from "@/app/actions/adoption";
import { toast } from "@/components/ui/toast";
import type { AnimalRecord } from "@/lib/data/types";

interface AdoptionApplicationFormProps {
  open: boolean;
  animal: AnimalRecord | null;
  onClose: () => void;
}

export function AdoptionApplicationForm({
  open,
  animal,
  onClose,
}: AdoptionApplicationFormProps) {
  const { pending, error, setError, run } = useActionPending();
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [homeType, setHomeType] = useState("house");
  const [hasYard, setHasYard] = useState(false);
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [householdSize, setHouseholdSize] = useState(1);
  const [experienceNotes, setExperienceNotes] = useState("");
  const [motivation, setMotivation] = useState("");

  function reset() {
    setApplicantName("");
    setApplicantEmail("");
    setApplicantPhone("");
    setHomeType("house");
    setHasYard(false);
    setHasOtherPets(false);
    setHouseholdSize(1);
    setExperienceNotes("");
    setMotivation("");
    setError(null);
  }

  function handleClose() {
    if (pending) return;
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!animal) return;
    const ok = await run(
      () =>
        submitAdoptionApplicationAction({
          animalId: animal.id,
          applicantName,
          applicantEmail,
          applicantPhone: applicantPhone || undefined,
          homeType,
          hasYard,
          hasOtherPets,
          householdSize,
          experienceNotes: experienceNotes || undefined,
          motivation,
        }),
      {
        rewarm: ["/adoption", "/animals"],
        onSuccess: () => {
          toast("Adoption application logged");
          reset();
          onClose();
        },
      },
    );
    if (!ok) return;
  }

  return (
    <AdminModal
      open={open}
      onClose={handleClose}
      title="Log adoption application"
      description={
        animal
          ? `Walk-in or phone application for ${animal.name ?? animal.temporaryId}`
          : undefined
      }
      size="md"
      placement="center"
      fitViewport={false}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={pending}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => void handleSubmit()} disabled={pending || !animal}>
            {pending ? "Submitting..." : "Submit application"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {error ? (
          <p className="rounded-lg border border-rescue/25 bg-rescue/8 px-2.5 py-2 text-xs text-rescue">
            {error}
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="applicant-name">Applicant name</Label>
            <Input
              id="applicant-name"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="applicant-email">Email</Label>
            <Input
              id="applicant-email"
              type="email"
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="applicant-phone">Phone</Label>
            <Input
              id="applicant-phone"
              value={applicantPhone}
              onChange={(e) => setApplicantPhone(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="home-type">Home type</Label>
            <Select
              id="home-type"
              value={homeType}
              onChange={(e) => setHomeType(e.target.value)}
              className="h-9"
            >
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="other">Other</option>
            </Select>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm text-graphite">
            <input
              type="checkbox"
              checked={hasYard}
              onChange={(e) => setHasYard(e.target.checked)}
              className="rounded border-sage/40"
            />
            Has yard
          </label>
          <label className="flex items-center gap-2 text-sm text-graphite">
            <input
              type="checkbox"
              checked={hasOtherPets}
              onChange={(e) => setHasOtherPets(e.target.checked)}
              className="rounded border-sage/40"
            />
            Other pets
          </label>
          <div className="space-y-1.5">
            <Label htmlFor="household-size">Household size</Label>
            <Input
              id="household-size"
              type="number"
              min={1}
              value={householdSize}
              onChange={(e) => setHouseholdSize(Number(e.target.value) || 1)}
              className="h-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="experience-notes">Experience notes</Label>
          <Textarea
            id="experience-notes"
            rows={2}
            value={experienceNotes}
            onChange={(e) => setExperienceNotes(e.target.value)}
            className="resize-none text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="motivation">Motivation</Label>
          <Textarea
            id="motivation"
            rows={3}
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            className="resize-none text-sm"
          />
        </div>
      </div>
    </AdminModal>
  );
}
