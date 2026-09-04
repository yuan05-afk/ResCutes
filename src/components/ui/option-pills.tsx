"use client";

import { cn } from "@/lib/utils";
import type { FieldOption } from "@/lib/forms/animal-field-options";

interface OptionPillsProps {
  options: FieldOption[];
  /** Selected values (multi). */
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
  disabled?: boolean;
}

export function OptionPills({
  options,
  value,
  onChange,
  className,
  disabled,
}: OptionPillsProps) {
  const selected = new Set(value.map((v) => v.toLowerCase()));

  function toggle(optionValue: string) {
    if (disabled) return;
    const exists = selected.has(optionValue.toLowerCase());
    if (exists) {
      onChange(value.filter((v) => v.toLowerCase() !== optionValue.toLowerCase()));
    } else {
      onChange([...value, optionValue]);
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((opt) => {
        const active = selected.has(opt.value.toLowerCase());
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => toggle(opt.value)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
              active
                ? "border-evergreen bg-evergreen text-white"
                : "border-sage/35 bg-white text-graphite/70 hover:border-evergreen/40 hover:bg-evergreen/5",
              disabled && "opacity-50",
            )}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Parse comma-separated temperament string ↔ pill array. */
export function temperamentToPills(value: string): string[] {
  if (!value.trim()) return [];
  return value
    .split(/[,;]+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function pillsToTemperament(pills: string[], extraNote?: string): string {
  const parts = [...pills];
  const note = extraNote?.trim();
  if (note) parts.push(note);
  return parts.join(", ");
}
