"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { MapLegendItem } from "@/components/map/map-constants";

interface MapLegendProps {
  items: MapLegendItem[];
  compact?: boolean;
  className?: string;
}

interface LegendPlacement {
  left: number;
  bottom: number;
  maxWidth: number;
}

function measureLegendPlacement(
  mapRoot: HTMLElement,
  compact: boolean,
): LegendPlacement | null {
  const logo = mapRoot.querySelector<HTMLElement>(".mapboxgl-ctrl-logo");
  if (!logo) return null;

  const mapRect = mapRoot.getBoundingClientRect();
  const logoRect = logo.getBoundingClientRect();
  const gap = compact ? 6 : 8;
  const rightReserve = compact ? 44 : 52;

  const left = Math.ceil(logoRect.right - mapRect.left + gap);
  const bottom = Math.max(6, Math.round(mapRect.bottom - logoRect.bottom));
  const maxWidth = Math.max(120, Math.floor(mapRect.width - left - rightReserve));

  return { left, bottom, maxWidth };
}

export function MapLegend({ items, compact = false, className }: MapLegendProps) {
  const legendRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<LegendPlacement | null>(null);

  useEffect(() => {
    const legendEl = legendRef.current;
    if (!legendEl) return;

    const mapRoot = legendEl.closest<HTMLElement>(".rescutes-map");
    if (!mapRoot) return;

    const update = () => {
      const next = measureLegendPlacement(mapRoot, compact);
      if (next) setPlacement(next);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(mapRoot);
    observer.observe(legendEl);

    const logo = mapRoot.querySelector(".mapboxgl-ctrl-logo");
    if (logo) observer.observe(logo);

    const mapCanvas = mapRoot.querySelector(".mapboxgl-canvas");
    if (mapCanvas) observer.observe(mapCanvas);

    const poll = window.setInterval(update, 250);
    const stopPoll = window.setTimeout(() => window.clearInterval(poll), 4000);

    return () => {
      observer.disconnect();
      window.clearInterval(poll);
      window.clearTimeout(stopPoll);
    };
  }, [compact, items.length]);

  const fallbackLeftPx = compact ? 108 : 104;

  return (
    <div
      ref={legendRef}
      className={cn(
        "pointer-events-auto absolute z-10 w-max",
        "flex shrink-0 items-center rounded-md border border-sage/25 bg-white/94 shadow-card backdrop-blur-sm",
        compact ? "h-5 gap-1.5 px-1.5" : "h-6 gap-2 px-2",
        className,
      )}
      style={
        {
          left: placement?.left ?? fallbackLeftPx,
          bottom: placement?.bottom ?? (compact ? 8 : 9),
          maxWidth:
            placement?.maxWidth ??
            (compact ? "calc(100% - 7.5rem)" : "calc(100% - 7rem)"),
        } as CSSProperties
      }
      role="region"
      aria-label="Map legend"
    >
      <ul
        className={cn(
          "flex shrink-0 flex-nowrap items-center",
          compact ? "gap-x-2" : "gap-x-3",
        )}
      >
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <div
              className={cn(
                "group flex items-center gap-1.5 rounded-md transition-colors duration-200",
                compact ? "px-0.5 py-0" : "px-1 py-0.5",
                "hover:bg-bone/90",
              )}
              title={item.description}
            >
              <span
                className={cn(
                  "rescutes-map-legend-dot shrink-0",
                  compact && "rescutes-map-legend-dot--compact",
                )}
                style={{ "--legend-color": item.color } as CSSProperties}
                aria-hidden
              />
              <span
                className={cn(
                  "whitespace-nowrap font-semibold text-graphite transition-colors duration-200 group-hover:text-evergreen",
                  compact ? "text-[9px] leading-none" : "text-[10px] leading-none",
                )}
              >
                {item.label}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
