"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  formatDisplayDate,
  parseIsoDate,
  toIsoDate,
  todayIso,
  validateIsoDate,
} from "@/lib/forms/date-validation";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-SG", {
    month: "long",
    year: "numeric",
  });
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ iso: string; inMonth: boolean; day: number }> = [];

  const prevDays = new Date(year, month, 0).getDate();
  for (let i = startPad - 1; i >= 0; i--) {
    const day = prevDays - i;
    const date = new Date(year, month - 1, day);
    cells.push({ iso: toIsoDate(date), inMonth: false, day });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    cells.push({ iso: toIsoDate(date), inMonth: true, day });
  }

  while (cells.length % 7 !== 0) {
    const day = cells.length - (startPad + daysInMonth) + 1;
    const date = new Date(year, month + 1, day);
    cells.push({ iso: toIsoDate(date), inMonth: false, day: date.getDate() });
  }

  return cells;
}

export interface DatePickerProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (isoDate: string) => void;
  /** Open the calendar when mounted / when this becomes true. */
  openOnMount?: boolean;
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  min?: string;
  max?: string;
  notBeforeToday?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string | null;
  className?: string;
  /** Called after a valid day is chosen. */
  onSelect?: (isoDate: string) => void;
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  openOnMount = false,
  open: openControlled,
  onOpenChange,
  min,
  max,
  notBeforeToday = false,
  required = false,
  disabled = false,
  placeholder = "Select date",
  error,
  className,
  onSelect,
}: DatePickerProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = openControlled !== undefined;
  const open = isControlled ? openControlled : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const effectiveMin = useMemo(() => {
    if (!notBeforeToday) return min;
    const today = todayIso();
    if (!min || min < today) return today;
    return min;
  }, [min, notBeforeToday]);

  const selected = parseIsoDate(value);
  const initialCursor = selected ?? parseIsoDate(effectiveMin ?? "") ?? new Date();
  const [cursor, setCursor] = useState({
    year: initialCursor.getFullYear(),
    month: initialCursor.getMonth(),
  });

  useEffect(() => {
    if (openOnMount && !disabled) {
      setOpen(true);
    }
  }, [openOnMount, disabled, setOpen]);

  useEffect(() => {
    if (!selected) return;
    setCursor({ year: selected.getFullYear(), month: selected.getMonth() });
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function onPointer(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open, setOpen]);

  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setCoords(null);
      return;
    }
    function place() {
      const rect = triggerRef.current!.getBoundingClientRect();
      const panelWidth = Math.max(rect.width, 288);
      const left = Math.min(
        Math.max(8, rect.left),
        window.innerWidth - panelWidth - 8,
      );
      const below = rect.bottom + 6;
      const spaceBelow = window.innerHeight - below;
      const top =
        spaceBelow < 320 && rect.top > 320
          ? Math.max(8, rect.top - 6 - 320)
          : below;
      setCoords({ top, left, width: panelWidth });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const cells = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const today = todayIso();

  function isDisabledDay(iso: string) {
    if (effectiveMin && iso < effectiveMin) return true;
    if (max && iso > max) return true;
    return false;
  }

  function pick(iso: string) {
    if (isDisabledDay(iso)) return;
    const err = validateIsoDate(iso, {
      required,
      min: effectiveMin,
      max,
      label: label ?? "Date",
    });
    if (err) return;
    onChange(iso);
    onSelect?.(iso);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function shiftMonth(delta: number) {
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const display = formatDisplayDate(value) || placeholder;
  const hasValue = Boolean(value && parseIsoDate(value));

  const panel =
    open && coords && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label={label ? `${label} calendar` : "Choose date"}
            className="fixed z-[260] overflow-hidden rounded-xl border border-sage/30 bg-white p-3 shadow-elevated"
            style={{
              top: coords.top,
              left: coords.left,
              width: Math.max(coords.width, 288),
            }}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sage/30 text-graphite transition hover:bg-bone"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm font-semibold text-evergreen">
                {monthLabel(cursor.year, cursor.month)}
              </p>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sage/30 text-graphite transition hover:bg-bone"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-graphite/45"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell) => {
                const disabledDay = isDisabledDay(cell.iso);
                const isSelected = value === cell.iso;
                const isToday = cell.iso === today;
                return (
                  <button
                    key={`${cell.iso}-${cell.inMonth ? "m" : "o"}`}
                    type="button"
                    disabled={disabledDay}
                    onClick={() => pick(cell.iso)}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-lg text-sm transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen/40",
                      !cell.inMonth && "text-graphite/30",
                      cell.inMonth && !isSelected && "text-graphite hover:bg-bone",
                      isToday && !isSelected && "ring-1 ring-sage/50",
                      isSelected && "bg-evergreen font-semibold text-white hover:bg-evergreen/90",
                      disabledDay &&
                        "cursor-not-allowed opacity-35 hover:bg-transparent",
                    )}
                    aria-label={formatDisplayDate(cell.iso)}
                    aria-current={isToday ? "date" : undefined}
                    aria-pressed={isSelected}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-sage/20 pt-2.5">
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs font-medium text-evergreen transition hover:bg-evergreen/8"
                onClick={() => {
                  const t = todayIso();
                  if (!isDisabledDay(t)) pick(t);
                  else {
                    setCursor({
                      year: new Date().getFullYear(),
                      month: new Date().getMonth(),
                    });
                  }
                }}
              >
                Today
              </button>
              {hasValue ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-graphite/60 transition hover:bg-bone hover:text-graphite"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              ) : (
                <span className="text-[11px] text-graphite/40">Pick a day</span>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={cn("space-y-1", className)}>
      {label ? (
        <Label htmlFor={fieldId}>
          {label}
          {required ? <span className="text-rescue"> *</span> : null}
        </Label>
      ) : null}
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        onClick={() => {
          if (disabled) return;
          setOpen(!open);
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-sage/40 bg-white px-3 text-left text-sm transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasValue ? "text-graphite" : "text-graphite/45",
          error && "border-rescue/40",
          open && "ring-2 ring-evergreen/30",
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <CalendarDays className="h-4 w-4 shrink-0 text-evergreen/70" />
          <span className="truncate">{display}</span>
        </span>
        {hasValue ? (
          <span className="shrink-0 text-[11px] text-graphite/40">Change</span>
        ) : null}
      </button>
      {error ? <p className="text-[11px] text-rescue">{error}</p> : null}
      {panel}
    </div>
  );
}
