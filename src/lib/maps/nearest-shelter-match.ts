import { sortByDistanceKm } from "@/lib/maps/geo-distance";
import type { ShelterSpeciesProfile } from "@/lib/data/philippines-shelters-directory";

export type NearestAnimal = "dog" | "cat" | "wildlife" | "other";
export type NearestNeed = "visit" | "care" | "emergency";

export interface NearestMatchShelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  speciesAccepted: string[];
  speciesProfile: ShelterSpeciesProfile;
  capabilities?: string[];
}

export interface NearestQuizAnswers {
  animal: NearestAnimal;
  need: NearestNeed;
}

const CARE_CAPS = ["wound care", "basic veterinary care", "orthopedic treatment"];
const EMERGENCY_CAPS = [
  "emergency surgery",
  "intensive care",
  "wound care",
];

export function shelterAcceptsAnimal(
  shelter: NearestMatchShelter,
  animal: NearestAnimal,
): boolean {
  if (animal === "wildlife") {
    return (
      shelter.speciesAccepted.includes("wildlife") ||
      shelter.speciesProfile === "wildlife" ||
      shelter.speciesProfile === "mixed"
    );
  }

  if (animal === "other") {
    return (
      shelter.speciesAccepted.includes("other") ||
      shelter.speciesAccepted.includes("bird") ||
      shelter.speciesAccepted.includes("rabbit") ||
      shelter.speciesProfile === "mixed" ||
      shelter.speciesProfile === "unknown" ||
      shelter.speciesProfile === "dog_cat"
    );
  }

  return shelter.speciesAccepted.includes(animal);
}

function hasAnyCapability(
  shelter: NearestMatchShelter,
  required: string[],
): boolean {
  const caps = shelter.capabilities ?? [];
  if (caps.length === 0) return false;
  return required.some((need) =>
    caps.some((cap) => cap.toLowerCase().includes(need.toLowerCase())),
  );
}

function capabilityBonus(
  shelter: NearestMatchShelter,
  need: NearestNeed,
): number {
  if (need === "visit") return 0;
  if (need === "care") {
    return hasAnyCapability(shelter, CARE_CAPS) ? 40 : 0;
  }
  return hasAnyCapability(shelter, EMERGENCY_CAPS) ? 60 : 0;
}

/**
 * Prefer shelters that accept the animal, then care capability, then distance.
 * Falls back to all shelters if none accept the selected animal.
 */
export function findNearestMatchingShelter<T extends NearestMatchShelter>(
  shelters: T[],
  from: { latitude: number; longitude: number },
  answers: NearestQuizAnswers,
): (T & { distanceKm: number }) | null {
  if (shelters.length === 0) return null;

  const accepted = shelters.filter((s) =>
    shelterAcceptsAnimal(s, answers.animal),
  );
  const pool = accepted.length > 0 ? accepted : shelters;

  const ranked = sortByDistanceKm(pool, from).map((s) => ({
    ...s,
    matchRank:
      capabilityBonus(s, answers.need) * 1000 -
      // Closer is better; keep distance as secondary
      s.distanceKm,
  }));

  ranked.sort((a, b) => b.matchRank - a.matchRank);
  const best = ranked[0];
  if (!best) return null;

  const { matchRank: _matchRank, ...rest } = best;
  return rest;
}

export function nearestAnimalLabel(animal: NearestAnimal): string {
  switch (animal) {
    case "dog":
      return "dogs";
    case "cat":
      return "cats";
    case "wildlife":
      return "wildlife";
    default:
      return "this animal";
  }
}
