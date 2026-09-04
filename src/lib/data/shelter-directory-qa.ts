import type { PhilippinesShelterRecord } from "@/lib/data/philippines-shelters-directory";

/** Approximate Philippines bounding box for coordinate QA. */
export const PHILIPPINES_BOUNDS = {
  minLat: 4.5,
  maxLat: 21.5,
  minLon: 116,
  maxLon: 127.5,
};

const VAGUE_ADDRESS_PATTERNS = [
  /^cebu city area$/i,
  /^cebu city$/i,
  /^quezon city$/i,
  /^mandaluyong city$/i,
  /^cavite$/i,
  /^bacoor, cavite$/i,
];

export function isWithinPhilippines(lat: number, lon: number): boolean {
  return (
    lat >= PHILIPPINES_BOUNDS.minLat &&
    lat <= PHILIPPINES_BOUNDS.maxLat &&
    lon >= PHILIPPINES_BOUNDS.minLon &&
    lon <= PHILIPPINES_BOUNDS.maxLon
  );
}

export function isVagueAddress(address: string): boolean {
  const trimmed = address.trim();
  if (trimmed.length < 12) return true;
  return VAGUE_ADDRESS_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export interface ShelterQaIssue {
  id: string;
  name: string;
  field: string;
  message: string;
}

export function auditShelterDirectory(
  shelters: PhilippinesShelterRecord[],
): ShelterQaIssue[] {
  const issues: ShelterQaIssue[] = [];
  const ids = new Set<string>();

  for (const shelter of shelters) {
    if (ids.has(shelter.id)) {
      issues.push({
        id: shelter.id,
        name: shelter.name,
        field: "id",
        message: "Duplicate shelter id",
      });
    }
    ids.add(shelter.id);

    if (!isWithinPhilippines(shelter.latitude, shelter.longitude)) {
      issues.push({
        id: shelter.id,
        name: shelter.name,
        field: "coordinates",
        message: `Coordinates outside Philippines: ${shelter.latitude}, ${shelter.longitude}`,
      });
    }

    if (shelter.source === "verified" && isVagueAddress(shelter.address)) {
      issues.push({
        id: shelter.id,
        name: shelter.name,
        field: "address",
        message: `Verified listing has vague address: "${shelter.address}"`,
      });
    }

    if (shelter.source === "verified" && !shelter.sourceUrl) {
      issues.push({
        id: shelter.id,
        name: shelter.name,
        field: "sourceUrl",
        message: "Verified listing missing source URL",
      });
    }

    if (shelter.website && !/^https?:\/\//i.test(shelter.website)) {
      issues.push({
        id: shelter.id,
        name: shelter.name,
        field: "website",
        message: "Website must be an absolute URL",
      });
    }

    if (shelter.speciesAccepted.length === 0) {
      issues.push({
        id: shelter.id,
        name: shelter.name,
        field: "speciesAccepted",
        message: "No species accepted listed",
      });
    }
  }

  return issues;
}
