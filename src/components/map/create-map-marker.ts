export function createMapMarkerElement({
  color,
  selected,
  clickable,
  label,
}: {
  color: string;
  selected: boolean;
  clickable: boolean;
  label?: string;
}) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = [
    "rescutes-map-marker",
    selected ? "rescutes-map-marker--selected" : "",
    clickable ? "rescutes-map-marker--clickable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  el.style.setProperty("--marker-color", color);

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
