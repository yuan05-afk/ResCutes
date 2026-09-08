import { cn, formatExactStatus, formatStatus } from "@/lib/utils";
import {
  formatCaseStageLabel,
  STAGE_BADGE_STYLES,
  statusToStage,
} from "@/lib/rescue-stages";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
  /** When true (default), rescue case statuses show simplified stage labels. */
  stageAware?: boolean;
}

const statusStyles: Record<string, string> = {
  report_submitted: "bg-sage/20 text-evergreen",
  under_verification: "bg-sage/20 text-evergreen",
  verified: "bg-evergreen/12 text-evergreen",
  rescuer_assigned: "bg-ochre/12 text-ochre",
  rescue_accepted: "bg-ochre/12 text-ochre",
  rescue_in_progress: "bg-ochre/12 text-ochre",
  animal_secured: "bg-evergreen/20 text-evergreen",
  awaiting_shelter: "bg-evergreen/20 text-evergreen",
  shelter_handoff: "bg-evergreen/25 text-evergreen",
  completed: "bg-evergreen/15 text-evergreen",
  rejected: "bg-rescue/12 text-rescue",
  duplicate: "bg-graphite/10 text-graphite/70",
  cancelled: "bg-graphite/10 text-graphite/70",
  awaiting_examination: "bg-ochre/12 text-ochre",
  under_examination: "bg-sage/25 text-evergreen",
  under_treatment: "bg-ochre/12 text-ochre",
  follow_up_required: "bg-ochre/12 text-ochre",
  medically_cleared: "bg-evergreen/15 text-evergreen",
  pending: "bg-ochre/12 text-ochre",
  under_review: "bg-sage/25 text-evergreen",
  approved: "bg-evergreen/15 text-evergreen",
  withdrawn: "bg-graphite/10 text-graphite/70",
  ready_for_adoption: "bg-evergreen/15 text-evergreen",
  ready_for_foster: "bg-sage/25 text-evergreen",
  behavior_assessment: "bg-ochre/12 text-ochre",
  medical_clearance: "bg-ochre/12 text-ochre",
  transferred: "bg-evergreen/20 text-evergreen",
};

export function StatusBadge({
  status,
  className,
  size = "sm",
  stageAware = true,
}: StatusBadgeProps) {
  const stage = stageAware ? statusToStage(status) : null;
  const label = stage
    ? formatCaseStageLabel(status)
    : stageAware
      ? formatStatus(status)
      : formatExactStatus(status);
  const style = stage
    ? STAGE_BADGE_STYLES[stage]
    : (statusStyles[status] ?? "bg-graphite/10 text-graphite/70");

  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full font-medium leading-none",
        size === "sm" ? "px-2.5 py-[0.4rem] text-[11px]" : "px-3 py-1.5 text-xs",
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
