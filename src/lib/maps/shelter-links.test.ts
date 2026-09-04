import { describe, it, expect } from "vitest";
import {
  buildShelterMapsQuery,
  formatFullShelterAddress,
  googleMapsDirectionsUrl,
  googleMapsPinUrl,
  shelterMapAppHref,
} from "@/lib/maps/shelter-links";

describe("shelter-links", () => {
  const happyAnimals = {
    name: "Happy Animals Club",
    address: "22 Rigodon Extension, Lanzona Subdivision, Matina Aplaya",
    city: "Davao City",
    region: "Region XI",
    latitude: 7.05117,
    longitude: 125.59172,
  };

  it("formats address without duplicating city/region", () => {
    expect(
      formatFullShelterAddress(
        "22 Rigodon Extension, Lanzona Subdivision, Matina Aplaya, Davao City, Region XI",
        "Davao City",
        "Region XI",
      ),
    ).toBe(
      "22 Rigodon Extension, Lanzona Subdivision, Matina Aplaya, Davao City, Region XI",
    );

    expect(
      formatFullShelterAddress(
        "22 Rigodon Extension, Lanzona Subdivision, Matina Aplaya",
        "Davao City",
        "Region XI",
      ),
    ).toBe(
      "22 Rigodon Extension, Lanzona Subdivision, Matina Aplaya, Davao City, Region XI",
    );
  });

  it("builds a place-name Google Maps query", () => {
    const query = buildShelterMapsQuery(happyAnimals);
    expect(query).toContain("Happy Animals Club");
    expect(query).toContain("Matina Aplaya");
    expect(query).toContain("Davao City");
    expect(query).toContain("Philippines");
    expect(query).not.toMatch(/^\d+\.\d+,\d+\.\d+$/);
  });

  it("opens Google Maps search by place, not bare coordinates", () => {
    const url = googleMapsPinUrl(happyAnimals);
    expect(url).toContain("google.com/maps/search/");
    expect(url).toMatch(/Happy(\+|%20)Animals(\+|%20)Club/);
    expect(url).not.toMatch(/q=7\.05117,125\.59172/);
  });

  it("opens Directions with place destination", () => {
    const url = googleMapsDirectionsUrl(happyAnimals);
    expect(url).toContain("google.com/maps/dir/");
    expect(url).toContain("destination=");
    expect(url).toMatch(/Happy(\+|%20)Animals(\+|%20)Club/);
    expect(url).not.toMatch(/destination=7\.05117(%2C|,)125\.59172/);
  });

  it("deep-links shelter map with highlight and coords", () => {
    expect(
      shelterMapAppHref("verified-happy-animals-davao", {
        latitude: 7.05117,
        longitude: 125.59172,
      }),
    ).toBe(
      "/shelters?highlight=verified-happy-animals-davao&lat=7.05117&lng=125.59172",
    );
  });
});
