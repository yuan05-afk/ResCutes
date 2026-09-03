"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmVariant = "danger" | "primary" | "default" | "destructive";

export function ConfirmDialog({
  open,
  title,
  message,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  pending: pendingProp,
  onConfirm,
  onClose,
  onCancel,
}: {
  open: boolean;
  title: string;
  /** Preferred copy prop */
  message?: string;
  /** Alias used by some call sites */
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  /** External pending (e.g. parent action state) */
  pending?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose?: () => void;
  /** Alias for onClose */
  onCancel?: () => void;
}) {
  const titleId = useId();
  const messageId = useId();
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const loading = Boolean(pendingProp) || busy;
  const body = message ?? description ?? "";
  const isDanger = variant === "danger" || variant === "destructive";
  const dismissRef = useRef(onClose ?? onCancel);
  dismissRef.current = onClose ?? onCancel;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setBusy(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) dismissRef.current?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading]);

  async function handleConfirm() {
    if (loading) return;
    setBusy(true);
    try {
      await onConfirm();
      dismissRef.current?.();
    } finally {
      setBusy(false);
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-graphite/45 backdrop-blur-sm"
        aria-label="Close dialog"
        disabled={loading}
        onClick={() => {
          if (!loading) dismissRef.current?.();
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={body ? messageId : undefined}
        className="relative z-10 w-full max-w-md rounded-2xl border border-sage/30 bg-white p-5 shadow-elevated sm:p-6"
      >
        <div className="flex gap-3">
          {isDanger ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rescue/10 text-rescue">
              <AlertTriangle className="h-5 w-5" strokeWidth={2} />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="text-base font-semibold tracking-tight text-graphite"
            >
              {title}
            </h2>
            {body ? (
              <p
                id={messageId}
                className="mt-1.5 text-sm leading-relaxed text-graphite/60"
              >
                {body}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => dismissRef.current?.()}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDanger ? "destructive" : "default"}
            onClick={() => void handleConfirm()}
            disabled={loading}
            className={cn(loading && "opacity-90")}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
