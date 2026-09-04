import { describe, it, expect } from "vitest";
import { findNearestMatchingShelter } from "@/lib/maps/nearest-shelter-match";
import type { ShelterSpeciesProfile } from "@/lib/data/philippines-shelters-directory";

describe("findNearestMatchingShelter", () => {
  const shelters = [
    {
      id: "far-dog",
      name: "Far Dog Shelter",
      latitude: 14.7,
      longitude: 121.1,
      speciesAccepted: ["dog"],
      speciesProfile: "dog_only" as ShelterSpeciesProfile,
      capabilities: ["basic veterinary care"],
    },
    {
      id: "near-cat",
      name: "Near Cat Shelter",
      latitude: 14.6,
      longitude: 121.05,
      speciesAccepted: ["cat"],
      speciesProfile: "cat_only" as ShelterSpeciesProfile,
      capabilities: ["wound care"],
    },
    {
      id: "near-dog-er",
      name: "Near Dog ER",
      latitude: 14.61,
      longitude: 121.06,
      speciesAccepted: ["dog", "cat"],
      speciesProfile: "dog_cat" as ShelterSpeciesProfile,
      capabilities: ["emergency surgery", "wound care"],
    },
  ];

  const from = { latitude: 14.6, longitude: 121.05 };

  it("picks nearest shelter that accepts the animal", () => {
    const result = findNearestMatchingShelter(shelters, from, {
      animal: "dog",
      need: "visit",
    });
    expect(result?.id).toBe("near-dog-er");
  });

  it("prefers emergency capability when need is emergency", () => {
    const result = findNearestMatchingShelter(shelters, from, {
      animal: "dog",
      need: "emergency",
    });
    expect(result?.id).toBe("near-dog-er");
  });

  it("falls back when no species match", () => {
    const wildlifeOnly = [
      {
        id: "w1",
        name: "Wildlife only",
        latitude: 14.6,
        longitude: 121.05,
        speciesAccepted: ["wildlife"],
        speciesProfile: "wildlife" as ShelterSpeciesProfile,
      },
    ];
    const result = findNearestMatchingShelter(wildlifeOnly, from, {
      animal: "dog",
      need: "visit",
    });
    expect(result?.id).toBe("w1");
  });
});
