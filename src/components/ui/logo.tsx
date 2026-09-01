import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({
  className,
  variant = "dark",
  showWordmark = true,
  size = "md",
}: LogoProps) {
  const iconSize = size === "sm" ? "h-5 w-5" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  const textSize = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl",
          variant === "light" ? "bg-white/10" : "bg-evergreen/10",
          size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9",
        )}
      >
        <PawPrint
          className={cn(
            iconSize,
            variant === "light" ? "text-white" : "text-evergreen",
          )}
        />
      </div>
      {showWordmark && (
        <span
          className={cn(
            "font-bold tracking-tight",
            textSize,
            variant === "light" ? "text-white" : "text-evergreen",
          )}
        >
          ResCutes
        </span>
      )}
    </div>
  );
}
