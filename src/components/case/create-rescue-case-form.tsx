"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionPending } from "@/components/shared/useActionPending";
import { createStaffCaseAction } from "@/app/actions/case";
import {
  REPORT_CONTACT,
  REPORT_DANGER,
  REPORT_INJURY,
  REPORT_SPECIES,
  REPORT_VULNERABILITY,
} from "@/lib/forms/animal-field-options";
import { formatStatus } from "@/lib/utils";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";

export function CreateRescueCaseForm() {
  const router = useRouter();
  const { pending, error, setError, run } = useActionPending();
  const [species, setSpecies] = useState<string>("dog");
  const [injurySeverity, setInjurySeverity] = useState("moderate");
  const [environmentalDanger, setEnvironmentalDanger] = useState("traffic");
  const [vulnerability, setVulnerability] = useState("adult_healthy");
  const [description, setDescription] = useState("");
  const [contactPreference, setContactPreference] = useState("in_app");
  const [locationNote, setLocationNote] = useState("");
  const [latitude, setLatitude] = useState(String(DEMO_GEO.center.latitude));
  const [longitude, setLongitude] = useState(String(DEMO_GEO.center.longitude));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (description.trim().length < 10) {
      setError("Please add a short description (at least 10 characters).");
      return;
    }
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      setError("Enter a valid latitude.");
      return;
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      setError("Enter a valid longitude.");
      return;
    }

    await run(async () => {
      const result = await createStaffCaseAction({
        species,
        injurySeverity,
        environmentalDanger,
        vulnerability,
        description: description.trim(),
        contactPreference,
        locationNote: locationNote.trim() || undefined,
        latitude: lat,
        longitude: lng,
      });
      if ("error" in result && result.error) {
        return { error: result.error };
      }
      if ("caseId" in result && result.caseId) {
        router.push(`/rescue-cases/${result.caseId}`);
      }
      return { success: true };
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl space-y-4 rounded-xl border border-sage/25 bg-white p-4 shadow-card sm:p-6"
    >
      <p className="text-sm text-graphite/65">
        Log a case on behalf of operations (you are recorded as the reporter).
        Citizens should still use the mobile Report flow when possible.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="case-species">Species</Label>
          <Select
            id="case-species"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          >
            {REPORT_SPECIES.map((s) => (
              <option key={s} value={s}>
                {formatStatus(s)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="case-injury">Injury</Label>
          <Select
            id="case-injury"
            value={injurySeverity}
            onChange={(e) => setInjurySeverity(e.target.value)}
          >
            {REPORT_INJURY.map((s) => (
              <option key={s} value={s}>
                {formatStatus(s)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="case-danger">Environmental danger</Label>
          <Select
            id="case-danger"
            value={environmentalDanger}
            onChange={(e) => setEnvironmentalDanger(e.target.value)}
          >
            {REPORT_DANGER.map((s) => (
              <option key={s} value={s}>
                {formatStatus(s)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="case-vuln">Vulnerability</Label>
          <Select
            id="case-vuln"
            value={vulnerability}
            onChange={(e) => setVulnerability(e.target.value)}
          >
            {REPORT_VULNERABILITY.map((s) => (
              <option key={s} value={s}>
                {formatStatus(s)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="case-description">Description</Label>
        <Textarea
          id="case-description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (e.target.value.trim().length >= 10) setError(null);
          }}
          rows={4}
          className="resize-none"
          placeholder="What happened, animal condition, access notes..."
          required
        />
        <p className="text-[11px] text-graphite/50">
          {description.trim().length}/2000 · at least 10 characters
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="case-lat">Latitude</Label>
          <Input
            id="case-lat"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="case-lng">Longitude</Label>
          <Input
            id="case-lng"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="case-location-note">Location note (optional)</Label>
        <Input
          id="case-location-note"
          value={locationNote}
          onChange={(e) => setLocationNote(e.target.value)}
          placeholder="Landmark, street corner, building..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="case-contact">Contact preference</Label>
        <Select
          id="case-contact"
          value={contactPreference}
          onChange={(e) => setContactPreference(e.target.value)}
        >
          {REPORT_CONTACT.map((s) => (
            <option key={s} value={s}>
              {formatStatus(s)}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <p className="text-sm text-rescue" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create rescue case"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/rescue-cases">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
