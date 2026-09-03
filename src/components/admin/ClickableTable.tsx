"use client";

import { cn } from "@/lib/utils";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

export const thActionsClass = "px-3 py-2.5 text-right font-semibold sm:px-4";
export const tdActionsClass = "px-3 py-2.5 text-right sm:px-4";

interface ClickableRowProps {
  onOpen: () => void;
  children: ReactNode;
  className?: string;
}

export function ClickableRow({ onOpen, children, className }: ClickableRowProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLTableRowElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  }

  return (
    <tr
      className={cn(
        "cursor-pointer border-b border-sage/15 last:border-0 transition-colors hover:bg-bone/50",
        className,
      )}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Open details"
    >
      {children}
    </tr>
  );
}

export function stopRowClick(e: MouseEvent | KeyboardEvent) {
  e.stopPropagation();
}

interface PaginationBarProps {
  from: number;
  to: number;
  total: number;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PaginationBar({
  from,
  to,
  total,
  page,
  totalPages,
  onPrev,
  onNext,
}: PaginationBarProps) {
  if (total <= 0) return null;

  return (
    <div className="flex shrink-0 items-center justify-between border-t border-sage/20 px-4 py-2 text-xs text-graphite/60">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="rounded-lg border border-sage/30 px-3 py-1.5 font-medium text-graphite transition hover:bg-bone disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-xs">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="rounded-lg border border-sage/30 px-3 py-1.5 font-medium text-graphite transition hover:bg-bone disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
