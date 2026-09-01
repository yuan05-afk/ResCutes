"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { completeShelterIntakeAction } from "@/app/actions/case";
import { formatStatus } from "@/lib/utils";

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [estimatedAge, setEstimatedAge] = useState("");
  const [sex, setSex] = useState("");
  const [breed, setBreed] = useState("");
  const [color, setColor] = useState("");
  const [initialCondition, setInitialCondition] = useState(
    `Reported injury level: ${formatStatus(injurySeverity)}`,
  );

  async function handleSubmit() {
    setLoading(true);
    setActionError(null);
    const result = await completeShelterIntakeAction(caseId, {
      name: name || undefined,
      estimatedAge: estimatedAge || undefined,
      sex: sex || undefined,
      breed: breed || undefined,
      color: color || undefined,
      initialCondition: initialCondition || undefined,
    });
    if (result && "error" in result && result.error) {
      setActionError(result.error);
      setLoading(false);
      return;
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-3 border-t border-sage/30 pt-4">
      <p className="text-xs font-medium text-graphite/70">Shelter Intake</p>
      {actionError && (
        <p className="text-sm text-rescue rounded-lg border border-rescue/20 bg-rescue/5 px-3 py-2">
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
        <div>
          <Label htmlFor="intake-name">Name (optional)</Label>
          <Input
            id="intake-name"
            placeholder="Leave blank until named"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="intake-age">Estimated Age</Label>
          <Input
            id="intake-age"
            placeholder="Unknown"
            value={estimatedAge}
            onChange={(e) => setEstimatedAge(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="intake-sex">Sex</Label>
          <Select
            id="intake-sex"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
          >
            <option value="">Unknown</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="intake-breed">Breed</Label>
          <Input
            id="intake-breed"
            placeholder="Unknown"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="intake-color">Color / Appearance</Label>
          <Input
            id="intake-color"
            placeholder="Unknown"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="intake-condition">Initial Condition</Label>
          <Textarea
            id="intake-condition"
            value={initialCondition}
            onChange={(e) => setInitialCondition(e.target.value)}
          />
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        Complete Intake
      </Button>
    </div>
  );
}
