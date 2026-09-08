"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SelectWithOtherSplit } from "@/components/ui/select-with-other";
import { useActionPending } from "@/components/shared/useActionPending";
import { createAnimalAction } from "@/app/actions/adoption";
import {
  ANIMAL_AGE_OPTIONS,
  ANIMAL_SEX_OPTIONS,
  COAT_COLOR_OPTIONS,
  PATHWAY_STAGE_OPTIONS,
  REPORT_SPECIES,
  breedOptionsForSpecies,
  resolveSelectOther,
  validateRequiredAnimalName,
  validateSelectOther,
  validateOptionalText,
} from "@/lib/forms/animal-field-options";
import { formatStatus } from "@/lib/utils";

interface ShelterOption {
  id: string;
  name: string;
}

export function CreateAnimalForm({ shelters }: { shelters: ShelterOption[] }) {
  const router = useRouter();
  const { pending, error, setError, run } = useActionPending();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<string>("dog");
  const [pathwayStage, setPathwayStage] = useState("intake");
  const [shelterId, setShelterId] = useState("");
  const [bio, setBio] = useState("");
  const [sexChoice, setSexChoice] = useState("unknown");
  const [sexOther, setSexOther] = useState("");
  const [ageChoice, setAgeChoice] = useState("unknown");
  const [ageOther, setAgeOther] = useState("");
  const [breedChoice, setBreedChoice] = useState("");
  const [breedOther, setBreedOther] = useState("");
  const [colorChoice, setColorChoice] = useState("");
  const [colorOther, setColorOther] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const breedOpts = useMemo(() => breedOptionsForSpecies(species), [species]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const next: Record<string, string> = {};
    const nameErr = validateRequiredAnimalName(name);
    if (nameErr) next.name = nameErr;
    const sexErr = validateSelectOther("Sex", sexChoice, sexOther);
    if (sexErr) next.sex = sexErr;
    const ageErr = validateSelectOther("Age", ageChoice, ageOther);
    if (ageErr) next.age = ageErr;
    const breedErr = validateSelectOther("Breed", breedChoice, breedOther);
    if (breedErr) next.breed = breedErr;
    const colorErr = validateSelectOther("Color", colorChoice, colorOther);
    if (colorErr) next.color = colorErr;
    const bioErr = validateOptionalText("Bio", bio, { maxLen: 2000 });
    if (bioErr) next.bio = bioErr;
    setFieldErrors(next);
    if (Object.keys(next).length > 0) {
      setError("Fix the highlighted fields before creating.");
      return;
    }

    const ok = await run(async () => {
      const result = await createAnimalAction({
        name: name.trim(),
        species,
        sex: resolveSelectOther(sexChoice, sexOther),
        estimatedAge: resolveSelectOther(ageChoice, ageOther),
        breed: resolveSelectOther(breedChoice, breedOther),
        color: resolveSelectOther(colorChoice, colorOther),
        bio: bio.trim() || null,
        pathwayStage,
        shelterId: shelterId || null,
      });
      if (result.error) return { error: result.error };
      if (result.animalId) {
        router.push(`/animals/${result.animalId}`);
      }
      return { success: true };
    });
    if (!ok) return;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl space-y-4 rounded-xl border border-sage/25 bg-white p-4 shadow-card sm:p-6"
    >
      <div className="space-y-1.5">
        <Label htmlFor="animal-name">Name</Label>
        <Input
          id="animal-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (fieldErrors.name && e.target.value.trim()) {
              setFieldErrors((prev) => {
                const { name: _n, ...rest } = prev;
                return rest;
              });
            }
          }}
          placeholder="e.g. Rocky"
          className="h-10"
          required
          aria-invalid={Boolean(fieldErrors.name)}
        />
        {fieldErrors.name ? (
          <p className="text-xs text-rescue" role="alert">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="animal-species">Species</Label>
          <Select
            id="animal-species"
            value={species}
            onChange={(e) => {
              setSpecies(e.target.value);
              setBreedChoice("");
              setBreedOther("");
            }}
          >
            {REPORT_SPECIES.map((s) => (
              <option key={s} value={s}>
                {formatStatus(s)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="animal-pathway">Pathway</Label>
          <Select
            id="animal-pathway"
            value={pathwayStage}
            onChange={(e) => setPathwayStage(e.target.value)}
          >
            {PATHWAY_STAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectWithOtherSplit
          id="create-sex"
          label="Sex"
          options={ANIMAL_SEX_OPTIONS}
          choice={sexChoice}
          other={sexOther}
          onChoiceChange={setSexChoice}
          onOtherChange={setSexOther}
          error={fieldErrors.sex}
        />
        <SelectWithOtherSplit
          id="create-age"
          label="Age"
          options={ANIMAL_AGE_OPTIONS}
          choice={ageChoice}
          other={ageOther}
          onChoiceChange={setAgeChoice}
          onOtherChange={setAgeOther}
          error={fieldErrors.age}
        />
        <SelectWithOtherSplit
          id="create-breed"
          label="Breed"
          options={breedOpts}
          choice={breedChoice}
          other={breedOther}
          onChoiceChange={setBreedChoice}
          onOtherChange={setBreedOther}
          error={fieldErrors.breed}
        />
        <SelectWithOtherSplit
          id="create-color"
          label="Color"
          options={COAT_COLOR_OPTIONS}
          choice={colorChoice}
          other={colorOther}
          onChoiceChange={setColorChoice}
          onOtherChange={setColorOther}
          error={fieldErrors.color}
        />
      </div>

      {shelters.length > 0 ? (
        <div className="space-y-1.5">
          <Label htmlFor="animal-shelter">Shelter (optional)</Label>
          <Select
            id="animal-shelter"
            value={shelterId}
            onChange={(e) => setShelterId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {shelters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="animal-bio">Bio (optional)</Label>
        <Textarea
          id="animal-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="resize-none"
        />
        {fieldErrors.bio ? (
          <p className="text-xs text-rescue">{fieldErrors.bio}</p>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-rescue" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create animal"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/animals">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
