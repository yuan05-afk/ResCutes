"use client";

import { cn } from "@/lib/utils";
import {
  useCallback,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";

/** Shared table cell styles */
export const tableThClass =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-graphite/60 whitespace-nowrap";

export const tableTdClass = "px-4 py-3 align-middle text-sm";

export function TableColGroup({ widths }: { widths: string[] }) {
  return (
    <colgroup>
      {widths.map((width, index) => (
        <col key={`${width}-${index}`} style={{ width }} />
      ))}
    </colgroup>
  );
}

export function TableToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 rounded-xl border border-sage/20 bg-white p-3 shadow-card">
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
    </div>
  );
}

export function TableCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card lg:flex-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TableMetaLine({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 border-b border-sage/20 bg-bone/40 px-4 py-2.5 text-xs text-graphite/55">
      {children}
    </div>
  );
}

export function useSyncedTableScroll() {
  const bodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const onBodyScroll = useCallback(() => {
    if (bodyRef.current && headerRef.current) {
      headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
    }
  }, []);

  return { bodyRef, headerRef, onBodyScroll };
}

export function TableHeaderPane({
  headerRef,
  minWidth,
  colGroup,
  children,
}: {
  headerRef: RefObject<HTMLDivElement | null>;
  minWidth: number;
  colGroup: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      ref={headerRef}
      className="shrink-0 overflow-x-hidden border-b border-sage/25 bg-white"
      aria-hidden
    >
      <table
        className="w-full table-fixed text-sm"
        style={{ minWidth }}
      >
        {colGroup}
        <thead>{children}</thead>
      </table>
    </div>
  );
}

export function TableBodyPane({
  bodyRef,
  onBodyScroll,
  minWidth,
  colGroup,
  children,
  emptyMessage,
  isEmpty,
}: {
  bodyRef: RefObject<HTMLDivElement | null>;
  onBodyScroll: () => void;
  minWidth: number;
  colGroup: ReactNode;
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}) {
  return (
    <div
      ref={bodyRef}
      onScroll={onBodyScroll}
      className="rc-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto"
    >
      <table
        className="w-full table-fixed text-sm"
        style={{ minWidth }}
      >
        {colGroup}
        <tbody>
          {isEmpty ? (
            <tr>
              <td
                colSpan={100}
                className="px-4 py-14 text-center text-sm text-graphite/50"
              >
                {emptyMessage ?? "No results found."}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export const thActionsClass =
  "px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-graphite/60 whitespace-nowrap";
export const tdActionsClass = "px-4 py-3 text-right align-middle";

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
    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-sage/20 bg-bone/20 px-4 py-2.5 text-xs text-graphite/60">
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
