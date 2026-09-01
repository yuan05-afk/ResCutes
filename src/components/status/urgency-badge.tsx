import { cn } from "@/lib/utils";
import { getUrgencyLevelLabel } from "@/lib/urgency/scoring";
import { AlertTriangle, Circle } from "lucide-react";

interface UrgencyBadgeProps {
  level: string;
  score?: number;
  className?: string;
  size?: "sm" | "md";
}

const levelStyles: Record<string, string> = {
  critical: "bg-rescue/12 text-rescue border-rescue/25",
  high: "bg-ochre/12 text-ochre border-ochre/30",
  medium: "bg-sage/25 text-evergreen border-sage/40",
  low: "bg-graphite/8 text-graphite/80 border-graphite/15",
};

export function UrgencyBadge({
  level,
  score,
  className,
  size = "sm",
}: UrgencyBadgeProps) {
  const label = getUrgencyLevelLabel(
    level as "critical" | "high" | "medium" | "low",
  );
  const Icon =
    level === "critical" || level === "high" ? AlertTriangle : Circle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        levelStyles[level] ?? levelStyles.low,
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      <span>
        {label}
        {score !== undefined && score > 0 && (
          <span className="font-medium normal-case"> · {score}</span>
        )}
      </span>
    </span>
  );
}
