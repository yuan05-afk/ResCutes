import { cn, formatStatus } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

const statusStyles: Record<string, string> = {
  report_submitted: "bg-sage/20 text-evergreen",
  under_verification: "bg-ochre/12 text-ochre",
  verified: "bg-evergreen/12 text-evergreen",
  rescuer_assigned: "bg-sage/30 text-evergreen",
  rescue_accepted: "bg-evergreen/15 text-evergreen",
  rescue_in_progress: "bg-ochre/12 text-ochre",
  animal_secured: "bg-evergreen/20 text-evergreen",
  awaiting_shelter: "bg-ochre/12 text-ochre",
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

export function StatusBadge({ status, className, size = "sm" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        statusStyles[status] ?? "bg-graphite/10 text-graphite/70",
        className,
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
