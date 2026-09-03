"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  showToast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_EVENT = "rc-toast";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const iconTone: Record<ToastVariant, string> = {
  success: "text-evergreen",
  error: "text-rescue",
  info: "text-graphite/70",
};

const borderTone: Record<ToastVariant, string> = {
  success: "border-evergreen/25",
  error: "border-rescue/30",
  info: "border-sage/35",
};

function ToastStack({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-[min(100%-2rem,22rem)] -translate-x-1/2 flex-col gap-2 md:bottom-6 md:left-auto md:right-4 md:translate-x-0"
      aria-live="polite"
    >
      {items.map((item) => {
        const Icon = icons[item.variant];
        return (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex gap-3 rounded-xl border bg-white px-3.5 py-3 shadow-elevated transition duration-200",
              borderTone[item.variant],
            )}
          >
            <Icon
              className={cn("mt-0.5 h-4 w-4 shrink-0", iconTone[item.variant])}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-graphite">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 text-xs text-graphite/55">
                  {item.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="shrink-0 rounded-md p-1 text-graphite/40 transition hover:bg-bone hover:text-graphite"
              aria-label="Dismiss"
              onClick={() => onDismiss(item.id)}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (input: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const item: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? "info",
      };
      setItems((prev) => [...prev.slice(-3), item]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  useEffect(() => {
    function onEvent(e: Event) {
      const detail = (e as CustomEvent<ToastInput>).detail;
      if (detail?.title) showToast(detail);
    }
    window.addEventListener(TOAST_EVENT, onEvent);
    return () => window.removeEventListener(TOAST_EVENT, onEvent);
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted ? <ToastStack items={items} onDismiss={dismiss} /> : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

/** Preferred API: showToast({ title, description?, variant? }) */
export function showToast(input: ToastInput) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ToastInput>(TOAST_EVENT, { detail: input }),
  );
}

/** Legacy shorthand used by adoption flows. */
export function toast(
  message: string,
  tone: ToastVariant = "success",
  _durationMs = 4000,
) {
  showToast({ title: message, variant: tone });
}

/** @deprecated ToastProvider already mounts the viewport. */
export function ToastViewport() {
  return null;
}
