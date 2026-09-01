import { describe, it, expect } from "vitest";
import {
  calculateUrgencyScore,
  classifyUrgencyLevel,
  INJURY_SEVERITY_POINTS,
} from "@/lib/urgency/scoring";

describe("Rescue Urgency Scoring", () => {
  it("calculates score from injury, danger, vulnerability", () => {
    const result = calculateUrgencyScore({
      injurySeverity: "moderate",
      environmentalDanger: "traffic",
      vulnerability: "adult_healthy",
    });
    expect(result.score).toBe(
      INJURY_SEVERITY_POINTS.moderate +
        25 + // traffic
        0, // adult_healthy, no waiting
    );
    expect(result.level).toBe("medium");
  });

  it("classifies critical level at 80+", () => {
    expect(classifyUrgencyLevel(85)).toBe("critical");
    expect(classifyUrgencyLevel(80)).toBe("critical");
  });

  it("classifies high level at 60-79", () => {
    expect(classifyUrgencyLevel(65)).toBe("high");
  });

  it("classifies medium level at 30-59", () => {
    expect(classifyUrgencyLevel(45)).toBe("medium");
  });

  it("classifies low level below 30", () => {
    expect(classifyUrgencyLevel(15)).toBe("low");
  });

  it("includes waiting time after verification", () => {
    const verifiedAt = new Date(Date.now() - 8 * 60 * 60 * 1000);
    const result = calculateUrgencyScore({
      injurySeverity: "none_visible",
      environmentalDanger: "none",
      vulnerability: "adult_healthy",
      verifiedAt,
    });
    expect(result.score).toBeGreaterThan(0);
    expect(result.factors[3].label).toContain("waiting");
  });

  it("provides explainable factors", () => {
    const result = calculateUrgencyScore({
      injurySeverity: "critical",
      environmentalDanger: "trapped",
      vulnerability: "nursing",
    });
    expect(result.factors.length).toBe(4);
    expect(result.explanation).toContain("Urgency score");
  });
});
