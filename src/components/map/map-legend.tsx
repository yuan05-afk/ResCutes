"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { MapLegendItem } from "@/components/map/map-constants";

interface MapLegendProps {
  items: MapLegendItem[];
  compact?: boolean;
  className?: string;
  interactive?: boolean;
  hiddenLayerIds?: Set<string>;
  onToggleLayer?: (layerId: string) => void;
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
  const gap = compact ? 6 : 10;
  const rightReserve = compact ? 4 : 12;

  const left = Math.ceil(logoRect.right - mapRect.left + gap);
  const bottom = Math.max(6, Math.round(mapRect.bottom - logoRect.bottom));
  const maxWidth = Math.max(
    compact ? 200 : 180,
    Math.floor(mapRect.width - left - rightReserve),
  );

  return { left, bottom, maxWidth };
}

function displayLabel(item: MapLegendItem, compact: boolean) {
  if (compact && item.compactLabel) return item.compactLabel;
  return item.label;
}

export function MapLegend({
  items,
  compact = false,
  className,
  interactive = false,
  hiddenLayerIds,
  onToggleLayer,
}: MapLegendProps) {
  const legendRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [placement, setPlacement] = useState<LegendPlacement | null>(null);
  const [fitScale, setFitScale] = useState(1);
  const [pillWidth, setPillWidth] = useState<number | null>(null);

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

  useLayoutEffect(() => {
    const legendEl = legendRef.current;
    const listEl = listRef.current;
    if (!legendEl || !listEl) return;

    const fit = () => {
      listEl.style.transform = "none";
      const padX = compact ? 10 : 16;
      const maxOuter =
        placement?.maxWidth ??
        Math.max(180, legendEl.parentElement?.clientWidth ?? 280);
      const neededInner = listEl.scrollWidth;
      if (neededInner <= 0) {
        setFitScale(1);
        setPillWidth(null);
        return;
      }

      const neededOuter = neededInner + padX;
      if (neededOuter <= maxOuter) {
        setFitScale(1);
        setPillWidth(neededOuter);
        return;
      }

      // Prefer short compact labels over aggressive shrink so text stays readable.
      const scale = Math.max(0.92, (maxOuter - padX) / neededInner);
      setFitScale(scale);
      setPillWidth(maxOuter);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(listEl);
    return () => observer.disconnect();
  }, [items, placement?.maxWidth, compact, placement?.left]);

  const fallbackLeftPx = compact ? 52 : 104;

  return (
    <div
      ref={legendRef}
      className={cn(
        "pointer-events-auto absolute z-10",
        "flex shrink-0 items-center rounded-md border border-sage/25 bg-white/94 shadow-card backdrop-blur-sm",
        compact ? "h-7 gap-1 px-1.5" : "h-6 gap-2 px-2",
        className,
      )}
      style={
        {
          left: placement?.left ?? fallbackLeftPx,
          bottom: placement?.bottom ?? (compact ? 8 : 9),
          width: pillWidth ?? undefined,
          maxWidth:
            placement?.maxWidth ??
            (compact ? "calc(100% - 3.25rem)" : "calc(100% - 7rem)"),
        } as CSSProperties
      }
      role="region"
      aria-label="Map legend"
    >
      <ul
        ref={listRef}
        className={cn(
          "flex w-max flex-nowrap items-center origin-left",
          compact ? "gap-x-1" : "gap-x-3",
        )}
        style={{
          transform: fitScale < 0.999 ? `scale(${fitScale})` : undefined,
        }}
      >
        {items.map((item) => {
          const hidden = hiddenLayerIds?.has(item.id) ?? false;
          const visible = displayLabel(item, compact);
          const fullName = item.label;
          const hint = item.description
            ? `${fullName}: ${item.description}`
            : fullName;
          const content = (
            <>
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
                  "rescutes-map-legend-label whitespace-nowrap font-semibold text-graphite transition-colors duration-200",
                  compact
                    ? "text-[9px] leading-snug tracking-wide"
                    : "text-[10px] leading-[1.15]",
                  !hidden && "group-hover:text-evergreen",
                )}
              >
                {visible}
              </span>
            </>
          );

          if (!interactive) {
            return (
              <li key={item.id} className="shrink-0">
                <div
                  className={cn(
                    "group flex items-center gap-1 rounded-md transition-colors duration-200",
                    compact ? "px-0.5 py-0.5" : "px-1 py-0.5",
                    "hover:bg-bone/90",
                  )}
                  title={hint}
                  aria-label={hint}
                >
                  {content}
                </div>
              </li>
            );
          }

          return (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                className={cn(
                  "group flex items-center gap-1 rounded-md transition-colors duration-200",
                  compact ? "px-0.5 py-0.5" : "px-1 py-0.5",
                  "hover:bg-bone/90",
                  hidden && "rescutes-map-legend-item--hidden",
                )}
                title={
                  hidden
                    ? `Show ${fullName}. ${item.description}`
                    : `Hide ${fullName}. ${item.description}`
                }
                aria-label={
                  hidden
                    ? `Show ${fullName} layer`
                    : `Hide ${fullName} layer`
                }
                aria-pressed={!hidden}
                onClick={() => onToggleLayer?.(item.id)}
              >
                {content}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
