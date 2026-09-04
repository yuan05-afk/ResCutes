"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ToastViewport, toast } from "@/components/ui/toast";
import { SelectWithOtherSplit } from "@/components/ui/select-with-other";
import {
  OptionPills,
  pillsToTemperament,
  temperamentToPills,
} from "@/components/ui/option-pills";
import { useActionPending } from "@/components/shared/useActionPending";
import {
  deleteAnimalAction,
  updateAnimalAction,
} from "@/app/actions/adoption";
import {
  ANIMAL_AGE_OPTIONS,
  ANIMAL_SEX_OPTIONS,
  COAT_COLOR_OPTIONS,
  PATHWAY_STAGE_OPTIONS,
  TEMPERAMENT_PILL_OPTIONS,
  OTHER_VALUE,
  breedOptionsForSpecies,
  isPathwayStage,
  resolveSelectOther,
  splitSelectOther,
  validateOptionalText,
  validateSelectOther,
} from "@/lib/forms/animal-field-options";
import { formatStatus } from "@/lib/utils";

interface AnimalProfileEditorProps {
  animal: {
    id: string;
    name?: string | null;
    temporaryId: string;
    species?: string | null;
    bio?: string | null;
    temperament?: string | null;
    pathwayStage: string;
    sex?: string | null;
    estimatedAge?: string | null;
    breed?: string | null;
    color?: string | null;
  };
}

