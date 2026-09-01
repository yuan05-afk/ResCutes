"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { CITIZEN_PROGRESS_STEPS } from "@/lib/rescue-progress";

interface RescueProgressProps {
  currentIndex: number;
  className?: string;
}

export function RescueProgress({ currentIndex, className }: RescueProgressProps) {
  return (
    <div className={cn("px-1", className)}>
      <div className="flex items-center justify-between gap-1">
        {CITIZEN_PROGRESS_STEPS.map((step, i) => {
          const isComplete = currentIndex > i;
          const isCurrent = currentIndex === i;
          return (
            <div key={step.id} className="flex flex-1 flex-col items-center min-w-0">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isComplete || isCurrent ? "bg-evergreen" : "bg-sage/40",
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    isComplete
                      ? "border-evergreen bg-evergreen text-white"
                      : isCurrent
                        ? "border-evergreen bg-white text-evergreen ring-2 ring-evergreen/20"
                        : "border-sage/50 bg-white text-graphite/40",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? (
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                {i < CITIZEN_PROGRESS_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      currentIndex > i ? "bg-evergreen" : "bg-sage/40",
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-center text-[10px] leading-tight font-medium px-0.5",
                  isCurrent ? "text-evergreen" : "text-graphite/50",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
