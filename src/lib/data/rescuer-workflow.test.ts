import { describe, it, expect, beforeEach } from "vitest";
import {
  acceptAssignment,
  declineAssignment,
  updateCaseStatusAsRescuer,
  getCaseById,
  getAssignmentById,
} from "@/lib/data/service";
import { DEMO_CASES, DEMO_ASSIGNMENTS } from "@/lib/data/demo-store";

const JAMES = "user-james-rescuer";

function resetCase004() {
  const caseItem = DEMO_CASES.find((c) => c.id === "case-004");
  if (caseItem) {
    caseItem.status = "rescuer_assigned";
    caseItem.updatedAt = new Date().toISOString();
  }

  const assignment = DEMO_ASSIGNMENTS.find((a) => a.id === "assignment-004");
  if (assignment) {
    assignment.status = "pending";
    assignment.respondedAt = undefined;
    assignment.declineReason = undefined;
  }
}

describe("rescuer workflow", () => {
  beforeEach(() => {
    resetCase004();
  });

  it("accepts pending assignment and moves case to rescue_accepted", () => {
    const accepted = acceptAssignment("assignment-004", JAMES);
    expect(accepted).toBe(true);

    const assignment = getAssignmentById("assignment-004");
    expect(assignment?.status).toBe("accepted");

    const caseItem = getCaseById("case-004");
    expect(caseItem?.status).toBe("rescue_accepted");
  });

  it("declines pending assignment and reverts case to verified", () => {
    const declined = declineAssignment(
      "assignment-004",
      JAMES,
      "Too far from current location",
    );
    expect(declined).toBe(true);

    const assignment = getAssignmentById("assignment-004");
    expect(assignment?.status).toBe("declined");

    const caseItem = getCaseById("case-004");
    expect(caseItem?.status).toBe("verified");
  });

  it("walks rescue status transitions through awaiting_shelter", () => {
    acceptAssignment("assignment-004", JAMES);

    const start = updateCaseStatusAsRescuer(
      "case-004",
      JAMES,
      "rescue_in_progress",
    );
    expect(start.ok).toBe(true);
    expect(getCaseById("case-004")?.status).toBe("rescue_in_progress");

    const secured = updateCaseStatusAsRescuer(
      "case-004",
      JAMES,
      "animal_secured",
    );
    expect(secured.ok).toBe(true);
    expect(getCaseById("case-004")?.status).toBe("animal_secured");

    const awaiting = updateCaseStatusAsRescuer(
      "case-004",
      JAMES,
      "awaiting_shelter",
    );
    expect(awaiting.ok).toBe(true);
    expect(getCaseById("case-004")?.status).toBe("awaiting_shelter");
  });

  it("rejects invalid rescuer status transitions", () => {
    acceptAssignment("assignment-004", JAMES);

    const invalid = updateCaseStatusAsRescuer(
      "case-004",
      JAMES,
      "awaiting_shelter",
    );
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) {
      expect(invalid.error).toBe("Invalid status transition");
    }
  });
});
