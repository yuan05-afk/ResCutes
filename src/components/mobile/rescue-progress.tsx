"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { CITIZEN_PROGRESS_STEPS } from "@/lib/rescue-progress";

interface RescueProgressProps {
  currentIndex: number;
  className?: string;
  compact?: boolean;
}

export function RescueProgress({
  currentIndex,
  className,
  compact = false,
}: RescueProgressProps) {
  return (
    <div className={cn(compact ? "px-0" : "px-1", className)}>
      <div className="flex items-center justify-between gap-1">
        {CITIZEN_PROGRESS_STEPS.map((step, i) => {
          const isComplete = currentIndex > i;
          const isCurrent = currentIndex === i;
          return (
            <div key={step.id} className="flex min-w-0 flex-1 flex-col items-center">
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
                    "flex shrink-0 items-center justify-center rounded-full border-2 font-semibold transition-colors",
                    compact ? "h-5 w-5 text-[9px]" : "h-7 w-7 text-xs",
                    isComplete
                      ? "border-evergreen bg-evergreen text-white"
                      : isCurrent
                        ? "border-evergreen bg-white text-evergreen ring-2 ring-evergreen/20"
                        : "border-sage/50 bg-white text-graphite/40",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={step.label}
                >
                  {isComplete ? (
                    <Check className={compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} aria-hidden />
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
              {!compact ? (
                <span
                  className={cn(
                    "mt-2 px-0.5 text-center text-[10px] font-medium leading-tight",
                    isCurrent ? "text-evergreen" : "text-graphite/50",
                  )}
                >
                  {step.label}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
