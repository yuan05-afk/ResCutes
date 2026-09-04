"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  NearestAnimal,
  NearestNeed,
  NearestQuizAnswers,
} from "@/lib/maps/nearest-shelter-match";

interface NearestShelterQuizProps {
  open: boolean;
  onClose: () => void;
  onComplete: (answers: NearestQuizAnswers) => void;
}

const ANIMAL_OPTIONS: Array<{ value: NearestAnimal; label: string }> = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "wildlife", label: "Wildlife" },
  { value: "other", label: "Other / not sure" },
];

const NEED_OPTIONS: Array<{
  value: NearestNeed;
  label: string;
  hint: string;
}> = [
  {
    value: "visit",
    label: "Visit or adopt",
    hint: "Looking for a shelter nearby",
  },
  {
    value: "care",
    label: "Needs care",
    hint: "Hurt or needs vet help",
  },
  {
    value: "emergency",
    label: "Emergency",
    hint: "Severe injury or critical",
  },
];

/** Super-fast pill quiz after location is granted (~5–10 seconds). */
export function NearestShelterQuiz({
  open,
  onClose,
  onComplete,
}: NearestShelterQuizProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [animal, setAnimal] = useState<NearestAnimal | null>(null);

  if (!open) return null;

  function resetAndClose() {
    setStep(1);
    setAnimal(null);
    onClose();
  }

  function pickAnimal(value: NearestAnimal) {
    setAnimal(value);
    setStep(2);
  }

  function pickNeed(need: NearestNeed) {
    if (!animal) return;
    const answers = { animal, need };
    setStep(1);
    setAnimal(null);
    onComplete(answers);
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-graphite/35">
      <button
        type="button"
        className="min-h-0 flex-1 cursor-default"
        aria-label="Dismiss quiz"
        onClick={resetAndClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nearest-quiz-title"
        className="max-h-[78%] overflow-y-auto rounded-t-3xl border-t border-sage/20 bg-white px-4 pb-5 pt-3 shadow-elevated"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-sage/35" aria-hidden />

        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-graphite/45">
              Step {step} of 2 · about 10 seconds
            </p>
            <h2
              id="nearest-quiz-title"
              className="mt-0.5 text-lg font-bold text-graphite"
            >
              {step === 1 ? "What animal?" : "What's needed?"}
            </h2>
            <p className="mt-0.5 text-sm text-graphite/55">
              {step === 1
                ? "We'll match a shelter that accepts this animal."
                : "So we can prefer shelters with the right care."}
            </p>
          </div>
          <button
            type="button"
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full active:bg-bone"
            aria-label="Close"
            onClick={resetAndClose}
          >
            <X className="h-5 w-5 text-graphite/50" />
          </button>
        </div>

        {step === 1 ? (
          <div className="grid grid-cols-2 gap-2">
            {ANIMAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => pickAnimal(opt.value)}
                className={cn(
                  "min-h-12 rounded-full border border-sage/30 bg-bone/60 px-3 text-sm font-semibold text-graphite",
                  "active:border-evergreen active:bg-evergreen/10 active:text-evergreen",
                  opt.value === "other" ? "col-span-2" : null,
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {NEED_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => pickNeed(opt.value)}
                className="flex min-h-14 flex-col items-start justify-center rounded-2xl border border-sage/30 bg-bone/50 px-4 text-left active:border-evergreen active:bg-evergreen/10"
              >
                <span className="text-sm font-semibold text-graphite">
                  {opt.label}
                </span>
                <span className="text-xs text-graphite/55">{opt.hint}</span>
              </button>
            ))}
            <button
              type="button"
              className="mt-1 min-h-11 text-sm font-semibold text-graphite/50"
              onClick={() => setStep(1)}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
