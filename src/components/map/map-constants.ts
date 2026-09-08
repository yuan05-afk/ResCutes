export const MAP_MARKER_COLORS = {
  critical: "#C7513A",
  high: "#C9912F",
  standard: "#183C35",
} as const;

/** Home-map shelter pins. Blue so they stay distinct from case greens. */
export const SHELTER_PIN_COLOR = "#2F6F9E";

export interface MapLegendItem {
  id: string;
  label: string;
  /** Narrow map shells use this so labels never truncate. */
  compactLabel?: string;
  description: string;
  color: string;
}

export const URGENCY_MAP_LEGEND: MapLegendItem[] = [
  {
    id: "critical",
    label: "Critical",
    compactLabel: "Crit",
    description: "Immediate rescue response",
    color: MAP_MARKER_COLORS.critical,
  },
  {
    id: "high",
    label: "High",
    compactLabel: "High",
    description: "Urgent attention needed",
    color: MAP_MARKER_COLORS.high,
  },
  {
    id: "standard",
    label: "Standard",
    compactLabel: "Std",
    description: "Active case on the map",
    color: MAP_MARKER_COLORS.standard,
  },
];

export function markerColorForUrgency(urgencyLevel?: string) {
  if (urgencyLevel === "critical") return MAP_MARKER_COLORS.critical;
  if (urgencyLevel === "high") return MAP_MARKER_COLORS.high;
  return MAP_MARKER_COLORS.standard;
}

export function legendItemForUrgency(urgencyLevel?: string): MapLegendItem {
  const id =
    urgencyLevel === "critical"
      ? "critical"
      : urgencyLevel === "high"
        ? "high"
        : "standard";
  return URGENCY_MAP_LEGEND.find((item) => item.id === id) ?? URGENCY_MAP_LEGEND[2];
}

export function resolveMapLegendItems(
  markers: { urgencyLevel?: string; color?: string }[],
  mode: "urgency" | "single" | "none" = "urgency",
): MapLegendItem[] {
  if (mode === "none") return [];
  if (mode === "single" || markers.length === 1) {
    const marker = markers[0];
    if (!marker) return [];
    return [legendItemForUrgency(marker.urgencyLevel)];
  }
  return URGENCY_MAP_LEGEND;
}
