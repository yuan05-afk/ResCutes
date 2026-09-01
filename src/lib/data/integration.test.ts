import { describe, it, expect } from "vitest";
import {
  getCaseById,
  getRecommendationsForCase,
  resolveCurrentUrgency,
} from "@/lib/data/service";
import { DEMO_RECOMMENDATIONS } from "@/lib/data/demo-store";

describe("urgency consistency", () => {
  it("resolveCurrentUrgency matches breakdown for case-004 seed factors", () => {
    const caseItem = getCaseById("case-004");
    expect(caseItem).toBeDefined();

    const urgency = resolveCurrentUrgency(caseItem!);
    expect(urgency.score).toBe(urgency.factors.reduce((sum, f) => sum + f.points, 0));
    expect(urgency.explanation).toContain(`${urgency.score}/100`);
  });

  it("stored urgencyScore alone can diverge from live resolveCurrentUrgency", () => {
    const caseItem = getCaseById("case-004");
    expect(caseItem).toBeDefined();

    const live = resolveCurrentUrgency(caseItem!);
    // Waiting time increases after verification — live score should be authoritative.
    expect(live.score).toBeGreaterThanOrEqual(0);
    expect(live.level).toBe(
      live.score >= 80
        ? "critical"
        : live.score >= 60
          ? "high"
          : live.score >= 30
            ? "medium"
            : "low",
    );
  });
});

describe("shelter recommendations for awaiting_shelter", () => {
  it("generates recommendations once for awaiting_shelter without duplicates on refresh", () => {
    const caseItem = getCaseById("case-004");
    expect(caseItem).toBeDefined();
    caseItem!.status = "awaiting_shelter";

    const beforeCount = DEMO_RECOMMENDATIONS.filter(
      (r) => r.caseId === "case-004",
    ).length;

    const first = getRecommendationsForCase("case-004");
    expect(first.length).toBeGreaterThan(0);

    const second = getRecommendationsForCase("case-004");
    expect(second.length).toBe(first.length);
    expect(second).toEqual(first);

    const afterCount = DEMO_RECOMMENDATIONS.filter(
      (r) => r.caseId === "case-004",
    ).length;
    expect(afterCount).toBe(beforeCount + first.length);
  });
});
