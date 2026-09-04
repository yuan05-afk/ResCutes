/** Citizen-facing rescue progress steps mapped from case status / stages. */
export const CITIZEN_PROGRESS_STEPS = [
  { id: "verified", label: "Report Verified" },
  { id: "rescuer", label: "With Rescuer" },
  { id: "secured", label: "Animal Secured" },
  { id: "handoff", label: "At Shelter" },
] as const;

const STATUS_TO_STEP: Record<string, number> = {
  report_submitted: -1,
  under_verification: -1,
  verified: 0,
  rescuer_assigned: 1,
  rescue_accepted: 1,
  rescue_in_progress: 1,
  animal_secured: 2,
  awaiting_shelter: 2,
  shelter_handoff: 3,
  completed: 4,
  rejected: -1,
  duplicate: -1,
  cancelled: -1,
};

export function getCitizenProgressIndex(status: string): number {
  return STATUS_TO_STEP[status] ?? -1;
}

export function getCitizenStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    report_submitted: "Report submitted",
    under_verification: "Needs review",
    verified: "Verified, awaiting rescuer",
    rescuer_assigned: "With rescuer",
    rescue_accepted: "With rescuer",
    rescue_in_progress: "With rescuer",
    animal_secured: "Animal secured",
    awaiting_shelter: "Animal secured",
    shelter_handoff: "At shelter, receiving care",
    completed: "Completed",
    rejected: "Rejected",
    duplicate: "Duplicate",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status;
}
