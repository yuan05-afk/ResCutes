"use client";

import { useState } from "react";
import { AdminModal } from "@/components/admin/AdminModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectWithOtherSplit } from "@/components/ui/select-with-other";
import { useActionPending } from "@/components/shared/useActionPending";
import { submitAdoptionApplicationAction } from "@/app/actions/adoption";
import { toast } from "@/components/ui/toast";
import type { AnimalRecord } from "@/lib/data/types";
import {
  HOME_TYPE_OPTIONS,
  resolveSelectOther,
  validateEmail,
  validateOptionalText,
  validatePhoneRequired,
  validateSelectOther,
  validateSocialLinkOptional,
} from "@/lib/forms/animal-field-options";

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
  const [socialLink, setSocialLink] = useState("");
  const [applicantCity, setApplicantCity] = useState("");
  const [homeChoice, setHomeChoice] = useState("house");
  const [homeOther, setHomeOther] = useState("");
  const [hasYard, setHasYard] = useState(false);
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [householdSize, setHouseholdSize] = useState(1);
  const [experienceNotes, setExperienceNotes] = useState("");
  const [motivation, setMotivation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function reset() {
    setApplicantName("");
    setApplicantEmail("");
    setApplicantPhone("");
    setSocialLink("");
    setApplicantCity("");
    setHomeChoice("house");
    setHomeOther("");
    setHasYard(false);
    setHasOtherPets(false);
    setHouseholdSize(1);
    setExperienceNotes("");
    setMotivation("");
    setFieldErrors({});
    setError(null);
  }

  function handleClose() {
    if (pending) return;
    reset();
    onClose();
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    const nameErr = validateOptionalText("Applicant name", applicantName, {
      minLen: 2,
      maxLen: 100,
    });
    if (!applicantName.trim()) next.name = "Applicant name is required.";
    else if (nameErr) next.name = nameErr;

    const emailErr = validateEmail(applicantEmail);
    if (emailErr) next.email = emailErr;

    const phoneErr = validatePhoneRequired(applicantPhone);
    if (phoneErr) next.phone = phoneErr;

    const socialErr = validateSocialLinkOptional(socialLink);
    if (socialErr) next.social = socialErr;

    if (!applicantCity.trim()) next.city = "City / area is required.";
    else {
      const cityErr = validateOptionalText("City / area", applicantCity, {
        minLen: 2,
        maxLen: 80,
      });
      if (cityErr) next.city = cityErr;
    }

    const homeErr = validateSelectOther("Home type", homeChoice, homeOther, {
      required: true,
    });
    if (homeErr) next.home = homeErr;

    if (!Number.isFinite(householdSize) || householdSize < 1 || householdSize > 30) {
      next.household = "Household size must be between 1 and 30.";
    }

    const expErr = validateOptionalText("Experience notes", experienceNotes, {
      maxLen: 1000,
    });
    if (expErr) next.experience = expErr;

    if (!motivation.trim()) next.motivation = "Motivation is required.";
    else {
      const motErr = validateOptionalText("Motivation", motivation, {
        minLen: 10,
        maxLen: 2000,
      });
      if (motErr) next.motivation = motErr;
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!animal) return;
    setError(null);
    if (!validate()) {
      setError("Fix the highlighted fields before submitting.");
      return;
    }
    const homeType = resolveSelectOther(homeChoice, homeOther) ?? "house";
    const ok = await run(
      () =>
        submitAdoptionApplicationAction({
          animalId: animal.id,
          applicantName,
          applicantEmail,
          applicantPhone,
          socialLink: socialLink || undefined,
          applicantCity,
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
            <Label htmlFor="applicant-name">
              Full name <span className="text-rescue">*</span>
            </Label>
            <Input
              id="applicant-name"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              className="h-9"
              maxLength={100}
            />
            {fieldErrors.name ? (
              <p className="text-[11px] text-rescue">{fieldErrors.name}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="applicant-email">
              Email <span className="text-rescue">*</span>
            </Label>
            <Input
              id="applicant-email"
              type="email"
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
              className="h-9"
            />
            {fieldErrors.email ? (
              <p className="text-[11px] text-rescue">{fieldErrors.email}</p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="applicant-phone">
              Phone <span className="text-rescue">*</span>
            </Label>
            <Input
              id="applicant-phone"
              value={applicantPhone}
              onChange={(e) => setApplicantPhone(e.target.value)}
              className="h-9"
              placeholder="+63…"
              maxLength={20}
              inputMode="tel"
              autoComplete="tel"
            />
            {fieldErrors.phone ? (
              <p className="text-[11px] text-rescue">{fieldErrors.phone}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="social-link">Social profile (optional)</Label>
            <Input
              id="social-link"
              value={socialLink}
              onChange={(e) => setSocialLink(e.target.value)}
              className="h-9"
              placeholder="Facebook / Instagram URL or @handle"
              maxLength={200}
              autoComplete="url"
            />
            {fieldErrors.social ? (
              <p className="text-[11px] text-rescue">{fieldErrors.social}</p>
            ) : null}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="applicant-city">
            City / area <span className="text-rescue">*</span>
          </Label>
          <Input
            id="applicant-city"
            value={applicantCity}
            onChange={(e) => setApplicantCity(e.target.value)}
            className="h-9"
            placeholder="e.g. Quezon City, Marikina"
            maxLength={80}
            autoComplete="address-level2"
          />
          {fieldErrors.city ? (
            <p className="text-[11px] text-rescue">{fieldErrors.city}</p>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectWithOtherSplit
            id="home-type"
            label="Home type"
            options={HOME_TYPE_OPTIONS}
            choice={homeChoice}
            other={homeOther}
            onChoiceChange={setHomeChoice}
            onOtherChange={setHomeOther}
            required
            error={fieldErrors.home}
          />
          <div className="space-y-1.5">
            <Label htmlFor="household-size">Household size</Label>
            <Input
              id="household-size"
              type="number"
              min={1}
              max={30}
              value={householdSize}
              onChange={(e) => setHouseholdSize(Number(e.target.value) || 1)}
              className="h-9"
            />
            {fieldErrors.household ? (
              <p className="text-[11px] text-rescue">{fieldErrors.household}</p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-2 text-sm text-graphite">
            <input
              type="checkbox"
              checked={hasYard}
              onChange={(e) => setHasYard(e.target.checked)}
              className="rounded border-sage/40"
            />
            Has yard / outdoor space
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm text-graphite">
            <input
              type="checkbox"
              checked={hasOtherPets}
              onChange={(e) => setHasOtherPets(e.target.checked)}
              className="rounded border-sage/40"
            />
            Other pets at home
          </label>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="experience-notes">Experience notes (optional)</Label>
          <Textarea
            id="experience-notes"
            rows={2}
            value={experienceNotes}
            onChange={(e) => setExperienceNotes(e.target.value)}
            className="resize-none text-sm"
            maxLength={1000}
          />
          {fieldErrors.experience ? (
            <p className="text-[11px] text-rescue">{fieldErrors.experience}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="motivation">
            Why this animal? <span className="text-rescue">*</span>
          </Label>
          <Textarea
            id="motivation"
            rows={3}
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            className="resize-none text-sm"
            maxLength={2000}
            placeholder="Short note for shelter staff (min 10 characters)"
          />
          {fieldErrors.motivation ? (
            <p className="text-[11px] text-rescue">{fieldErrors.motivation}</p>
          ) : null}
        </div>
        <p className="text-[11px] text-graphite/50">
          Applications stay pending until shelter staff approve. Animals are
          not placed until review is complete.
        </p>
      </div>
    </AdminModal>
  );
}
