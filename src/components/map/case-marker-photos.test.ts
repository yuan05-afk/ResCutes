import { describe, expect, it } from "vitest";
import {
  CASE_PHOTO_MIN_SEPARATION_PX,
  resolveCaseMarkerLayout,
} from "@/components/map/case-marker-photos";

describe("resolveCaseMarkerLayout", () => {
  it("keeps every case as a legend dot when photos are disabled", () => {
    const layout = resolveCaseMarkerLayout(
      [
        {
          id: "a",
          longitude: 121,
          latitude: 14.5,
          hasPhoto: true,
          urgencyLevel: "critical",
        },
        {
          id: "b",
          longitude: 121.1,
          latitude: 14.6,
          hasPhoto: true,
          urgencyLevel: "standard",
        },
      ],
      (lng) => (lng === 121 ? { x: 0, y: 0 } : { x: 200, y: 0 }),
      { photosEnabled: false },
    );

    expect(layout.get("a")).toBe("dot");
    expect(layout.get("b")).toBe("dot");
  });

  it("shows all spaced photos together when photos are enabled", () => {
    const layout = resolveCaseMarkerLayout(
      [
        {
          id: "a",
          longitude: 121,
          latitude: 14.5,
          hasPhoto: true,
          urgencyLevel: "standard",
        },
        {
          id: "b",
          longitude: 121.1,
          latitude: 14.6,
          hasPhoto: true,
          urgencyLevel: "standard",
        },
      ],
      (lng) => (lng === 121 ? { x: 0, y: 0 } : { x: 200, y: 0 }),
      { photosEnabled: true },
    );

    expect(layout.get("a")).toBe("photo");
    expect(layout.get("b")).toBe("photo");
  });

  it("hides overlapping losers instead of mixing photo and dot", () => {
    const layout = resolveCaseMarkerLayout(
      [
        {
          id: "low",
          longitude: 121,
          latitude: 14.5,
          hasPhoto: true,
          urgencyLevel: "standard",
        },
        {
          id: "crit",
          longitude: 121.001,
          latitude: 14.501,
          hasPhoto: true,
          urgencyLevel: "critical",
        },
        {
          id: "dot-only",
          longitude: 121.002,
          latitude: 14.502,
          hasPhoto: false,
          urgencyLevel: "high",
        },
      ],
      () => ({ x: 10, y: 10 }),
      {
        photosEnabled: true,
        minSeparationPx: CASE_PHOTO_MIN_SEPARATION_PX,
      },
    );

    expect(layout.get("crit")).toBe("photo");
    expect(layout.get("low")).toBe("hidden");
    expect(layout.get("dot-only")).toBe("hidden");
  });

  it("always prefers the selected marker in a collision", () => {
    const layout = resolveCaseMarkerLayout(
      [
        {
          id: "crit",
          longitude: 121,
          latitude: 14.5,
          hasPhoto: true,
          urgencyLevel: "critical",
        },
        {
          id: "picked",
          longitude: 121,
          latitude: 14.5,
          hasPhoto: true,
          urgencyLevel: "standard",
          selected: true,
        },
      ],
      () => ({ x: 0, y: 0 }),
      { photosEnabled: true },
    );

    expect(layout.get("picked")).toBe("photo");
    expect(layout.get("crit")).toBe("hidden");
  });
});
