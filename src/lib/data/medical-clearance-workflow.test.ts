import { describe, it, expect } from "vitest";
import {
  canTransitionClearance,
  getClearanceRollbackOptions,
  isClearanceRollback,
} from "@/lib/data/medical-clearance-workflow";

describe("medical clearance workflow", () => {
  it("allows forward transitions", () => {
    expect(
      canTransitionClearance("awaiting_examination", "under_examination").ok,
    ).toBe(true);
    expect(
      canTransitionClearance("under_treatment", "medically_cleared").ok,
    ).toBe(true);
  });

  it("allows rollback transitions", () => {
    expect(
      canTransitionClearance("under_treatment", "under_examination").ok,
    ).toBe(true);
    expect(
      canTransitionClearance("follow_up_required", "awaiting_examination").ok,
    ).toBe(true);
    expect(isClearanceRollback("under_treatment", "under_examination")).toBe(
      true,
    );
  });

  it("blocks invalid jumps", () => {
    expect(
      canTransitionClearance("awaiting_examination", "medically_cleared").ok,
    ).toBe(false);
    expect(
      canTransitionClearance("under_treatment", "follow_up_required").ok,
    ).toBe(true);
  });

  it("blocks reopening cleared animals on adoption pathway", () => {
    const result = canTransitionClearance(
      "medically_cleared",
      "under_treatment",
      "ready_for_adoption",
    );
    expect(result.ok).toBe(false);
  });

  it("lists rollback options for under treatment", () => {
    const options = getClearanceRollbackOptions("under_treatment");
    expect(options.map((o) => o.target)).toEqual([
      "awaiting_examination",
      "under_examination",
    ]);
    expect(options[0].confirmLabel).toBe("Awaiting exam");
    expect(options[1].confirmLabel).toBe("Under exam");
  });

  it("lists reopen options for medically cleared on behavior pathway", () => {
    const options = getClearanceRollbackOptions(
      "medically_cleared",
      "behavior_assessment",
    );
    expect(options.length).toBe(3);
  });
});
