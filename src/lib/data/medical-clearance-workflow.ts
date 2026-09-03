import type { ClearanceStatus } from "@/lib/data/types";
import { formatStatus } from "@/lib/utils";

/** Forward-only transitions (advance the medical pipeline). */
export const CLEARANCE_FORWARD_TRANSITIONS: Record<
  ClearanceStatus,
  ClearanceStatus[]
> = {
  awaiting_examination: [
    "under_examination",
    "under_treatment",
    "follow_up_required",
  ],
  under_examination: [
    "under_treatment",
    "follow_up_required",
    "medically_cleared",
  ],
  under_treatment: ["follow_up_required", "medically_cleared"],
  follow_up_required: ["under_treatment", "medically_cleared"],
  medically_cleared: [],
};

/** Corrections - earliest stage first (awaiting → under exam → …). */
export const CLEARANCE_ROLLBACK_TRANSITIONS: Record<
  ClearanceStatus,
  ClearanceStatus[]
> = {
  awaiting_examination: [],
  under_examination: ["awaiting_examination"],
  under_treatment: ["awaiting_examination", "under_examination"],
  follow_up_required: [
    "awaiting_examination",
    "under_examination",
    "under_treatment",
  ],
  medically_cleared: [
    "awaiting_examination",
    "under_examination",
    "under_treatment",
  ],
};

const PATHWAY_BLOCKS_MEDICAL_REOPEN = new Set([
  "ready_for_adoption",
  "ready_for_foster",
  "transferred",
]);

export interface ClearanceRollbackOption {
  target: ClearanceStatus;
  title: string;
  message: string;
  confirmLabel: string;
}

function clearanceLabel(status: ClearanceStatus): string {
  return formatStatus(status);
}

function rollbackCopy(
  target: ClearanceStatus,
  opts?: { reopen?: boolean },
): Omit<ClearanceRollbackOption, "target"> {
  const label = clearanceLabel(target);
  const verb = opts?.reopen ? "Reopen" : "Return";
  return {
    title: `${verb} to ${label}?`,
    message: opts?.reopen
      ? `Returns the animal to ${label} and resets pathway to Medical clearance. Clinical records are kept.`
      : `Moves this animal back to ${label}. Clinical notes and exam records are kept.`,
    confirmLabel: label,
  };
}

const ROLLBACK_COPY: Partial<
  Record<
    ClearanceStatus,
    Partial<Record<ClearanceStatus, Omit<ClearanceRollbackOption, "target">>>
  >
> = {
  under_examination: {
    awaiting_examination: rollbackCopy("awaiting_examination"),
  },
  under_treatment: {
    awaiting_examination: rollbackCopy("awaiting_examination"),
    under_examination: rollbackCopy("under_examination"),
  },
  follow_up_required: {
    awaiting_examination: rollbackCopy("awaiting_examination"),
    under_examination: rollbackCopy("under_examination"),
    under_treatment: {
      ...rollbackCopy("under_treatment"),
      title: "Return to Under treatment?",
      message:
        "Removes the scheduled follow-up and returns the animal to Under treatment.",
    },
  },
  medically_cleared: {
    awaiting_examination: rollbackCopy("awaiting_examination", { reopen: true }),
    under_examination: rollbackCopy("under_examination", { reopen: true }),
    under_treatment: rollbackCopy("under_treatment", { reopen: true }),
  },
};

export function isClearanceRollback(
  from: ClearanceStatus,
  to: ClearanceStatus,
): boolean {
  return CLEARANCE_ROLLBACK_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionClearance(
  from: ClearanceStatus,
  to: ClearanceStatus,
  pathwayStage?: string,
): { ok: true } | { ok: false; error: string } {
  if (from === to) return { ok: true };

  if (
    from === "medically_cleared" &&
    PATHWAY_BLOCKS_MEDICAL_REOPEN.has(pathwayStage ?? "")
  ) {
    return {
      ok: false,
      error:
        "Cannot revert medical clearance after the animal has moved to adoption or foster readiness.",
    };
  }

  if (isClearanceRollback(from, to)) {
    if (!CLEARANCE_ROLLBACK_TRANSITIONS[from].includes(to)) {
      return { ok: false, error: "Invalid status correction" };
    }
    return { ok: true };
  }

  if (CLEARANCE_FORWARD_TRANSITIONS[from]?.includes(to)) {
    return { ok: true };
  }

  return {
    ok: false,
    error: `Cannot transition from ${clearanceLabel(from)} to ${clearanceLabel(to)}`,
  };
}

export function getClearanceRollbackOptions(
  current: ClearanceStatus,
  pathwayStage?: string,
): ClearanceRollbackOption[] {
  if (
    current === "medically_cleared" &&
    PATHWAY_BLOCKS_MEDICAL_REOPEN.has(pathwayStage ?? "")
  ) {
    return [];
  }

  const options: ClearanceRollbackOption[] = [];
  for (const target of CLEARANCE_ROLLBACK_TRANSITIONS[current] ?? []) {
    const copy = ROLLBACK_COPY[current]?.[target];
    if (!copy) continue;
    options.push({ target, ...copy });
  }
  return options;
}

export function formatClearanceStatusLabel(status: ClearanceStatus): string {
  return clearanceLabel(status);
}
