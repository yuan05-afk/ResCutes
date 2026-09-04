"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  OTHER_VALUE,
  type FieldOption,
} from "@/lib/forms/animal-field-options";
import { cn } from "@/lib/utils";

/** Controlled select with an “Other…” choice that reveals a free-text field. */
export function SelectWithOtherSplit({
  id,
  label,
  options,
  choice,
  other,
  onChoiceChange,
  onOtherChange,
  placeholder = "Select…",
  required,
  disabled,
  className,
  selectClassName,
  error,
}: {
  id: string;
  label: string;
  options: FieldOption[];
  choice: string;
  other: string;
  onChoiceChange: (choice: string) => void;
  onOtherChange: (other: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
  error?: string | null;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-rescue"> *</span> : null}
      </Label>
      <Select
        id={id}
        value={choice}
        disabled={disabled}
        onChange={(e) => onChoiceChange(e.target.value)}
        className={cn("h-9", selectClassName)}
        aria-invalid={Boolean(error)}
        placeholder={placeholder}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      {choice === OTHER_VALUE ? (
        <Input
          id={`${id}-other`}
          value={other}
          disabled={disabled}
          placeholder={`Describe ${label.toLowerCase()}…`}
          onChange={(e) => onOtherChange(e.target.value)}
          className="h-9"
          aria-label={`${label} (other)`}
          maxLength={80}
        />
      ) : null}
      {error ? <p className="text-[11px] text-rescue">{error}</p> : null}
    </div>
  );
}
