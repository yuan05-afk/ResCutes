import { formatStatus } from "@/lib/utils";

export interface MapPopupFields {
  label?: string;
  caseNumber?: string;
  species?: string;
  status?: string;
  urgencyLevel?: string;
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
      marker.urgencyLevel,
  );
}

export function buildMapPopupHtml(marker: MapPopupFields): string {
  const title = marker.caseNumber ?? marker.label ?? "Case";
  const metaParts: string[] = [];

  if (marker.urgencyLevel) {
    metaParts.push(formatStatus(marker.urgencyLevel));
  }
  if (marker.species) {
    metaParts.push(formatStatus(marker.species));
  }

  const meta = metaParts.map(escapeHtml).join(" · ");
  const status = marker.status ? escapeHtml(formatStatus(marker.status)) : "";

  return `
    <div class="rescutes-map-popup__body">
      <p class="rescutes-map-popup__title">${escapeHtml(title)}</p>
      ${meta ? `<p class="rescutes-map-popup__meta">${meta}</p>` : ""}
      ${status ? `<p class="rescutes-map-popup__status">${status}</p>` : ""}
    </div>
  `.trim();
}
