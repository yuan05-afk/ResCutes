import { cn } from "@/lib/utils";
import {
  formatStageLabel,
  statusToStage,
  type CaseStage,
} from "@/lib/rescue-stages";

const PIPELINE_STAGES = [
  "needs_review",
  "verified",
  "with_rescuer",
  "animal_secured",
  "at_shelter",
  "completed",
] as const satisfies readonly CaseStage[];

const PIPELINE_LABELS: Record<(typeof PIPELINE_STAGES)[number], string> = {
  needs_review: "Needs review",
  verified: "Verified",
  with_rescuer: "With rescuer",
  animal_secured: "Secured",
  at_shelter: "At shelter",
  completed: "Completed",
};

interface CaseStatusPipelineProps {
  status: string;
  className?: string;
}

export function CaseStatusPipeline({
  status,
  className,
}: CaseStatusPipelineProps) {
  const stage = statusToStage(status);
  const isClosed = stage === "closed";
  const currentIndex = stage
    ? (PIPELINE_STAGES as readonly string[]).indexOf(stage)
    : -1;

  return (
    <div
      className={cn(
        "rounded-xl border border-sage/25 bg-white px-3 py-2.5 shadow-card",
        className,
      )}
      role="list"
      aria-label="Case stage pipeline"
    >
      {isClosed ? (
        <p className="text-xs font-semibold text-graphite/70">
          Closed · {formatStageLabel(stage)}
        </p>
      ) : null}
      <ol
        className={cn(
          "flex flex-wrap items-center gap-x-1 gap-y-1.5",
          isClosed && "mt-1.5 opacity-60",
        )}
      >
        {PIPELINE_STAGES.map((id, index) => {
          const isCurrent = !isClosed && currentIndex === index;
          const isDone = !isClosed && currentIndex > index;
          return (
            <li key={id} className="flex items-center gap-1" role="listitem">
              {index > 0 ? (
                <span
                  className={cn(
                    "mx-0.5 hidden h-px w-3 sm:block",
                    isDone || isCurrent ? "bg-evergreen/40" : "bg-sage/30",
                  )}
                  aria-hidden
                />
              ) : null}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                  isCurrent &&
                    "bg-evergreen text-white ring-2 ring-evergreen/25",
                  isDone && !isCurrent && "bg-evergreen/12 text-evergreen",
                  !isDone &&
                    !isCurrent &&
                    "bg-bone text-graphite/45",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {PIPELINE_LABELS[id]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
