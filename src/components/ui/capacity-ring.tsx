import { cn } from "@/lib/utils";

interface CapacityRingProps {
  percentage: number;
  size?: number;
  className?: string;
}

export function CapacityRing({
  percentage,
  size = 48,
  className,
}: CapacityRingProps) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className={cn("-rotate-90", className)}
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-sage/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={cn(
          "text-evergreen transition-all duration-500 motion-reduce:transition-none",
          percentage > 85 && "text-ochre",
          percentage > 95 && "text-rescue",
        )}
      />
    </svg>
  );
}
