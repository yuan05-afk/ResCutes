import { describe, expect, it } from "vitest";
import {
  CASE_STAGES,
  formatCaseStageLabel,
  statusesForStage,
  statusToStage,
} from "@/lib/rescue-stages";

describe("rescue stages", () => {
  it("maps primary and legacy statuses to stages", () => {
    expect(statusToStage("report_submitted")).toBe("needs_review");
    expect(statusToStage("under_verification")).toBe("needs_review");
    expect(statusToStage("verified")).toBe("verified");
    expect(statusToStage("rescuer_assigned")).toBe("with_rescuer");
    expect(statusToStage("rescue_accepted")).toBe("with_rescuer");
    expect(statusToStage("rescue_in_progress")).toBe("with_rescuer");
    expect(statusToStage("animal_secured")).toBe("animal_secured");
    expect(statusToStage("awaiting_shelter")).toBe("animal_secured");
    expect(statusToStage("shelter_handoff")).toBe("at_shelter");
    expect(statusToStage("completed")).toBe("completed");
    expect(statusToStage("rejected")).toBe("closed");
  });

  it("exposes filter options for every stage", () => {
    expect(CASE_STAGES).toHaveLength(7);
    expect(statusesForStage("with_rescuer")).toContain("rescuer_assigned");
    expect(formatCaseStageLabel("rescue_in_progress")).toBe("With rescuer");
  });
});
