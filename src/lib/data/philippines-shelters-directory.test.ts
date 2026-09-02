import { describe, expect, it } from "vitest";
import { getPhilippinesShelterDirectory } from "@/lib/data/philippines-shelters-directory";
import {
  auditShelterDirectory,
  isWithinPhilippines,
} from "@/lib/data/shelter-directory-qa";

describe("Philippines shelter directory QA", () => {
  const shelters = getPhilippinesShelterDirectory();

  it("loads a non-empty directory", () => {
    expect(shelters.length).toBeGreaterThan(20);
  });

  it("passes internal QA audit with zero issues", () => {
    const issues = auditShelterDirectory(shelters);
    expect(issues).toEqual([]);
  });

  it("includes key verified organizations with precise coordinates", () => {
    const paws = shelters.find((s) => s.id === "verified-paws-parc");
    expect(paws).toBeDefined();
    expect(paws!.latitude).toBeCloseTo(14.63322, 3);
    expect(paws!.longitude).toBeCloseTo(121.07676, 3);

    const akf = shelters.find((s) => s.id === "verified-akf");
    expect(akf).toBeDefined();
    expect(akf!.latitude).toBeCloseTo(15.328832, 3);
    expect(akf!.longitude).toBeCloseTo(120.596817, 3);

    const cara = shelters.find((s) => s.id === "verified-cara");
    expect(cara).toBeDefined();
    expect(cara!.latitude).toBeCloseTo(14.58375, 3);
    expect(cara!.longitude).toBeCloseTo(121.04937, 3);
    expect(cara!.address).toContain("Lopez Rizal");

    const helpMas = shelters.find((s) => s.id === "verified-help-mas");
    expect(helpMas).toBeDefined();
    expect(helpMas!.latitude).toBeCloseTo(14.5863, 3);
    expect(helpMas!.longitude).toBeCloseTo(121.0439, 3);
    expect(helpMas!.address).toContain("Nueve de Febrero");
  });

  it("does not include known breeder-only OSM pins", () => {
    expect(
      shelters.some((s) => s.name.toLowerCase().includes("bigdipper")),
    ).toBe(false);
  });

  it("does not include unnamed OSM pins without operator", () => {
    const osm = shelters.filter((s) => s.source === "osm");
    expect(osm.every((s) => !s.name.includes("OpenStreetMap #"))).toBe(true);
  });

  it("keeps all coordinates inside the Philippines", () => {
    for (const shelter of shelters) {
      expect(
        isWithinPhilippines(shelter.latitude, shelter.longitude),
      ).toBe(true);
    }
  });
});
