"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { TERMS_OF_USE } from "@/lib/legal/terms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TermsParts({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {TERMS_OF_USE.parts.map((part) => (
        <section key={part.id}>
          <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-evergreen">
            {part.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-graphite/70">
            {part.body}
          </p>
        </section>
      ))}
    </div>
  );
}

export function TermsSheet({
  open,
  onDismiss,
}: {
  open: boolean;
  onDismiss: () => void;
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      if (e.key === "Escape") onDismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-graphite/45"
        aria-label="Dismiss terms"
        onClick={onDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(640px,calc(100svh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-sage/25 bg-white shadow-elevated"
      >
        <div className="border-b border-sage/20 px-5 py-4 text-center">
          <h2
            id={titleId}
            className="text-lg font-semibold tracking-tight text-evergreen"
          >
            {TERMS_OF_USE.title}
          </h2>
        </div>
        <div className="overflow-y-auto px-5 py-4">
          <TermsParts />
        </div>
        <div className="border-t border-sage/20 px-5 py-3">
          <Button type="button" className="w-full" onClick={onDismiss}>
            {TERMS_OF_USE.gotIt}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
