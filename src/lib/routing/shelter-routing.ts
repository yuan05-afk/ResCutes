import type { speciesEnum } from "@/db/schema";

type Species = typeof speciesEnum.enumValues[number];

export interface ShelterForRouting {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  speciesAccepted: string[];
  capabilities: string[];
  totalCapacity: number;
  currentOccupancy: number;
  operationalWorkload: number;
}

export interface RoutingInput {
  caseLatitude?: number | null;
  caseLongitude?: number | null;
  species: Species;
  requiredCapabilities?: string[];
}

export interface ShelterRecommendation {
  shelterId: string;
  shelterName: string;
  matchScore: number;
  distanceKm: number | null;
  availableCapacity: number;
  speciesAccepted: string[];
  relevantCapabilities: string[];
  reasons: string[];
  warnings: string[];
  missingCapabilities: string[];
  rank: number;
}

const WEIGHTS = {
  capability: 0.35,
  capacity: 0.25,
  species: 0.2,
  distance: 0.15,
  workload: 0.05,
};

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function scoreCapability(
  shelter: ShelterForRouting,
  required: string[],
): { score: number; relevant: string[]; missing: string[] } {
  if (required.length === 0) {
    return {
      score: 100,
      relevant: shelter.capabilities,
      missing: [],
    };
  }
  const relevant = shelter.capabilities.filter((c) =>
    required.some((r) => c.toLowerCase().includes(r.toLowerCase())),
  );
  const missing = required.filter(
    (r) =>
      !shelter.capabilities.some((c) =>
        c.toLowerCase().includes(r.toLowerCase()),
      ),
  );
  const score =
    missing.length === 0
      ? 100
      : Math.round((relevant.length / required.length) * 100);
  return { score, relevant, missing };
}

function scoreCapacity(shelter: ShelterForRouting): {
  score: number;
  available: number;
} {
  const available = shelter.totalCapacity - shelter.currentOccupancy;
  if (available <= 0) return { score: 0, available: 0 };
  const ratio = available / shelter.totalCapacity;
  return { score: Math.round(ratio * 100), available };
}

function scoreSpecies(shelter: ShelterForRouting, species: Species): number {
  if (shelter.speciesAccepted.includes(species)) return 100;
  if (shelter.speciesAccepted.includes("other")) return 50;
  return 0;
}

function scoreDistance(distanceKm: number | null): number {
  if (distanceKm === null) return 50;
  if (distanceKm <= 5) return 100;
  if (distanceKm <= 15) return 80;
  if (distanceKm <= 30) return 60;
  if (distanceKm <= 50) return 40;
  return 20;
}

function scoreWorkload(shelter: ShelterForRouting): number {
  const maxWorkload = 100;
  const workload = shelter.operationalWorkload;
  return Math.max(0, Math.round(100 - (workload / maxWorkload) * 100));
}

export function calculateShelterRecommendations(
  shelters: ShelterForRouting[],
  input: RoutingInput,
): ShelterRecommendation[] {
  const required = input.requiredCapabilities ?? [];

  const hasLocation =
    input.caseLatitude != null && input.caseLongitude != null;

  const scored = shelters.map((shelter) => {
    const cap = scoreCapability(shelter, required);
    const capScore = scoreCapacity(shelter);
    const speciesScore = scoreSpecies(shelter, input.species);
    const distanceKm = hasLocation
      ? haversineKm(
          input.caseLatitude!,
          input.caseLongitude!,
          shelter.latitude,
          shelter.longitude,
        )
      : null;
    const distScore = scoreDistance(distanceKm);
    const workloadScore = scoreWorkload(shelter);

    const matchScore = Math.round(
      cap.score * WEIGHTS.capability +
        capScore.score * WEIGHTS.capacity +
        speciesScore * WEIGHTS.species +
        distScore * WEIGHTS.distance +
        workloadScore * WEIGHTS.workload,
    );

    const reasons: string[] = [];
    const warnings: string[] = [];

    if (cap.score === 100 && required.length > 0)
      reasons.push("Has all required medical capabilities");
    if (capScore.available > 0)
      reasons.push(`${capScore.available} spaces available`);
    if (speciesScore === 100) reasons.push(`Accepts ${input.species}s`);
    if (distanceKm !== null && distanceKm <= 15)
      reasons.push(`Within ${distanceKm.toFixed(1)} km`);
    if (workloadScore >= 70) reasons.push("Low operational workload");

    if (cap.missing.length > 0)
      warnings.push(`Missing: ${cap.missing.join(", ")}`);
    if (capScore.available === 0) warnings.push("No available capacity");
    if (speciesScore === 0)
      warnings.push(`Species ${input.species} not typically accepted`);
    if (distanceKm !== null && distanceKm > 30)
      warnings.push(`Far distance: ${distanceKm.toFixed(1)} km`);

    return {
      shelterId: shelter.id,
      shelterName: shelter.name,
      matchScore,
      distanceKm,
      availableCapacity: capScore.available,
      speciesAccepted: shelter.speciesAccepted,
      relevantCapabilities: cap.relevant,
      reasons,
      warnings,
      missingCapabilities: cap.missing,
      rank: 0,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  scored.forEach((s, i) => {
    s.rank = i + 1;
  });

  return scored;
}

export function getRoutingFallbackMessage(
  recommendations: ShelterRecommendation[],
  input: RoutingInput,
): string | null {
  if (recommendations.length === 0) return "No shelters configured in the system.";
  const withCapacity = recommendations.filter((r) => r.availableCapacity > 0);
  if (withCapacity.length === 0)
    return "No shelter has sufficient capacity. Staff must coordinate manually.";
  const top = recommendations[0];
  if (top.missingCapabilities.length > 0 && input.requiredCapabilities?.length)
    return "No shelter has all required capabilities. Review warnings before selecting.";
  if (input.caseLatitude == null || input.caseLongitude == null)
    return "Location unavailable. Distance estimates are approximate.";
  return null;
}
