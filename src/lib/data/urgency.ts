import {
  calculateUrgencyScore,
  classifyUrgencyLevel,
  ENVIRONMENTAL_DANGER_POINTS,
  INJURY_SEVERITY_POINTS,
  VULNERABILITY_POINTS,
  type UrgencyInput,
  type UrgencyResult,
} from "@/lib/urgency/scoring";
import type { RescueCaseRecord } from "@/lib/data/types";

function isKeyOf<T extends Record<string, unknown>>(
  record: T,
  value: string,
): value is Extract<keyof T, string> {
  return Object.prototype.hasOwnProperty.call(record, value);
}

/** Map case string fields onto the real UrgencyInput union types. */
export function urgencyInputFromCase(
  caseItem: Pick<
    RescueCaseRecord,
    "injurySeverity" | "environmentalDanger" | "vulnerability" | "verifiedAt"
  >,
  verifiedAt?: Date | null,
): UrgencyInput {
  const injurySeverity = isKeyOf(INJURY_SEVERITY_POINTS, caseItem.injurySeverity)
    ? caseItem.injurySeverity
    : "none_visible";
  const environmentalDanger = isKeyOf(
    ENVIRONMENTAL_DANGER_POINTS,
    caseItem.environmentalDanger,
  )
    ? caseItem.environmentalDanger
    : "none";
  const vulnerability = isKeyOf(VULNERABILITY_POINTS, caseItem.vulnerability)
    ? caseItem.vulnerability
    : "adult_healthy";

  return {
    injurySeverity,
    environmentalDanger,
    vulnerability,
    verifiedAt:
      verifiedAt ??
      (caseItem.verifiedAt ? new Date(caseItem.verifiedAt) : null),
  };
}

/** Safe for client components - no DB imports. */
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
