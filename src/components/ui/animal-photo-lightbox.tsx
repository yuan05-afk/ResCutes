"use client";

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnimalPhotoLightbox({
  open,
  onClose,
  src,
  alt,
  caption,
}: {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  caption?: string;
}) {
  const titleId = useId();

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
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-graphite/70 backdrop-blur-[2px]"
        aria-label="Close photo"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(94vh,920px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-sage/25 bg-bone shadow-elevated sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-sage/20 bg-white px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-evergreen/70">
              Animal photo
            </p>
            <h2
              id={titleId}
              className="truncate text-base font-bold tracking-tight text-graphite"
            >
              {alt}
            </h2>
            {caption ? (
              <p className="mt-0.5 truncate text-xs text-graphite/55">
                {caption}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sage/30 bg-bone text-graphite/70 transition hover:border-evergreen/30 hover:bg-evergreen/5 hover:text-evergreen"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Photo stage — bone canvas so contain doesn't feel like dead black bars */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-gradient-to-b from-white to-bone px-3 py-4 sm:px-6 sm:py-6">
          <div className="relative h-[min(68vh,560px)] w-full overflow-hidden rounded-xl border border-sage/20 bg-white shadow-card">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain p-1 sm:p-2"
              unoptimized
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        </div>

        {/* Footer hint */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-sage/20 bg-white px-4 py-2.5 sm:px-5">
          <p className="text-[11px] text-graphite/45">
            Full photo · Esc or outside to close
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-sage/30 bg-bone px-3 py-1.5 text-xs font-semibold text-graphite transition hover:border-evergreen/30 hover:bg-evergreen/5 hover:text-evergreen"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ExpandablePhotoTrigger({
  onClick,
  className,
  children,
  label = "View full photo",
  showHint = true,
}: {
  onClick: () => void;
  className?: string;
  children: ReactNode;
  label?: string;
  showHint?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className={cn(
        "group relative block h-full w-full cursor-zoom-in overflow-hidden text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen/40 focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 bg-graphite/0 transition-colors duration-200",
          "group-hover:bg-graphite/20 group-focus-visible:bg-graphite/15",
        )}
        aria-hidden
      />
      {showHint ? (
        <span
          className={cn(
            "pointer-events-none absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-lg",
            "border border-white/30 bg-evergreen/90 px-2 py-1 text-[10px] font-semibold text-white",
            "shadow-sm backdrop-blur-sm transition-opacity duration-200",
            "opacity-95 group-hover:opacity-100",
          )}
          aria-hidden
        >
          <ZoomIn className="h-3 w-3" />
          Expand
        </span>
      ) : (
        <span
          className={cn(
            "pointer-events-none absolute inset-0 z-10 flex items-center justify-center",
            "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          )}
          aria-hidden
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-evergreen/90 text-white shadow-sm">
            <ZoomIn className="h-3.5 w-3.5" />
          </span>
        </span>
      )}
    </button>
  );
}
