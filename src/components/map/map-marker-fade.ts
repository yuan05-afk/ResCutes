/** Marker fade utilities, adapted from TrakNgBasura layer toggle pattern. */

export const MAP_MARKER_FADE_MS = 320;

export function attachMarkerFadeShell(el: HTMLElement) {
  if (el.querySelector(":scope > .rescutes-map-marker-fade")) return;

  const fade = document.createElement("span");
  fade.className = "rescutes-map-marker-fade";
  fade.setAttribute("aria-hidden", "true");

  while (el.firstChild) {
    fade.appendChild(el.firstChild);
  }

  el.appendChild(fade);
}

export function applyMarkerHidden(
  el: HTMLElement,
  hidden: boolean,
  animate: boolean,
) {
  if (!animate) {
    el.classList.add("rescutes-map-marker--instant");
    el.classList.toggle("rescutes-map-marker--off", hidden);
    return;
  }

  el.classList.remove("rescutes-map-marker--instant");
  void el.offsetWidth;
  el.classList.toggle("rescutes-map-marker--off", hidden);
}

export function markerDataSignature(marker: {
  id: string;
  latitude: number;
  longitude: number;
  color?: string;
  urgencyLevel?: string;
  legendLayerId?: string;
  label?: string;
  photoUrl?: string;
}): string {
  return [
    marker.id,
    marker.latitude.toFixed(5),
    marker.longitude.toFixed(5),
    marker.color ?? "",
    marker.urgencyLevel ?? "",
    marker.legendLayerId ?? "",
    marker.label ?? "",
    marker.photoUrl ?? "",
  ].join(":");
}

export function visibleMarkersBoundsSignature(
  markers: { latitude: number; longitude: number; legendLayerId?: string; urgencyLevel?: string }[],
  hiddenLegendLayers: Set<string>,
): string {
  return markers
    .filter((marker) => {
      const layerId = marker.legendLayerId ?? marker.urgencyLevel ?? "standard";
      return !hiddenLegendLayers.has(layerId);
    })
    .map((marker) => `${marker.latitude.toFixed(4)},${marker.longitude.toFixed(4)}`)
    .sort()
    .join("|");
}
