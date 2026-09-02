import { describe, it, expect, beforeEach } from "vitest";
import {
  confirmShelterHandoff,
  completeShelterIntake,
  getCaseById,
  getHandoffForCase,
  getAnimalById,
  getStatusHistoryForCase,
  selectShelter,
} from "@/lib/data/service";
import {
  DEMO_CASES,
  DEMO_HANDOFFS,
  DEMO_ANIMALS,
  DEMO_STATUS_HISTORY,
  DEMO_SHELTERS,
  DEMO_IDS,
} from "@/lib/data/demo-store";
import { seedCase008Fixtures } from "@/lib/data/workflow-test-fixtures";

const SARAH = DEMO_IDS.users.sarah;
const PAWS = DEMO_IDS.shelters.paws;

function resetCase008ForHandoff() {
  const caseItem = DEMO_CASES.find((c) => c.id === "case-008");
  if (!caseItem) return;
  caseItem.status = "awaiting_shelter";
  caseItem.assignedShelterId = PAWS;
  caseItem.animalId = undefined;
  caseItem.updatedAt = new Date().toISOString();

  const handoffIdx = DEMO_HANDOFFS.findIndex((h) => h.caseId === "case-008");
  if (handoffIdx >= 0) DEMO_HANDOFFS.splice(handoffIdx, 1);

  const animalIdx = DEMO_ANIMALS.findIndex((a) => a.rescueCaseId === "case-008");
  if (animalIdx >= 0) DEMO_ANIMALS.splice(animalIdx, 1);

  DEMO_STATUS_HISTORY.push({
    id: "hist-008-secured",
    caseId: "case-008",
    fromStatus: "rescue_in_progress",
    toStatus: "animal_secured",
    changedById: SARAH,
    createdAt: new Date().toISOString(),
  });
  DEMO_STATUS_HISTORY.push({
    id: "hist-008-awaiting",
    caseId: "case-008",
    fromStatus: "animal_secured",
    toStatus: "awaiting_shelter",
    changedById: DEMO_IDS.users.rescuer4,
    createdAt: new Date().toISOString(),
  });
}

describe("shelter handoff guards", () => {
  beforeEach(() => {
    seedCase008Fixtures();
    resetCase008ForHandoff();
  });

  it("rejects handoff without destination", () => {
    const caseItem = DEMO_CASES.find((c) => c.id === "case-008");
    caseItem!.assignedShelterId = undefined;

    const result = confirmShelterHandoff("case-008", PAWS, SARAH);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("destination");
    }
  });

  it("rejects handoff from invalid status", () => {
    const caseItem = DEMO_CASES.find((c) => c.id === "case-008");
    caseItem!.status = "rescue_in_progress";

    const result = confirmShelterHandoff("case-008", PAWS, SARAH);
    expect(result.ok).toBe(false);
  });

  it("rejects duplicate handoff", () => {
    confirmShelterHandoff("case-008", PAWS, SARAH, "First handoff");
    const second = confirmShelterHandoff("case-008", PAWS, SARAH);
    expect(second.ok).toBe(false);
  });
});

describe("successful handoff and intake", () => {
  beforeEach(() => {
    resetCase008ForHandoff();
  });

  it("completes handoff from awaiting_shelter with destination", () => {
    const result = confirmShelterHandoff(
      "case-008",
      PAWS,
      SARAH,
      "Animal arrived safely.",
    );
    expect(result.ok).toBe(true);

    const caseItem = getCaseById("case-008");
    expect(caseItem?.status).toBe("shelter_handoff");
    expect(getHandoffForCase("case-008")).toBeDefined();
    expect(caseItem?.animalId).toBeUndefined();
  });

  it("intake creates exactly one animal and is idempotent", () => {
    confirmShelterHandoff("case-008", PAWS, SARAH);

    const first = completeShelterIntake("case-008", SARAH, {
      initialCondition: "Mild stress observed",
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const animal = getAnimalById(first.animalId);
    expect(animal?.clearanceStatus).toBe("awaiting_examination");
    expect(animal?.pathwayStage).toBe("medical_clearance");
    expect(animal?.temporaryId).toBe("A-2026-1008");

    const second = completeShelterIntake("case-008", SARAH);
    expect(second.ok).toBe(true);
    if (second.ok) {
      expect(second.animalId).toBe(first.animalId);
    }

    const animalsForCase = DEMO_ANIMALS.filter((a) => a.rescueCaseId === "case-008");
    expect(animalsForCase.length).toBe(1);
  });

  it("increments shelter occupancy once on intake", () => {
    confirmShelterHandoff("case-008", PAWS, SARAH);
    const shelter = DEMO_SHELTERS.find((s) => s.id === PAWS)!;
    const before = shelter.currentOccupancy;

    completeShelterIntake("case-008", SARAH);
    completeShelterIntake("case-008", SARAH);

    expect(shelter.currentOccupancy).toBe(before + 1);
  });

  it("records handoff and intake timeline entries", () => {
    confirmShelterHandoff("case-008", PAWS, SARAH, "Safe arrival");
    completeShelterIntake("case-008", SARAH);

    const history = getStatusHistoryForCase("case-008");
    expect(history.some((h) => h.toStatus === "shelter_handoff")).toBe(true);
    expect(history.some((h) => h.note?.includes("intake"))).toBe(true);
  });
});

describe("destination confirmation", () => {
  it("records destination confirmation in timeline", () => {
    const caseItem = DEMO_CASES.find((c) => c.id === "case-008");
    caseItem!.status = "awaiting_shelter";
    caseItem!.assignedShelterId = undefined;

    selectShelter("case-008", PAWS, SARAH);

    const history = getStatusHistoryForCase("case-008");
    expect(history.some((h) => h.note?.includes("Destination confirmed"))).toBe(
      true,
    );
    expect(caseItem!.assignedShelterId).toBe(PAWS);
  });
});
