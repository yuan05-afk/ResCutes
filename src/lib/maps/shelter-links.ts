/**
 * Location / contact deep links for shelters.
 * Prefer coordinates for Maps accuracy.
 */

export function googleMapsPinUrl(
  latitude: number,
  longitude: number,
  zoom = 17,
): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}`;
}

export function googleMapsDirectionsUrl(
  latitude: number,
  longitude: number,
): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

export function shelterMapAppHref(directoryId: string): string {
  return `/shelters?highlight=${encodeURIComponent(directoryId)}`;
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

export function formatFullShelterAddress(
  address: string,
  city?: string,
  region?: string,
): string {
  return [address, city, region].filter(Boolean).join(", ");
}
