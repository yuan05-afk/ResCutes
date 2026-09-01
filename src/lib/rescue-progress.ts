/** Citizen-facing rescue progress steps mapped from case status. */
export const CITIZEN_PROGRESS_STEPS = [
  { id: "verified", label: "Report Verified" },
  { id: "rescuer", label: "Rescuer Assigned" },
  { id: "secured", label: "Animal Secured" },
  { id: "handoff", label: "Shelter Handoff" },
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
    report_submitted: "Report Submitted",
    under_verification: "Under Verification",
    verified: "Verified — Awaiting Rescuer",
    rescuer_assigned: "Rescuer Assigned",
    rescue_accepted: "Rescuer Accepted",
    rescue_in_progress: "Rescue in Progress",
    animal_secured: "Animal Secured",
    awaiting_shelter: "Awaiting Shelter",
    shelter_handoff: "At Shelter — Receiving Care",
    completed: "Completed",
    rejected: "Rejected",
    duplicate: "Duplicate",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status;
}
