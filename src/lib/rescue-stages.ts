/**
 * Hybrid rescue stages: UI groups detailed/legacy case statuses into fewer
 * stages. Writers should only produce the primary statuses listed below;
 * legacy values remain readable for history and old rows.
 *
 * Primary write path:
 *   report_submitted → verified → rescuer_assigned → animal_secured
 *   → shelter_handoff → completed
 * Closed: rejected | duplicate | cancelled
 *
 * Deprecated (do not write): under_verification, rescue_accepted,
 * rescue_in_progress, awaiting_shelter
 */

export const CASE_STAGES = [
  "needs_review",
  "verified",
  "with_rescuer",
  "animal_secured",
  "at_shelter",
  "completed",
  "closed",
] as const;

export type CaseStage = (typeof CASE_STAGES)[number];

const STAGE_LABELS: Record<CaseStage, string> = {
  needs_review: "Needs review",
  verified: "Verified",
  with_rescuer: "With rescuer",
  animal_secured: "Animal secured",
  at_shelter: "At shelter",
  completed: "Completed",
  closed: "Closed",
};

/** Statuses that belong to each stage (includes legacy). */
const STAGE_STATUSES: Record<CaseStage, readonly string[]> = {
  needs_review: ["report_submitted", "under_verification"],
  verified: ["verified"],
  with_rescuer: ["rescuer_assigned", "rescue_accepted", "rescue_in_progress"],
  animal_secured: ["animal_secured", "awaiting_shelter"],
  at_shelter: ["shelter_handoff"],
  completed: ["completed"],
  closed: ["rejected", "duplicate", "cancelled"],
};

const STATUS_TO_STAGE: Record<string, CaseStage> = Object.fromEntries(
  CASE_STAGES.flatMap((stage) =>
    STAGE_STATUSES[stage].map((status) => [status, stage]),
  ),
) as Record<string, CaseStage>;

const TERMINAL_STATUSES = new Set([
  "completed",
  "rejected",
  "duplicate",
  "cancelled",
]);

export function statusToStage(status: string): CaseStage | null {
  return STATUS_TO_STAGE[status] ?? null;
}

export function statusesForStage(stage: string): readonly string[] {
  if ((CASE_STAGES as readonly string[]).includes(stage)) {
    return STAGE_STATUSES[stage as CaseStage];
  }
  return [];
}

export function formatStageLabel(stage: string): string {
  if ((CASE_STAGES as readonly string[]).includes(stage)) {
    return STAGE_LABELS[stage as CaseStage];
  }
  return stage
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Primary badge/list label for a case status (stage-aware). */
export function formatCaseStageLabel(status: string): string {
  const stage = statusToStage(status);
  if (stage) return STAGE_LABELS[stage];
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function isActiveCaseStatus(status: string): boolean {
  return !TERMINAL_STATUSES.has(status);
}

export function isNeedsReviewStatus(status: string): boolean {
  return statusToStage(status) === "needs_review";
}

export function isWithRescuerStatus(status: string): boolean {
  return statusToStage(status) === "with_rescuer";
}

export function isAnimalSecuredStatus(status: string): boolean {
  return statusToStage(status) === "animal_secured";
}

export function isAtShelterStatus(status: string): boolean {
  return statusToStage(status) === "at_shelter";
}

/** Filter options for rescue cases UI (stage ids). */
export const CASE_STAGE_FILTER_OPTIONS = CASE_STAGES.map((id) => ({
  id,
  label: STAGE_LABELS[id],
}));

/** CSS token key for stage badges (stable per stage). */
export const STAGE_BADGE_STYLES: Record<CaseStage, string> = {
  needs_review: "bg-sage/20 text-evergreen",
  verified: "bg-evergreen/12 text-evergreen",
  with_rescuer: "bg-ochre/12 text-ochre",
  animal_secured: "bg-evergreen/12 text-evergreen",
  at_shelter: "bg-evergreen/15 text-evergreen",
  completed: "bg-evergreen/12 text-evergreen",
  closed: "bg-graphite/10 text-graphite/70",
};
