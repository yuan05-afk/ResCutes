import { describe, it, expect } from "vitest";
import { validateRequiredAnimalName } from "@/lib/forms/animal-field-options";

describe("validateRequiredAnimalName", () => {
  it("rejects empty, blank, and missing names", () => {
    expect(validateRequiredAnimalName("")).toBe("Name is required.");
    expect(validateRequiredAnimalName("   ")).toBe("Name is required.");
    expect(validateRequiredAnimalName(null)).toBe("Name is required.");
    expect(validateRequiredAnimalName(undefined)).toBe("Name is required.");
  });

  it("accepts a normal name", () => {
    expect(validateRequiredAnimalName("Rocky")).toBeNull();
  });

  it("rejects names that are too long", () => {
    expect(validateRequiredAnimalName("a".repeat(81))).toMatch(/under 80/i);
  });
});
