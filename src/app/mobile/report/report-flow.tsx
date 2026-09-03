"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatStatus } from "@/lib/utils";
import {
  Camera,
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { submitReportAction } from "@/app/actions/report";
import { getSpeciesImage } from "@/lib/demo-images";
import {
  REPORT_CONTACT,
  REPORT_DANGER,
  REPORT_INJURY,
  REPORT_SPECIES,
  REPORT_VULNERABILITY,
} from "@/lib/forms/animal-field-options";

const STEPS = ["Photo", "Location", "Animal", "Condition", "Contact", "Review"];

type ReportSpecies = (typeof REPORT_SPECIES)[number];
type ReportInjury = (typeof REPORT_INJURY)[number];
type ReportDanger = (typeof REPORT_DANGER)[number];
type ReportVulnerability = (typeof REPORT_VULNERABILITY)[number];
type ReportContact = (typeof REPORT_CONTACT)[number];

const SPECIES: ReportSpecies[] = [...REPORT_SPECIES];
const INJURY: ReportInjury[] = [...REPORT_INJURY];
const DANGER: ReportDanger[] = [...REPORT_DANGER];
const VULNERABILITY: ReportVulnerability[] = [...REPORT_VULNERABILITY];
const CONTACT: ReportContact[] = [...REPORT_CONTACT];

export function ReportFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [species, setSpecies] = useState<ReportSpecies>("dog");
  const [injurySeverity, setInjurySeverity] =
    useState<ReportInjury>("none_visible");
  const [environmentalDanger, setEnvironmentalDanger] =
    useState<ReportDanger>("none");
  const [vulnerability, setVulnerability] =
    useState<ReportVulnerability>("adult_healthy");
  const [description, setDescription] = useState("");
  const [contactPreference, setContactPreference] =
    useState<ReportContact>("in_app");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "denied" | "ok">("idle");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function requestLocation() {
    setLocationStatus("loading");
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationStatus("ok");
      },
      () => setLocationStatus("denied"),
      { timeout: 10000 },
    );
  }

  function useDemoPhoto() {
    const url = getSpeciesImage(species);
    setPhotoPreview(url);
  }

  async function handleSubmit() {
    if (!latitude || !longitude) {
      setError("Location is required.");
      setStep(1);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const result = await submitReportAction({
        species,
        injurySeverity,
        environmentalDanger,
        vulnerability,
        description,
        contactPreference,
        latitude,
        longitude,
        photoUrl: photoPreview ?? undefined,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      router.push(`/mobile/cases/${result.caseId}`);
    } catch {
      setError("Submission failed. Check your connection and try again.");
      setLoading(false);
    }
  }

  function next() {
    if (step === 1 && !latitude) {
      setError("Please capture location before continuing.");
      return;
    }
    if (step === 3 && description.trim().length < 10) {
      setError("Please add a short description (at least 10 characters).");
      return;
    }
    if (step === 3 && description.trim().length > 2000) {
      setError("Description must be under 2000 characters.");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <div>
      <header className="flex items-center gap-3 border-b border-sage/20 bg-white px-4 py-4">
        <Link
          href="/mobile"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-bone"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-graphite">Report an Animal</h1>
          <p className="text-xs text-graphite/55">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </div>
      </header>

      <div className="px-4 pt-4">
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-evergreen" : "bg-sage/30",
              )}
            />
          ))}
        </div>
      </div>

      <main className="px-4 py-6 space-y-5">
        {step === 0 && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={useDemoPhoto}
              className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sage/40 bg-white p-8 shadow-card min-h-[200px] hover:border-evergreen/40 transition-colors"
            >
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Selected photo"
                  className="h-40 w-full object-cover rounded-xl"
                />
              ) : (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-evergreen/10">
                    <Camera className="h-8 w-8 text-evergreen" />
                  </div>
                  <p className="mt-4 font-semibold text-graphite">Take a Photo</p>
                  <p className="text-sm text-graphite/55 mt-1">or choose from gallery</p>
                </>
              )}
            </button>
            <p className="text-xs text-center text-graphite/50">
              Tip: tap the area above to use a sample photo for the selected species.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-sage/25 bg-white p-6 shadow-card text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-evergreen/10">
                <MapPin className="h-7 w-7 text-evergreen" />
              </div>
              <p className="mt-4 font-semibold text-graphite">Animal location</p>
              <p className="mt-2 text-sm text-graphite/60">
                We use your location to route rescuers. Exact coordinates are only
                shared with authorized staff and assigned rescuers.
              </p>
              {locationStatus === "ok" ? (
                <div
                  className="mt-5 rounded-xl border border-evergreen/25 bg-evergreen/5 p-4 text-left"
                  role="status"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="h-5 w-5 shrink-0 text-evergreen mt-0.5"
                      aria-hidden
                    />
                    <div>
                      <p className="text-sm font-semibold text-evergreen">
                        Location captured
                      </p>
                      <p className="mt-1 text-xs text-graphite/65 leading-relaxed">
                        Exact coordinates are securely saved and will only be shared
                        with authorized rescue staff and the assigned rescuer.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  className="mt-5 w-full rounded-full"
                  onClick={requestLocation}
                  disabled={locationStatus === "loading"}
                >
                  {locationStatus === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2" />
                  )}
                  Use Current Location
                </Button>
              )}
              {locationStatus === "denied" && (
                <div className="mt-4 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
                  <Input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  />
                  <Input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  />
                  <p className="col-span-2 text-xs text-graphite/50">
                    Enter coordinates manually if location is blocked.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <OptionGrid
            label="Species"
            options={SPECIES}
            value={species}
            onChange={setSpecies}
          />
        )}

        {step === 3 && (
          <div className="space-y-5">
            <OptionGrid
              label="Visible condition"
              options={INJURY}
              value={injurySeverity}
              onChange={setInjurySeverity}
            />
            <OptionGrid
              label="Immediate danger"
              options={DANGER}
              value={environmentalDanger}
              onChange={setEnvironmentalDanger}
            />
            <OptionGrid
              label="Vulnerability"
              options={VULNERABILITY}
              value={vulnerability}
              onChange={setVulnerability}
            />
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you observed..."
                rows={4}
                className="rounded-xl"
                maxLength={2000}
              />
              <p className="text-[11px] text-graphite/45">
                {description.trim().length}/2000 · at least 10 characters
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <OptionGrid
            label="Contact preference"
            options={CONTACT}
            value={contactPreference}
            onChange={setContactPreference}
          />
        )}

        {step === 5 && (
          <div className="rounded-2xl border border-sage/25 bg-white p-5 shadow-card space-y-3 text-sm">
            <h3 className="font-semibold text-graphite">Review your report</h3>
            <ReviewRow label="Species" value={formatStatus(species)} />
            <ReviewRow label="Condition" value={formatStatus(injurySeverity)} />
            <ReviewRow label="Danger" value={formatStatus(environmentalDanger)} />
            <ReviewRow label="Vulnerability" value={formatStatus(vulnerability)} />
            <ReviewRow label="Contact" value={formatStatus(contactPreference)} />
            <ReviewRow label="Description" value={description} />
            {photoPreview && (
              <div className="flex items-center gap-2 text-graphite/70">
                <ImageIcon className="h-4 w-4" /> Photo attached
              </div>
            )}
            <div className="flex gap-2 rounded-xl bg-bone p-3 mt-2">
              <Shield className="h-4 w-4 text-ochre shrink-0" />
              <p className="text-xs text-graphite/65">
                Do not approach the animal. Rescuers will handle the situation safely.
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-rescue" role="alert">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={back} className="rounded-full flex-1">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next} className="rounded-full flex-1">
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="rescue"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-full flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Submit Report
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

function OptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-graphite">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors min-h-[44px]",
              value === opt
                ? "border-evergreen bg-evergreen/8 text-evergreen"
                : "border-sage/30 bg-white text-graphite/70 hover:border-sage/50",
            )}
          >
            {formatStatus(opt)}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-sage/15 pb-2 last:border-0">
      <span className="text-graphite/55">{label}</span>
      <span className="font-medium text-graphite text-right capitalize">{value}</span>
    </div>
  );
}
