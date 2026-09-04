import { describe, it, expect } from "vitest";
import {
  calculateShelterRecommendations,
  getRoutingFallbackMessage,
} from "@/lib/routing/shelter-routing";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";

const mockShelters = [
  {
    id: "verified-paws-parc",
    name: "PAWS Animal Rehabilitation Center (PARC)",
    latitude: DEMO_GEO.shelters.paws.latitude,
    longitude: DEMO_GEO.shelters.paws.longitude,
    speciesAccepted: ["dog", "cat"],
    capabilities: ["orthopedic treatment", "wound care", "emergency surgery"],
    totalCapacity: 85,
    currentOccupancy: 58,
    operationalWorkload: 41,
  },
  {
    id: "verified-cara",
    name: "CARA Welfare Philippines",
    latitude: DEMO_GEO.shelters.cara.latitude,
    longitude: DEMO_GEO.shelters.cara.longitude,
    speciesAccepted: ["dog", "cat"],
    capabilities: ["basic veterinary care", "wound care"],
    totalCapacity: 48,
    currentOccupancy: 48,
    operationalWorkload: 28,
  },
];

describe("Shelter Routing Engine", () => {
  it("ranks shelters by match score", () => {
    const recs = calculateShelterRecommendations(mockShelters, {
      caseLatitude: DEMO_GEO.luna.latitude,
      caseLongitude: DEMO_GEO.luna.longitude,
      species: "dog",
      requiredCapabilities: ["orthopedic treatment"],
    });
    expect(recs.length).toBe(2);
    expect(recs[0].rank).toBe(1);
    expect(recs[0].matchScore).toBeGreaterThanOrEqual(recs[1].matchScore);
  });

  it("includes reasons and warnings in recommendations", () => {
    const recs = calculateShelterRecommendations(mockShelters, {
      caseLatitude: DEMO_GEO.luna.latitude,
      caseLongitude: DEMO_GEO.luna.longitude,
      species: "dog",
      requiredCapabilities: ["orthopedic treatment"],
    });
    expect(recs[0].reasons.length).toBeGreaterThan(0);
    expect(recs[0].shelterName).toBeTruthy();
    expect(recs[0].availableCapacity).toBeGreaterThan(0);
  });

  it("warns when shelter lacks capacity", () => {
    const recs = calculateShelterRecommendations(mockShelters, {
      caseLatitude: DEMO_GEO.shelters.cara.latitude,
      caseLongitude: DEMO_GEO.shelters.cara.longitude,
      species: "dog",
    });
    const lowCapacity = recs.find((r) => r.shelterId === "verified-cara");
    expect(lowCapacity?.warnings.some((w) => w.includes("capacity"))).toBe(true);
  });

  it("handles missing location with fallback message", () => {
    const recs = calculateShelterRecommendations(mockShelters, {
      species: "dog",
    });
    const msg = getRoutingFallbackMessage(recs, { species: "dog" });
    expect(msg).toContain("Location unavailable");
  });
});
