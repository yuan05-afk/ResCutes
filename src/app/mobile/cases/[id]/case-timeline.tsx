"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TimelineEntry {
  id: string;
  label: string;
  note?: string | null;
  at: string;
}

/** Progressive disclosure for case history on mobile. */
export function MobileCaseTimeline({ entries }: { entries: TimelineEntry[] }) {
  const [open, setOpen] = useState(false);
  const preview = entries.slice(0, 2);
  const rest = entries.slice(2);
  const shown = open ? entries : preview;

  return (
    <section className="overflow-hidden rounded-2xl border border-sage/20 bg-white shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-graphite">Timeline</span>
        {rest.length > 0 ? (
          open ? (
            <ChevronUp className="h-4 w-4 text-graphite/45" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 text-graphite/45" aria-hidden />
          )
        ) : null}
      </button>
      <ul className="space-y-3 border-t border-sage/15 px-4 pb-4 pt-3">
        {shown.map((h) => (
          <li key={h.id} className="flex gap-3 text-sm">
            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sage" />
            <div className="min-w-0">
              <p className="font-medium text-graphite">{h.label}</p>
              {h.note ? (
                <p className="text-graphite/65">{h.note}</p>
              ) : null}
              <p className="text-xs text-graphite/45">{h.at}</p>
            </div>
          </li>
        ))}
      </ul>
      {!open && rest.length > 0 ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="min-h-11 w-full border-t border-sage/15 px-4 py-2 text-center text-xs font-semibold text-evergreen"
        >
          Show {rest.length} more
        </button>
      ) : null}
    </section>
  );
}
