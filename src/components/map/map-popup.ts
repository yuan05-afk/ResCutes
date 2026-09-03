import { formatStatus } from "@/lib/utils";

export interface MapPopupFields {
  label?: string;
  caseNumber?: string;
  species?: string;
  status?: string;
  urgencyLevel?: string;
  address?: string;
  phone?: string;
  region?: string;
  notes?: string;
  capacityLabel?: string;
  sourceLabel?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function hasMapPopupContent(marker: MapPopupFields): boolean {
  return Boolean(
    marker.caseNumber ||
      marker.label ||
      marker.species ||
      marker.status ||
      marker.urgencyLevel ||
      marker.address ||
      marker.phone,
  );
}

export function buildMapPopupHtml(marker: MapPopupFields): string {
  const title = marker.caseNumber ?? marker.label ?? "Location";
  const metaParts: string[] = [];

  if (marker.urgencyLevel) {
    metaParts.push(formatStatus(marker.urgencyLevel));
  }
  if (marker.species) {
    metaParts.push(formatStatus(marker.species));
  }
  if (marker.region) {
    metaParts.push(marker.region);
  }
  if (marker.status && marker.caseNumber) {
    metaParts.push(formatStatus(marker.status));
  }

  const meta = metaParts.map(escapeHtml).join(" · ");
  // Keep shelter hover light — address/phone/notes belong in the detail card.
  const address = marker.caseNumber && marker.address
    ? escapeHtml(marker.address)
    : "";

  return `
    <div class="rescutes-map-popup__body">
      <p class="rescutes-map-popup__title">${escapeHtml(title)}</p>
      ${meta ? `<p class="rescutes-map-popup__meta">${meta}</p>` : ""}
      ${address ? `<p class="rescutes-map-popup__address">${address}</p>` : ""}
    </div>
  `.trim();
}
