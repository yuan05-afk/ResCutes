import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  showLabel,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-graphite/60">
          <span>{pct}% occupied</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-sage/25">
        <div
          className={cn(
            "h-full rounded-full bg-evergreen transition-all duration-500 motion-reduce:transition-none",
            barClassName,
            pct > 85 && "bg-ochre",
            pct > 95 && "bg-rescue",
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
