"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectWithOtherSplit } from "@/components/ui/select-with-other";
import { useActionPending } from "@/components/shared/useActionPending";
import { completeShelterIntakeAction } from "@/app/actions/case";
import { formatStatus } from "@/lib/utils";
import {
  ANIMAL_AGE_OPTIONS,
  ANIMAL_SEX_OPTIONS,
  COAT_COLOR_OPTIONS,
  breedOptionsForSpecies,
  resolveSelectOther,
  validateOptionalText,
  validateSelectOther,
} from "@/lib/forms/animal-field-options";

interface CaseIntakeFormProps {
  caseId: string;
  species: string;
  temporaryId: string;
  injurySeverity: string;
}

export function CaseIntakeForm({
  caseId,
  species,
  temporaryId,
  injurySeverity,
}: CaseIntakeFormProps) {
  const {
    pending: loading,
    error: actionError,
    setError: setActionError,
    run,
  } = useActionPending();
  const [name, setName] = useState("");
  const [sexChoice, setSexChoice] = useState("unknown");
  const [sexOther, setSexOther] = useState("");
  const [ageChoice, setAgeChoice] = useState("unknown");
  const [ageOther, setAgeOther] = useState("");
  const breedOpts = useMemo(() => breedOptionsForSpecies(species), [species]);
  const [breedChoice, setBreedChoice] = useState("");
  const [breedOther, setBreedOther] = useState("");
  const [colorChoice, setColorChoice] = useState("");
  const [colorOther, setColorOther] = useState("");
  const [initialCondition, setInitialCondition] = useState(
    `Reported injury level: ${formatStatus(injurySeverity)}`,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    const sexErr = validateSelectOther("Sex", sexChoice, sexOther, {
      required: true,
    });
    if (sexErr) next.sex = sexErr;
    const ageErr = validateSelectOther("Age", ageChoice, ageOther);
    if (ageErr) next.age = ageErr;
    const breedErr = validateSelectOther("Breed", breedChoice, breedOther);
    if (breedErr) next.breed = breedErr;
    const colorErr = validateSelectOther("Color", colorChoice, colorOther);
    if (colorErr) next.color = colorErr;
    const nameErr = validateOptionalText("Name", name, { maxLen: 80 });
    if (nameErr) next.name = nameErr;
    const condErr = validateOptionalText("Initial condition", initialCondition, {
      maxLen: 2000,
    });
    if (condErr) next.condition = condErr;
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    setActionError(null);
    if (!validate()) {
      setActionError("Fix the highlighted fields before completing intake.");
      return;
    }
    await run(
      () =>
        completeShelterIntakeAction(caseId, {
          name: name.trim() || undefined,
          estimatedAge:
            resolveSelectOther(ageChoice, ageOther) ?? undefined,
          sex: resolveSelectOther(sexChoice, sexOther) ?? undefined,
          breed: resolveSelectOther(breedChoice, breedOther) ?? undefined,
          color: resolveSelectOther(colorChoice, colorOther) ?? undefined,
          initialCondition: initialCondition.trim() || undefined,
        }),
      { rewarm: [`/rescue-cases/${caseId}`, "/animals", "/dashboard"] },
    );
  }

  return (
    <div className="space-y-3 border-t border-sage/30 pt-4">
      <p className="text-xs font-medium text-graphite/70">Shelter Intake</p>
      {actionError && (
        <p className="rounded-lg border border-rescue/20 bg-rescue/5 px-3 py-2 text-sm text-rescue">
          {actionError}
        </p>
      )}
      <div className="space-y-2 text-sm">
        <div>
          <Label className="text-graphite/60">Animal ID</Label>
          <p className="font-medium">{temporaryId}</p>
        </div>
        <div>
          <Label className="text-graphite/60">Species</Label>
          <p className="font-medium capitalize">{species}</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="intake-name">Name (optional)</Label>
          <Input
            id="intake-name"
            placeholder="Leave blank until named"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
          {fieldErrors.name ? (
            <p className="text-[11px] text-rescue">{fieldErrors.name}</p>
          ) : null}
        </div>
        <SelectWithOtherSplit
          id="intake-age"
          label="Estimated age"
          options={ANIMAL_AGE_OPTIONS}
          choice={ageChoice}
          other={ageOther}
          onChoiceChange={setAgeChoice}
          onOtherChange={setAgeOther}
          placeholder="Select age"
          error={fieldErrors.age}
        />
        <SelectWithOtherSplit
          id="intake-sex"
          label="Sex"
          options={ANIMAL_SEX_OPTIONS}
          choice={sexChoice}
          other={sexOther}
          onChoiceChange={setSexChoice}
          onOtherChange={setSexOther}
          placeholder="Select sex"
          required
          error={fieldErrors.sex}
        />
        <SelectWithOtherSplit
          id="intake-breed"
          label="Breed"
          options={breedOpts}
          choice={breedChoice}
          other={breedOther}
          onChoiceChange={setBreedChoice}
          onOtherChange={setBreedOther}
          placeholder="Select breed"
          error={fieldErrors.breed}
        />
        <SelectWithOtherSplit
          id="intake-color"
          label="Color / appearance"
          options={COAT_COLOR_OPTIONS}
          choice={colorChoice}
          other={colorOther}
          onChoiceChange={setColorChoice}
          onOtherChange={setColorOther}
          placeholder="Select color"
          error={fieldErrors.color}
        />
        <div className="space-y-1">
          <Label htmlFor="intake-condition">Initial condition</Label>
          <Textarea
            id="intake-condition"
            value={initialCondition}
            onChange={(e) => setInitialCondition(e.target.value)}
            maxLength={2000}
          />
          {fieldErrors.condition ? (
            <p className="text-[11px] text-rescue">{fieldErrors.condition}</p>
          ) : null}
        </div>
      </div>
      <Button onClick={() => void handleSubmit()} disabled={loading} className="w-full">
        Complete Intake
      </Button>
    </div>
  );
}
