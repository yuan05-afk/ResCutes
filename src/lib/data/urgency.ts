import {
  calculateUrgencyScore,
  classifyUrgencyLevel,
  type UrgencyResult,
} from "@/lib/urgency/scoring";
import type { RescueCaseRecord } from "@/lib/data/types";

function urgencyInputFromCase(
  caseItem: RescueCaseRecord,
  verifiedAt?: Date | null,
) {
  return {
    injurySeverity: caseItem.injurySeverity,
    environmentalDanger: caseItem.environmentalDanger,
    vulnerability: caseItem.vulnerability,
    verifiedAt:
      verifiedAt ??
      (caseItem.verifiedAt ? new Date(caseItem.verifiedAt) : null),
  } as {
    injurySeverity: "none_visible";
    environmentalDanger: "none";
    vulnerability: "adult_healthy";
    verifiedAt?: Date | null;
  };
}

/** Safe for client components — no DB imports. */
export function resolveCurrentUrgency(caseItem: RescueCaseRecord): UrgencyResult {
  if (caseItem.urgencyOverrideScore != null) {
    const score = caseItem.urgencyOverrideScore;
    const level = classifyUrgencyLevel(score);
    const base = calculateUrgencyScore(urgencyInputFromCase(caseItem));
    return {
      score,
      level,
      factors: base.factors,
      explanation: caseItem.urgencyOverrideReason
        ? `Staff override applied (${score}/100). ${base.explanation}`
        : base.explanation,
    };
  }

  if (!caseItem.verifiedAt) {
    return {
      score: caseItem.urgencyScore,
      level: classifyUrgencyLevel(caseItem.urgencyScore),
      factors: [],
      explanation:
        caseItem.urgencyScore > 0
          ? `Urgency score ${caseItem.urgencyScore}/100 (${classifyUrgencyLevel(caseItem.urgencyScore)}).`
          : "Case not yet verified. Urgency not calculated.",
    };
  }

  return calculateUrgencyScore(urgencyInputFromCase(caseItem));
}
