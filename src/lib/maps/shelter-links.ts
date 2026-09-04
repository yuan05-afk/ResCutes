/**
 * Location / contact deep links for shelters.
 * Prefer place-name + address queries so Google Maps opens the shelter
 * listing (or a named search), not a bare coordinate pin.
 */

export interface ShelterMapsLocation {
  name: string;
  address: string;
  city?: string | null;
  region?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

function normalizePart(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

function includesIgnoreCase(haystack: string, needle: string): boolean {
  if (!needle) return true;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function withPhilippines(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return "Philippines";
  if (/philippines/i.test(trimmed)) return trimmed;
  return `${trimmed}, Philippines`;
}

/**
 * Street + city + region without duplicating parts already present in address.
 */
export function formatFullShelterAddress(
  address: string,
  city?: string | null,
  region?: string | null,
): string {
  const parts: string[] = [];
  const street = normalizePart(address);
  if (street) parts.push(street);

  const cityPart = normalizePart(city);
  if (cityPart && !includesIgnoreCase(parts.join(", "), cityPart)) {
    parts.push(cityPart);
  }

  const regionPart = normalizePart(region);
  if (regionPart && !includesIgnoreCase(parts.join(", "), regionPart)) {
    parts.push(regionPart);
  }

  return parts.join(", ");
}

/**
 * Place query Google Maps can resolve to a business / named location.
 * Example: "Happy Animals Club, 22 Rigodon Extension, Matina Aplaya, Davao City, Philippines"
 */
export function buildShelterMapsQuery(location: ShelterMapsLocation): string {
  const name = normalizePart(location.name);
  const addressLine = formatFullShelterAddress(
    location.address,
    location.city,
    location.region,
  );

  if (name && addressLine) {
    if (includesIgnoreCase(addressLine, name)) {
      return withPhilippines(addressLine);
    }
    return withPhilippines(`${name}, ${addressLine}`);
  }

  return withPhilippines(name || addressLine);
}

function hasFiniteCoords(
  latitude?: number | null,
  longitude?: number | null,
): latitude is number {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

/**
 * Open Google Maps on the shelter place (name + address search).
 * Falls back to a labeled coordinate pin only when there is no usable place text.
 */
export function googleMapsPinUrl(
  location: ShelterMapsLocation,
  zoom = 17,
): string {
  const query = buildShelterMapsQuery(location);
  const hasPlaceText = Boolean(
    normalizePart(location.name) || normalizePart(location.address),
  );

  if (hasPlaceText) {
    const params = new URLSearchParams({ api: "1", query });
    return `https://www.google.com/maps/search/?${params.toString()}`;
  }

  if (hasFiniteCoords(location.latitude, location.longitude)) {
    const label = encodeURIComponent(normalizePart(location.name) || "Shelter");
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}+(${label})&z=${zoom}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Directions to the shelter place name/address (not raw lat/lng destination).
 */
export function googleMapsDirectionsUrl(location: ShelterMapsLocation): string {
  const query = buildShelterMapsQuery(location);
  const hasPlaceText = Boolean(
    normalizePart(location.name) || normalizePart(location.address),
  );

  const params = new URLSearchParams({ api: "1" });

  if (hasPlaceText) {
    params.set("destination", query);
  } else if (hasFiniteCoords(location.latitude, location.longitude)) {
    params.set(
      "destination",
      `${location.latitude},${location.longitude}`,
    );
  } else {
    params.set("destination", query);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function shelterMapAppHref(
  directoryId: string,
  coords?: { latitude: number; longitude: number } | null,
): string {
  const params = new URLSearchParams({
    highlight: directoryId,
  });
  if (
    coords &&
    Number.isFinite(coords.latitude) &&
    Number.isFinite(coords.longitude)
  ) {
    params.set("lat", String(coords.latitude));
    params.set("lng", String(coords.longitude));
  }
  return `/shelters?${params.toString()}`;
}

export function telHref(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 7) return null;
  return `tel:${digits}`;
}

export function mailtoHref(email: string): string | null {
  const trimmed = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return `mailto:${trimmed}`;
}
