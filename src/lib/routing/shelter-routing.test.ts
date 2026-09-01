import { describe, it, expect } from "vitest";
import {
  calculateShelterRecommendations,
  getRoutingFallbackMessage,
} from "@/lib/routing/shelter-routing";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";

const mockShelters = [
  {
    id: "s1",
    name: "Paws Hope",
    latitude: DEMO_GEO.shelters.pawsHope.latitude,
    longitude: DEMO_GEO.shelters.pawsHope.longitude,
    speciesAccepted: ["dog", "cat"],
    capabilities: ["orthopedic treatment", "wound care", "emergency surgery"],
    totalCapacity: 80,
    currentOccupancy: 50,
    operationalWorkload: 30,
  },
  {
    id: "s2",
    name: "Green Valley",
    latitude: DEMO_GEO.shelters.greenValley.latitude,
    longitude: DEMO_GEO.shelters.greenValley.longitude,
    speciesAccepted: ["dog", "cat", "rabbit"],
    capabilities: ["basic veterinary care", "wound care"],
    totalCapacity: 120,
    currentOccupancy: 120,
    operationalWorkload: 60,
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
      caseLatitude: DEMO_GEO.shelters.greenValley.latitude,
      caseLongitude: DEMO_GEO.shelters.greenValley.longitude,
      species: "dog",
    });
    const lowCapacity = recs.find((r) => r.shelterId === "s2");
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
