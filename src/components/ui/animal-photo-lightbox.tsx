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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-graphite/80 backdrop-blur-sm"
        aria-label="Close photo"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-graphite shadow-elevated"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="truncate text-sm font-semibold text-white"
            >
              {alt}
            </h2>
            {caption ? (
              <p className="truncate text-xs text-white/55">{caption}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black/40 p-3 sm:p-5">
          <div className="relative h-[min(72vh,640px)] w-full">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              unoptimized
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
          </div>
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
        "group relative block w-full cursor-zoom-in overflow-hidden text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen/40 focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 bg-graphite/0 transition-colors",
          "group-hover:bg-graphite/15 group-focus-visible:bg-graphite/10",
        )}
        aria-hidden
      />
      {showHint ? (
        <span
          className={cn(
            "pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-lg",
            "border border-white/25 bg-graphite/60 px-2 py-1 text-[10px] font-semibold text-white",
            "opacity-90 shadow-sm backdrop-blur-sm transition-opacity",
            "group-hover:opacity-100 group-focus-visible:opacity-100",
          )}
          aria-hidden
        >
          <ZoomIn className="h-3 w-3" />
          Expand
        </span>
      ) : null}
    </button>
  );
}
