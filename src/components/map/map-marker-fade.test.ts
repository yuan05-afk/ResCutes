import { describe, expect, it } from "vitest";
import {
  markerDataSignature,
  visibleMarkersBoundsSignature,
} from "@/components/map/map-marker-fade";

describe("map marker fade helpers", () => {
  it("builds stable marker signatures", () => {
    const signature = markerDataSignature({
      id: "case-1",
      latitude: 14.6,
      longitude: 121.03,
      color: "#183C35",
      urgencyLevel: "high",
      legendLayerId: "high",
    });

    expect(signature).toContain("case-1");
    expect(signature).toContain("high");
  });

  it("excludes hidden legend layers from bounds signature", () => {
    const markers = [
      { latitude: 14.6, longitude: 121.03, legendLayerId: "critical" },
      { latitude: 14.7, longitude: 121.04, legendLayerId: "standard" },
    ];

    const allVisible = visibleMarkersBoundsSignature(markers, new Set());
    const hideCritical = visibleMarkersBoundsSignature(
      markers,
      new Set(["critical"]),
    );

    expect(allVisible).not.toBe(hideCritical);
    expect(hideCritical).not.toContain("14.6000,121.0300");
    expect(hideCritical).toContain("14.7000,121.0400");
  });
});
