export function createMapMarkerElement({
  color,
  selected,
  clickable,
  label,
  legendLayerId,
  photoUrl,
  showPhoto = false,
}: {
  color: string;
  selected: boolean;
  clickable: boolean;
  label?: string;
  legendLayerId?: string;
  photoUrl?: string;
  showPhoto?: boolean;
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
  fade.setAttribute("aria-hidden", "true");

  if (photoUrl) {
    el.dataset.photoUrl = photoUrl;
    const img = document.createElement("img");
    img.className = "rescutes-map-marker-photo";
    img.alt = "";
    img.decoding = "async";
    img.loading = "lazy";
    img.draggable = false;
    img.src = photoUrl;
    fade.appendChild(img);
  }

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

  applyMarkerPhotoVisibility(el, showPhoto);

  return el;
}

/** Toggle animal photo on a case pin (false keeps the simple urgency dot). */
export function applyMarkerPhotoVisibility(
  element: HTMLElement,
  showPhoto: boolean,
) {
  const photoUrl = element.dataset.photoUrl;
  const active = Boolean(showPhoto && photoUrl);
  element.classList.toggle("rescutes-map-marker-shell--photo", active);

  const img = element.querySelector<HTMLImageElement>(
    ":scope > .rescutes-map-marker-fade > .rescutes-map-marker-photo",
  );
  if (img) {
    img.classList.toggle("rescutes-map-marker-photo--on", active);
    if (active && photoUrl && img.getAttribute("src") !== photoUrl) {
      img.src = photoUrl;
    }
  }

  const wrap = element.parentElement;
  if (wrap?.classList.contains("mapboxgl-marker")) {
    wrap.style.zIndex = active ? "5" : "";
  }
}
