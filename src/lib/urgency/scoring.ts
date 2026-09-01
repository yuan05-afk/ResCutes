import type {
  injurySeverityEnum,
  environmentalDangerEnum,
  vulnerabilityEnum,
  urgencyLevelEnum,
} from "@/db/schema";

type InjurySeverity = typeof injurySeverityEnum.enumValues[number];
type EnvironmentalDanger = typeof environmentalDangerEnum.enumValues[number];
type Vulnerability = typeof vulnerabilityEnum.enumValues[number];
type UrgencyLevel = typeof urgencyLevelEnum.enumValues[number];

export const INJURY_SEVERITY_POINTS: Record<InjurySeverity, number> = {
  none_visible: 0,
  minor: 10,
  moderate: 20,
  severe: 28,
  critical: 35,
};

export const ENVIRONMENTAL_DANGER_POINTS: Record<EnvironmentalDanger, number> = {
  none: 0,
  traffic: 25,
  weather: 15,
  predators: 20,
  trapped: 30,
  other_danger: 15,
};

export const VULNERABILITY_POINTS: Record<Vulnerability, number> = {
  adult_healthy: 0,
  juvenile: 12,
  elderly: 10,
  pregnant: 15,
  nursing: 18,
  disabled: 20,
};

export interface UrgencyInput {
  injurySeverity: InjurySeverity;
  environmentalDanger: EnvironmentalDanger;
  vulnerability: Vulnerability;
  verifiedAt?: Date | null;
}

export interface UrgencyFactor {
  label: string;
  points: number;
  maxPoints: number;
  explanation: string;
}

export interface UrgencyResult {
  score: number;
  level: UrgencyLevel;
  factors: UrgencyFactor[];
  explanation: string;
}

function calculateWaitingPoints(verifiedAt?: Date | null): number {
  if (!verifiedAt) return 0;
  const hoursWaiting =
    (Date.now() - verifiedAt.getTime()) / (1000 * 60 * 60);
  if (hoursWaiting < 1) return 2;
  if (hoursWaiting < 3) return 5;
  if (hoursWaiting < 6) return 8;
  if (hoursWaiting < 12) return 11;
  return 15;
}

export function classifyUrgencyLevel(score: number): UrgencyLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

export function getUrgencyLevelLabel(level: UrgencyLevel): string {
  const labels: Record<UrgencyLevel, string> = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
  };
  return labels[level];
}

export function calculateUrgencyScore(input: UrgencyInput): UrgencyResult {
  const injuryPoints = INJURY_SEVERITY_POINTS[input.injurySeverity];
  const dangerPoints =
    ENVIRONMENTAL_DANGER_POINTS[input.environmentalDanger];
  const vulnerabilityPoints = VULNERABILITY_POINTS[input.vulnerability];
  const waitingPoints = calculateWaitingPoints(input.verifiedAt);

  const factors: UrgencyFactor[] = [
    {
      label: "Visible injury severity",
      points: injuryPoints,
      maxPoints: 35,
      explanation: getInjuryExplanation(input.injurySeverity),
    },
    {
      label: "Environmental danger",
      points: dangerPoints,
      maxPoints: 30,
      explanation: getDangerExplanation(input.environmentalDanger),
    },
    {
      label: "Animal vulnerability",
      points: vulnerabilityPoints,
      maxPoints: 20,
      explanation: getVulnerabilityExplanation(input.vulnerability),
    },
    {
      label: "Time waiting after verification",
      points: waitingPoints,
      maxPoints: 15,
      explanation: getWaitingExplanation(input.verifiedAt, waitingPoints),
    },
  ];

  const score = Math.min(
    100,
    injuryPoints + dangerPoints + vulnerabilityPoints + waitingPoints,
  );
  const level = classifyUrgencyLevel(score);

  const explanation = buildExplanation(score, level, factors);

  return { score, level, factors, explanation };
}

function getInjuryExplanation(severity: InjurySeverity): string {
  const map: Record<InjurySeverity, string> = {
    none_visible: "No visible injuries reported",
    minor: "Minor visible injury reported",
    moderate: "Moderate injury requiring attention",
    severe: "Severe injury requiring urgent care",
    critical: "Critical injury — immediate response needed",
  };
  return map[severity];
}

function getDangerExplanation(danger: EnvironmentalDanger): string {
  const map: Record<EnvironmentalDanger, string> = {
    none: "No immediate environmental danger",
    traffic: "Animal near traffic or busy road",
    weather: "Exposed to harsh weather conditions",
    predators: "Threat from predators or other animals",
    trapped: "Animal is trapped or confined",
    other_danger: "Other environmental danger reported",
  };
  return map[danger];
}

function getVulnerabilityExplanation(vuln: Vulnerability): string {
  const map: Record<Vulnerability, string> = {
    adult_healthy: "Adult animal, appears healthy",
    juvenile: "Young animal — higher vulnerability",
    elderly: "Elderly animal — higher vulnerability",
    pregnant: "Pregnant animal — requires careful handling",
    nursing: "Nursing mother — offspring may be nearby",
    disabled: "Disabled or impaired animal",
  };
  return map[vuln];
}

function getWaitingExplanation(
  verifiedAt?: Date | null,
  points?: number,
): string {
  if (!verifiedAt) return "Case not yet verified — no waiting time applied";
  const hours = Math.floor(
    (Date.now() - verifiedAt.getTime()) / (1000 * 60 * 60),
  );
  if (points === 0 || hours < 1)
    return "Recently verified — minimal waiting time";
  return `Verified ${hours} hour(s) ago — waiting time increases urgency`;
}

function buildExplanation(
  score: number,
  level: UrgencyLevel,
  factors: UrgencyFactor[],
): string {
  const topFactors = factors
    .filter((f) => f.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 2);

  const factorText =
    topFactors.length > 0
      ? topFactors.map((f) => f.explanation).join("; ")
      : "No significant urgency factors";

  return `Urgency score ${score}/100 (${getUrgencyLevelLabel(level)}). Primary factors: ${factorText}.`;
}
