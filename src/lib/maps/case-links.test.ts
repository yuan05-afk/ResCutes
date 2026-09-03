import { describe, expect, it } from "vitest";
import {
  buildCaseMapsQuery,
  formatCaseLocationDisplay,
  googleMapsCaseDirectionsUrl,
  googleMapsCasePinUrl,
} from "./case-links";

describe("case-links", () => {
  const base = {
    caseNumber: "RC-26-106",
    latitude: 14.548,
    longitude: 121.05,
  };

  it("prefers location label in display and maps query", () => {
    const location = {
      ...base,
      locationLabel: "C5 exit ramp, Taguig",
      locationNote: "Beside guardrail",
    };
    expect(formatCaseLocationDisplay(location)).toBe(
      "C5 exit ramp, Taguig · Beside guardrail",
    );
    expect(buildCaseMapsQuery(location)).toContain("C5 exit ramp");
    expect(googleMapsCasePinUrl(location)).toContain("google.com/maps/search");
    expect(googleMapsCaseDirectionsUrl(location)).toContain("destination=");
  });

  it("falls back to coordinates when no place text", () => {
    const location = { ...base };
    expect(formatCaseLocationDisplay(location)).toBe("14.5480, 121.0500");
    expect(googleMapsCasePinUrl(location)).toContain("14.548");
  });
});
