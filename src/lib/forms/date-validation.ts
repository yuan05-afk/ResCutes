/** Date helpers for form validation (local calendar dates, YYYY-MM-DD). */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(value: string): Date | null {
  if (!ISO_DATE.test(value)) return null;
  const [ys, ms, ds] = value.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatDisplayDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? parseIsoDate(value) : value;
  if (!date) return "";
  return date.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function addDaysIso(iso: string, days: number): string | null {
  const date = parseIsoDate(iso);
  if (!date) return null;
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export type DateValidationOptions = {
  required?: boolean;
  /** Inclusive minimum (YYYY-MM-DD). */
  min?: string;
  /** Inclusive maximum (YYYY-MM-DD). */
  max?: string;
  label?: string;
  /** Disallow dates before today (local). */
  notBeforeToday?: boolean;
};

export function validateIsoDate(
  value: string | null | undefined,
  opts: DateValidationOptions = {},
): string | null {
  const label = opts.label ?? "Date";
  const trimmed = (value ?? "").trim();

  if (!trimmed) {
    return opts.required ? `${label} is required.` : null;
  }

  if (!ISO_DATE.test(trimmed)) {
    return `${label} must be a valid date.`;
  }

  const date = parseIsoDate(trimmed);
  if (!date) {
    return `${label} is not a real calendar date.`;
  }

  let min = opts.min;
  if (opts.notBeforeToday) {
    const today = todayIso();
    min = !min || min < today ? today : min;
  }

  if (min) {
    const minDate = parseIsoDate(min);
    if (minDate && date < minDate) {
      return `${label} cannot be before ${formatDisplayDate(min)}.`;
    }
  }

  if (opts.max) {
    const maxDate = parseIsoDate(opts.max);
    if (maxDate && date > maxDate) {
      return `${label} cannot be after ${formatDisplayDate(opts.max)}.`;
    }
  }

  return null;
}

/** Default medical follow-up window: today through +1 year. */
export function followUpDateBounds() {
  const min = todayIso();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  return { min, max: toIsoDate(maxDate) };
}
