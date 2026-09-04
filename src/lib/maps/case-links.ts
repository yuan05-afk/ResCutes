/**
 * Location / navigation deep links for rescue cases.
 * Prefer place labels over bare coordinates when available.
 */

export interface CaseMapsLocation {
  caseNumber: string;
  locationLabel?: string | null;
  locationNote?: string | null;
  latitude: number;
  longitude: number;
}

function normalizePart(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

function withPhilippines(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return "Philippines";
  if (/philippines/i.test(trimmed)) return trimmed;
  return `${trimmed}, Philippines`;
}

function hasFiniteCoords(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && Number.isFinite(longitude);
}

/** Human-readable location line for UI and map queries. */
export function formatCaseLocationDisplay(location: CaseMapsLocation): string {
  const label = normalizePart(location.locationLabel);
  const note = normalizePart(location.locationNote);

  if (label && note) return `${label} · ${note}`;
  if (label) return label;
  if (note) return note;
  if (hasFiniteCoords(location.latitude, location.longitude)) {
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }
  return "Report location";
}

export function buildCaseMapsQuery(location: CaseMapsLocation): string {
  const label = normalizePart(location.locationLabel);
  const note = normalizePart(location.locationNote);

  if (label) {
    const base = note ? `${label} (${note})` : label;
    return withPhilippines(base);
  }
  if (note) return withPhilippines(note);

  if (hasFiniteCoords(location.latitude, location.longitude)) {
    return `${location.latitude},${location.longitude}`;
  }

  return withPhilippines(location.caseNumber);
}

export function googleMapsCasePinUrl(
  location: CaseMapsLocation,
  zoom = 17,
): string {
  const hasPlaceText = Boolean(
    normalizePart(location.locationLabel) || normalizePart(location.locationNote),
  );

  if (hasPlaceText) {
    const params = new URLSearchParams({
      api: "1",
      query: buildCaseMapsQuery(location),
    });
    return `https://www.google.com/maps/search/?${params.toString()}`;
  }

  if (hasFiniteCoords(location.latitude, location.longitude)) {
    const label = encodeURIComponent(location.caseNumber);
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}+(${label})&z=${zoom}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildCaseMapsQuery(location))}`;
}

export function googleMapsCaseDirectionsUrl(
  location: CaseMapsLocation,
): string {
  const params = new URLSearchParams({ api: "1" });
  const hasPlaceText = Boolean(
    normalizePart(location.locationLabel) || normalizePart(location.locationNote),
  );

  if (hasPlaceText) {
    params.set("destination", buildCaseMapsQuery(location));
  } else if (hasFiniteCoords(location.latitude, location.longitude)) {
    params.set(
      "destination",
      `${location.latitude},${location.longitude}`,
    );
  } else {
    params.set("destination", buildCaseMapsQuery(location));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function formatCaseCoordinates(
  latitude: number,
  longitude: number,
): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
