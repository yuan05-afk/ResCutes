"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ToastViewport, toast } from "@/components/ui/toast";
import { useActionPending } from "@/components/shared/useActionPending";
import {
  deleteAnimalAction,
  updateAnimalAction,
} from "@/app/actions/adoption";

interface AnimalProfileEditorProps {
  animal: {
    id: string;
    name?: string | null;
    temporaryId: string;
    bio?: string | null;
    temperament?: string | null;
    pathwayStage: string;
    sex?: string | null;
    estimatedAge?: string | null;
    breed?: string | null;
    color?: string | null;
  };
}

const PATHWAY_OPTIONS = [
  "intake",
  "medical_clearance",
  "behavior_assessment",
  "ready_for_foster",
  "ready_for_adoption",
  "long_stay",
  "transferred",
];

export function AnimalProfileEditor({ animal }: AnimalProfileEditorProps) {
  const router = useRouter();
  const { pending, error, setError, run } = useActionPending();
  const [name, setName] = useState(animal.name ?? "");
  const [bio, setBio] = useState(animal.bio ?? "");
  const [temperament, setTemperament] = useState(animal.temperament ?? "");
  const [pathwayStage, setPathwayStage] = useState(animal.pathwayStage);
  const [sex, setSex] = useState(animal.sex ?? "");
  const [estimatedAge, setEstimatedAge] = useState(animal.estimatedAge ?? "");
  const [breed, setBreed] = useState(animal.breed ?? "");
  const [color, setColor] = useState(animal.color ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave() {
    setError(null);
    await run(
      () =>
        updateAnimalAction(animal.id, {
          name: name.trim() || null,
          bio: bio.trim() || null,
          temperament: temperament.trim() || null,
          pathwayStage,
          sex: sex.trim() || null,
          estimatedAge: estimatedAge.trim() || null,
          breed: breed.trim() || null,
          color: color.trim() || null,
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
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="animal-pathway">Pathway</Label>
          <Select
            id="animal-pathway"
            value={pathwayStage}
            onChange={(e) => setPathwayStage(e.target.value)}
            className="h-9"
          >
            {PATHWAY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="animal-sex">Sex</Label>
          <Input
            id="animal-sex"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="animal-age">Age</Label>
          <Input
            id="animal-age"
            value={estimatedAge}
            onChange={(e) => setEstimatedAge(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="animal-breed">Breed</Label>
          <Input
            id="animal-breed"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="animal-color">Color</Label>
          <Input
            id="animal-color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="animal-temperament">Temperament</Label>
        <Textarea
          id="animal-temperament"
          rows={2}
          value={temperament}
          onChange={(e) => setTemperament(e.target.value)}
          className="resize-none text-sm"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="animal-bio">Bio</Label>
        <Textarea
          id="animal-bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="resize-none text-sm"
        />
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