export function AnimalProfileEditor({ animal }: AnimalProfileEditorProps) {
  const router = useRouter();
  const { pending, error, setError, run } = useActionPending();
  const [name, setName] = useState(animal.name ?? "");
  const [bio, setBio] = useState(animal.bio ?? "");
  const [pathwayStage, setPathwayStage] = useState(animal.pathwayStage);

  const sexInit = splitSelectOther(animal.sex, ANIMAL_SEX_OPTIONS);
  const ageInit = splitSelectOther(animal.estimatedAge, ANIMAL_AGE_OPTIONS);
  const breedOpts = useMemo(
    () => breedOptionsForSpecies(animal.species),
    [animal.species],
  );
  const breedInit = splitSelectOther(animal.breed, breedOpts);
  const colorInit = splitSelectOther(animal.color, COAT_COLOR_OPTIONS);

  const [sexChoice, setSexChoice] = useState(sexInit.choice || "unknown");
  const [sexOther, setSexOther] = useState(sexInit.other);
  const [ageChoice, setAgeChoice] = useState(ageInit.choice || "unknown");
  const [ageOther, setAgeOther] = useState(ageInit.other);
  const [breedChoice, setBreedChoice] = useState(breedInit.choice);
  const [breedOther, setBreedOther] = useState(breedInit.other);
  const [colorChoice, setColorChoice] = useState(colorInit.choice);
  const [colorOther, setColorOther] = useState(colorInit.other);

  const initialPills = temperamentToPills(animal.temperament ?? "");
  const knownPillValues = new Set(
    TEMPERAMENT_PILL_OPTIONS.filter((o) => o.value !== OTHER_VALUE).map((o) =>
      o.value.toLowerCase(),
    ),
  );
  const initialKnown = initialPills.filter((p) =>
    knownPillValues.has(p.toLowerCase()),
  );
  const initialOtherNote = initialPills
    .filter((p) => !knownPillValues.has(p.toLowerCase()))
    .join(", ");
  const [temperamentPills, setTemperamentPills] = useState(
    initialOtherNote
      ? [...initialKnown, OTHER_VALUE]
      : initialKnown,
  );
  const [temperamentNote, setTemperamentNote] = useState(initialOtherNote);
  const showTemperamentOther = temperamentPills.includes(OTHER_VALUE);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    const sexErr = validateSelectOther("Sex", sexChoice, sexOther);
    if (sexErr) next.sex = sexErr;
    const ageErr = validateSelectOther("Age", ageChoice, ageOther);
    if (ageErr) next.age = ageErr;
    const breedErr = validateSelectOther("Breed", breedChoice, breedOther);
    if (breedErr) next.breed = breedErr;
    const colorErr = validateSelectOther("Color", colorChoice, colorOther);
    if (colorErr) next.color = colorErr;
    const nameErr = validateOptionalText("Name", name, { maxLen: 80 });
    if (nameErr) next.name = nameErr;
    const bioErr = validateOptionalText("Bio", bio, { maxLen: 2000 });
    if (bioErr) next.bio = bioErr;
    if (showTemperamentOther) {
      if (!temperamentNote.trim()) {
        next.temperament = "Describe the other temperament.";
      } else {
        const noteErr = validateOptionalText(
          "Other temperament",
          temperamentNote,
          { minLen: 2, maxLen: 240 },
        );
        if (noteErr) next.temperament = noteErr;
      }
    }
    if (!isPathwayStage(pathwayStage)) {
      next.pathway = "Select a valid pathway stage.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    setError(null);
    if (!validate()) {
      setError("Fix the highlighted fields before saving.");
      return;
    }

    const sex = resolveSelectOther(sexChoice, sexOther);
    const estimatedAge = resolveSelectOther(ageChoice, ageOther);
    const breed = resolveSelectOther(breedChoice, breedOther);
    const color = resolveSelectOther(colorChoice, colorOther);
    const temperament =
      pillsToTemperament(
        temperamentPills.filter((p) => p !== OTHER_VALUE),
        showTemperamentOther ? temperamentNote : undefined,
      ) || null;

    await run(
      () =>
        updateAnimalAction(animal.id, {
          name: name.trim() || null,
          bio: bio.trim() || null,
          temperament,
          pathwayStage,
          sex,
          estimatedAge,
          breed,
          color,
        }),
      {
        rewarm: [`/animals/${animal.id}`, "/animals", "/adoption"],
        onSuccess: () => toast("Animal profile updated"),
      },
    );
  }

  async function handleDelete() {
    const ok = await run(() => deleteAnimalAction(animal.id), {
      refresh: false,
      onSuccess: () => {
        toast("Animal deleted", "info");
        setConfirmDelete(false);
        router.push("/animals");
        router.refresh();
      },
    });
    if (!ok) return;
  }

  return (
    <div className="space-y-3 rounded-xl border border-sage/25 bg-white p-3 shadow-card">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-graphite/50">
          Edit profile
        </p>
        <p className="mt-0.5 text-xs text-graphite/55">{animal.temporaryId}</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-rescue/25 bg-rescue/8 px-2.5 py-2 text-xs text-rescue">
          {error}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="animal-name">Name</Label>
          <Input
            id="animal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9"
            maxLength={80}
            placeholder="Optional name"
          />
          {fieldErrors.name ? (
            <p className="text-[11px] text-rescue">{fieldErrors.name}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor="animal-pathway">Pathway</Label>
          <Select
            id="animal-pathway"
            value={pathwayStage}
            onChange={(e) => setPathwayStage(e.target.value)}
            className="h-9"
          >
            {!isPathwayStage(pathwayStage) ? (
              <option value={pathwayStage}>
                {formatStatus(pathwayStage)} (legacy)
              </option>
            ) : null}
            {PATHWAY_STAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {fieldErrors.pathway ? (
            <p className="text-[11px] text-rescue">{fieldErrors.pathway}</p>
          ) : null}
        </div>

        <SelectWithOtherSplit
          id="animal-sex"
          label="Sex"
          options={ANIMAL_SEX_OPTIONS}
          choice={sexChoice}
          other={sexOther}
          onChoiceChange={setSexChoice}
          onOtherChange={setSexOther}
          placeholder="Select sex"
          error={fieldErrors.sex}
        />
        <SelectWithOtherSplit
          id="animal-age"
          label="Age"
          options={ANIMAL_AGE_OPTIONS}
          choice={ageChoice}
          other={ageOther}
          onChoiceChange={setAgeChoice}
          onOtherChange={setAgeOther}
          placeholder="Select age"
          error={fieldErrors.age}
        />
        <SelectWithOtherSplit
          id="animal-breed"
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
          id="animal-color"
          label="Color"
          options={COAT_COLOR_OPTIONS}
          choice={colorChoice}
          other={colorOther}
          onChoiceChange={setColorChoice}
          onOtherChange={setColorOther}
          placeholder="Select color"
          error={fieldErrors.color}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Temperament</Label>
        <OptionPills
          options={TEMPERAMENT_PILL_OPTIONS}
          value={temperamentPills}
          onChange={(next) => {
            const wasOther = temperamentPills.includes(OTHER_VALUE);
            const isOther = next.includes(OTHER_VALUE);
            setTemperamentPills(next);
            if (wasOther && !isOther) {
              setTemperamentNote("");
              setFieldErrors((prev) => {
                if (!prev.temperament) return prev;
                const { temperament: _, ...rest } = prev;
                return rest;
              });
            }
          }}
          disabled={pending}
        />
        {showTemperamentOther ? (
          <Textarea
            id="animal-temperament-note"
            rows={2}
            value={temperamentNote}
            onChange={(e) => setTemperamentNote(e.target.value)}
            className="resize-none text-sm"
            placeholder="Describe other temperament…"
            maxLength={240}
            autoFocus
          />
        ) : null}
        {fieldErrors.temperament ? (
          <p className="text-[11px] text-rescue">{fieldErrors.temperament}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="animal-bio">Bio</Label>
        <Textarea
          id="animal-bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="resize-none text-sm"
          placeholder="Story and care notes for adopters"
          maxLength={2000}
        />
        {fieldErrors.bio ? (
          <p className="text-[11px] text-rescue">{fieldErrors.bio}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={pending} onClick={() => void handleSave()}>
          {pending ? "Saving..." : "Save profile"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() => setConfirmDelete(true)}
        >
          Delete animal
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete animal?"
        description={`Permanently delete ${animal.name ?? animal.temporaryId}. Related medical records and adoption applications will also be removed.`}
        confirmLabel="Delete"
        variant="destructive"
        pending={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
      <ToastViewport />
    </div>
  );
}
