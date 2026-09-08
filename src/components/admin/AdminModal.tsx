"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  "2xl": "max-w-[72rem]",
};

export function AdminModal({
  open,
  onClose,
  title,
  description,
  headerExtra,
  children,
  footer,
  size = "lg",
  placement = "sheet",
  fitViewport = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof sizeClasses;
  placement?: "sheet" | "center";
  /** Lock to viewport height. No body scroll; children must fit or use tabs. */
  fitViewport?: boolean;
}) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const isCenter = placement === "center";

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-graphite/50 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cn(
          "relative z-[81] flex w-full max-h-[calc(100dvh-0.5rem)] flex-col overflow-hidden border border-sage/25 bg-white shadow-elevated sm:max-h-[calc(100dvh-2rem)]",
          sizeClasses[size],
          fitViewport && "min-h-0 sm:min-h-[min(480px,calc(100dvh-3rem))]",
          isCenter ? "rounded-2xl" : "rounded-t-2xl sm:rounded-2xl",
        )}
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-sage/20 bg-bone/40 px-4 py-2.5 sm:px-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1.5">
              <h2
                id={titleId}
                className="text-base font-bold tracking-tight text-graphite sm:text-lg"
              >
                {title}
              </h2>
              {headerExtra ? (
                <div className="flex flex-wrap items-center gap-2">
                  {headerExtra}
                </div>
              ) : null}
            </div>
            {description ? (
              <p id={descId} className="mt-0.5 text-xs text-graphite/55 sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-graphite/45 transition hover:bg-white hover:text-graphite"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rc-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-2.5 sm:px-5 sm:py-3">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-sage/20 bg-bone/30 px-4 py-2.5 sm:px-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function ModalTabs({
  tabs,
  active,
  onChange,
  className,
  wrap = false,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  /** When true, tabs wrap instead of scrolling horizontally. */
  wrap?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 gap-1 rounded-lg border border-sage/20 bg-bone/60 p-1",
        wrap ? "flex-wrap" : "overflow-x-auto",
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen/40",
            wrap ? "min-h-11 grow sm:grow-0" : "shrink-0",
            active === tab.id
              ? "bg-white text-evergreen shadow-sm"
              : "text-graphite/55 hover:bg-white/60 hover:text-graphite",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** Compact label/value cell for modal meta grids. */
export function ModalMeta({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-sage/20 bg-bone/50 px-2.5 py-2",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium leading-snug text-graphite break-words">
        {value}
      </p>
    </div>
  );
}

export function ModalSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-h-0 space-y-1.5", className)}>
      <h3 className="text-[10px] font-semibold uppercase tracking-wide text-graphite/45">
        {title}
      </h3>
      {children}
    </section>
  );
}
