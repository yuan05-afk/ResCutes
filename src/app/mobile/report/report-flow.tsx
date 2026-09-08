"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  Images,
  X,
} from "lucide-react";
import { submitReportAction } from "@/app/actions/report";
import { uploadReportPhotoAction } from "@/app/actions/upload-photo";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  REPORT_CONTACT,
  REPORT_DANGER,
  REPORT_INJURY,
  REPORT_SPECIES,
  REPORT_VULNERABILITY,
  validatePhoneRequired,
} from "@/lib/forms/animal-field-options";

const STEPS = ["Photo", "Location", "Animal", "Condition", "Contact", "Review"];
const DRAFT_KEY = "rescutes-report-draft-v2";

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

interface ReportDraft {
  step: number;
  species: ReportSpecies;
  injurySeverity: ReportInjury;
  environmentalDanger: ReportDanger;
  vulnerability: ReportVulnerability;
  description: string;
  contactPreference: ReportContact;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  locationNote: string;
  locationStatus: "idle" | "loading" | "denied" | "ok";
  photoUrl: string | null;
  photoPreview: string | null;
}

function readDraft(): ReportDraft | null {
  try {
    const raw =
      localStorage.getItem(DRAFT_KEY) ?? sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    if (!localStorage.getItem(DRAFT_KEY) && sessionStorage.getItem(DRAFT_KEY)) {
      try {
        localStorage.setItem(DRAFT_KEY, raw);
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore migrate failures */
      }
    }
    return JSON.parse(raw) as ReportDraft;
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function ReportFlow({
  initialPhone = "",
}: {
  initialPhone?: string;
}) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [locationExplainOpen, setLocationExplainOpen] = useState(false);

  const [species, setSpecies] = useState<ReportSpecies>("dog");
  const [injurySeverity, setInjurySeverity] =
    useState<ReportInjury>("none_visible");
  const [environmentalDanger, setEnvironmentalDanger] =
    useState<ReportDanger>("none");
  const [vulnerability, setVulnerability] =
    useState<ReportVulnerability>("adult_healthy");
  const [description, setDescription] = useState("");
  const [contactPreference, setContactPreference] =
    useState<ReportContact>("phone");
  const [phone, setPhone] = useState(initialPhone);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationNote, setLocationNote] = useState("");
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "denied" | "ok"
  >("idle");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const draft = readDraft();
    if (draft) {
      setStep(draft.step);
      setSpecies(draft.species);
      setInjurySeverity(draft.injurySeverity);
      setEnvironmentalDanger(draft.environmentalDanger);
      setVulnerability(draft.vulnerability);
      setDescription(draft.description);
      setContactPreference(draft.contactPreference);
      setPhone(draft.phone?.trim() ? draft.phone : initialPhone);
      setLatitude(draft.latitude);
      setLongitude(draft.longitude);
      setLocationNote(draft.locationNote);
      setLocationStatus(
        draft.locationStatus === "loading" ? "idle" : draft.locationStatus,
      );
      setPhotoUrl(draft.photoUrl);
      setPhotoPreview(draft.photoPreview ?? draft.photoUrl);
    }
    setHydrated(true);
  }, [initialPhone]);

  useEffect(() => {
    if (!hydrated) return;
    const draft: ReportDraft = {
      step,
      species,
      injurySeverity,
      environmentalDanger,
      vulnerability,
      description,
      contactPreference,
      phone,
      latitude,
      longitude,
      locationNote,
      locationStatus: locationStatus === "loading" ? "idle" : locationStatus,
      photoUrl,
      photoPreview:
        photoPreview && !photoPreview.startsWith("blob:")
          ? photoPreview
          : photoUrl,
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* quota / private mode */
    }
  }, [
    hydrated,
    step,
    species,
    injurySeverity,
    environmentalDanger,
    vulnerability,
    description,
    contactPreference,
    phone,
    latitude,
    longitude,
    locationNote,
    locationStatus,
    photoUrl,
    photoPreview,
  ]);

  const hasProgress =
    step > 0 ||
    Boolean(description.trim()) ||
    Boolean(photoUrl) ||
    Boolean(latitude) ||
    locationNote.trim().length > 0;

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

  async function handlePhotoSelected(file: File | undefined) {
    if (!file) return;
    setError("");
    const declared = (file.type || "").toLowerCase();
    if (
      declared &&
      !["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"].includes(
        declared,
      )
    ) {
      setError("Only JPEG, PNG, WebP, or HEIC photos are supported.");
      return;
    }
    setPhotoUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);
    try {
      const formData = new FormData();
      formData.set("photo", file);
      const result = await uploadReportPhotoAction(formData);
      if ("error" in result) {
        setError(result.error);
        setPhotoPreview(null);
        setPhotoUrl(null);
        return;
      }
      setPhotoUrl(result.url);
      setPhotoPreview(result.url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message.toLowerCase() : "";
      setError(
        message.includes("1 mb") || message.includes("body exceeded")
          ? "Photo is too large. Try a smaller image (under 4.5 MB)."
          : "Could not upload photo. Try again.",
      );
      setPhotoPreview(null);
      setPhotoUrl(null);
    } finally {
      setPhotoUploading(false);
    }
  }

  function clearPhoto() {
    setPhotoPreview(null);
    setPhotoUrl(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  async function handleSubmit() {
    if (!latitude || !longitude) {
      setError("Location is required.");
      setStep(1);
      return;
    }
    const phoneErr = validatePhoneRequired(phone);
    if (phoneErr) {
      setError(phoneErr);
      setStep(4);
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
        phone: phone.trim(),
        locationNote: locationNote.trim() || undefined,
        latitude,
        longitude,
        photoUrl: photoUrl ?? undefined,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      clearDraft();
      router.push(`/mobile/cases/${result.caseId}`);
    } catch {
      setError("Submission failed. Check your connection and try again.");
      setLoading(false);
    }
  }

  function next() {
    if (photoUploading) {
      setError("Please wait for the photo to finish uploading.");
      return;
    }
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
    if (step === 4) {
      const phoneErr = validatePhoneRequired(phone);
      if (phoneErr) {
        setError(phoneErr);
        return;
      }
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function backStep() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleHeaderBack() {
    if (step > 0) {
      backStep();
      return;
    }
    if (hasProgress) {
      setLeaveOpen(true);
      return;
    }
    clearDraft();
    router.push("/mobile");
  }

  function leaveKeepingDraft() {
    router.push("/mobile");
  }

  function discardAndLeave() {
    clearDraft();
    router.push("/mobile");
  }

  return (
    <div>
      <header className="flex items-center gap-2 border-b border-sage/20 bg-white px-2 py-3">
        <button
          type="button"
          onClick={handleHeaderBack}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-graphite/70 active:bg-bone"
          aria-label={step > 0 ? "Previous step" : "Leave report"}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1 pr-3">
          <h1 className="text-lg font-bold text-graphite">Report an Animal</h1>
          <p className="text-xs text-graphite/55">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </div>
      </header>

      <div className="px-4 pt-4">
        <div className="flex gap-1" aria-hidden>
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

      <main className="space-y-5 px-4 py-6">
        {step === 0 && (
          <div className="space-y-4">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
              capture="environment"
              className="sr-only"
              onChange={(e) => void handlePhotoSelected(e.target.files?.[0])}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
              className="sr-only"
              onChange={(e) => void handlePhotoSelected(e.target.files?.[0])}
            />

            <div className="relative overflow-hidden rounded-2xl border border-sage/25 bg-white shadow-card">
              {photoPreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Selected photo"
                    className="h-52 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/55 text-white"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {photoUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                      <Loader2 className="h-7 w-7 animate-spin text-white" />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-evergreen/10">
                    <Camera className="h-7 w-7 text-evergreen" />
                  </div>
                  <p className="mt-3 font-semibold text-graphite">Add a photo</p>
                  <p className="mt-1 text-sm text-graphite/55">
                    Optional, but helps rescuers find the animal faster
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                className="min-h-11 rounded-full"
                disabled={photoUploading}
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Camera
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 rounded-full"
                disabled={photoUploading}
                onClick={() => galleryInputRef.current?.click()}
              >
                <Images className="mr-2 h-4 w-4" />
                Gallery
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-sage/25 bg-white p-5 text-center shadow-card">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-evergreen/10">
                <MapPin className="h-6 w-6 text-evergreen" />
              </div>
              <p className="mt-3 font-semibold text-graphite">Pin the location</p>
              <p className="mt-1 text-sm text-graphite/55">
                Shared only with authorized rescue staff. We ask for location
                only when you choose to capture it here.
              </p>
              {locationStatus === "ok" ? (
                <div
                  className="mt-4 rounded-xl border border-evergreen/25 bg-evergreen/5 px-3 py-2.5 text-left"
                  role="status"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-evergreen"
                      aria-hidden
                    />
                    <p className="text-sm font-semibold text-evergreen">
                      Location captured
                    </p>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  className="mt-4 min-h-11 w-full rounded-full"
                  onClick={() => setLocationExplainOpen(true)}
                  disabled={locationStatus === "loading"}
                >
                  {locationStatus === "loading" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  Use Current Location
                </Button>
              )}
              {locationStatus === "denied" && (
                <div className="mt-3 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
                  <p className="col-span-full text-left text-xs text-graphite/60">
                    Location access was denied. Enter coordinates manually, or
                    enable location in browser settings and try again.
                  </p>
                  <Input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="Latitude"
                    aria-label="Latitude"
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  />
                  <Input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="Longitude"
                    aria-label="Longitude"
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  />
                </div>
              )}
              <div className="mt-3 text-left">
                <Label
                  htmlFor="location-note"
                  className="text-xs text-graphite/55"
                >
                  Landmark (optional)
                </Label>
                <Textarea
                  id="location-note"
                  value={locationNote}
                  onChange={(e) => setLocationNote(e.target.value)}
                  placeholder='e.g. "Behind the 7-Eleven on EDSA"'
                  rows={2}
                  maxLength={300}
                  className="mt-1 resize-none text-sm"
                />
              </div>
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
                onChange={(e) => {
                  const next = e.target.value;
                  setDescription(next);
                  if (next.trim().length >= 10) {
                    setError("");
                  }
                }}
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
          <div className="space-y-4">
            <div className="space-y-1.5 rounded-2xl border border-sage/25 bg-white p-4 shadow-card">
              <Label htmlFor="report-phone" className="text-sm font-semibold">
                Phone number (required)
              </Label>
              <Input
                id="report-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError("");
                }}
                placeholder="+63 9XX XXX XXXX"
                className="h-11 rounded-xl"
              />
              <p className="text-[11px] text-graphite/50">
                Rescuers use this number if they need directions or updates from
                you.
              </p>
            </div>
            <OptionGrid
              label="Contact preference"
              options={CONTACT}
              value={contactPreference}
              onChange={setContactPreference}
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3 rounded-2xl border border-sage/25 bg-white p-5 text-sm shadow-card">
            <h3 className="font-semibold text-graphite">Review your report</h3>
            <ReviewRow label="Species" value={formatStatus(species)} />
            <ReviewRow label="Condition" value={formatStatus(injurySeverity)} />
            <ReviewRow
              label="Danger"
              value={formatStatus(environmentalDanger)}
            />
            <ReviewRow
              label="Vulnerability"
              value={formatStatus(vulnerability)}
            />
            <ReviewRow label="Phone" value={phone.trim() || "Missing"} />
            <ReviewRow
              label="Contact"
              value={formatStatus(contactPreference)}
            />
            <ReviewRow label="Description" value={description} />
            {photoPreview ? (
              <div className="flex items-center gap-2 text-graphite/70">
                <ImageIcon className="h-4 w-4" /> Photo attached
              </div>
            ) : null}
            <div className="mt-2 flex gap-2 rounded-xl bg-bone p-3">
              <Shield className="h-4 w-4 shrink-0 text-ochre" />
              <p className="text-xs text-graphite/65">
                Do not approach the animal. Rescuers will handle the situation
                safely.
              </p>
            </div>
          </div>
        )}

        {error ? (
          <p className="text-sm text-rescue" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex gap-3 pt-2">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={backStep}
              className="min-h-11 flex-1 rounded-full"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={next}
              disabled={photoUploading}
              className="min-h-11 flex-1 rounded-full"
            >
              {photoUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="rescue"
              onClick={handleSubmit}
              disabled={loading || photoUploading}
              className="min-h-11 flex-1 rounded-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit Report
            </Button>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={leaveOpen}
        title="Leave this report?"
        message="Your progress stays on this device so you can continue later. Choose Discard only if you want to clear the draft."
        confirmLabel="Keep draft and leave"
        cancelLabel="Keep editing"
        variant="primary"
        onConfirm={leaveKeepingDraft}
        onClose={() => setLeaveOpen(false)}
      />
      {leaveOpen ? (
        <button
          type="button"
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-[70] min-h-11 -translate-x-1/2 rounded-full bg-white px-4 text-sm font-semibold text-rescue shadow-elevated"
          onClick={discardAndLeave}
        >
          Discard draft
        </button>
      ) : null}

      <ConfirmDialog
        open={locationExplainOpen}
        title="Share your location?"
        message="ResCutes uses your location only to pin this report for authorized rescuers. You can deny access and enter coordinates manually instead."
        confirmLabel="Continue"
        cancelLabel="Not now"
        variant="primary"
        onConfirm={() => {
          setLocationExplainOpen(false);
          requestLocation();
        }}
        onClose={() => setLocationExplainOpen(false)}
      />
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
              "min-h-11 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors",
              value === opt
                ? "border-evergreen bg-evergreen/8 text-evergreen"
                : "border-sage/30 bg-white text-graphite/70",
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
      <span className="text-right font-medium capitalize text-graphite">
        {value}
      </span>
    </div>
  );
}
