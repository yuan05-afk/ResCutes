export function createMapMarkerElement({
  color,
  selected,
  clickable,
  label,
  legendLayerId,
}: {
  color: string;
  selected: boolean;
  clickable: boolean;
  label?: string;
  legendLayerId?: string;
}) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = [
    "rescutes-map-marker-shell",
    selected ? "rescutes-map-marker-shell--selected" : "",
    clickable ? "rescutes-map-marker-shell--clickable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const fade = document.createElement("span");
  fade.className = "rescutes-map-marker-fade";
  fade.style.setProperty("--marker-color", color);
  el.appendChild(fade);

  if (legendLayerId) {
    el.dataset.legendLayer = legendLayerId;
  }

  if (label) {
    el.setAttribute("aria-label", label);
    el.title = label;
  } else {
    el.setAttribute("aria-label", "Map pin");
  }

  if (!clickable) {
    el.disabled = true;
    el.tabIndex = -1;
  }

  return el;
}
