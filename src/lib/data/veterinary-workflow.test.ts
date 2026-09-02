import { describe, it, expect, beforeEach } from "vitest";
import {
  completeShelterIntake,
  confirmShelterHandoff,
  getAnimalById,
  getMedicalClearanceForAnimal,
  updateMedicalClearance,
} from "@/lib/data/service";
import {
  DEMO_CASES,
  DEMO_ANIMALS,
  DEMO_HANDOFFS,
  DEMO_MEDICAL_CLEARANCES,
  DEMO_NOTIFICATIONS,
  DEMO_IDS,
} from "@/lib/data/demo-store";
import {
  seedAnimal001Fixtures,
  seedCase008Fixtures,
  seedLunaFixtures,
} from "@/lib/data/workflow-test-fixtures";

const ANITA = DEMO_IDS.users.anita;
const SARAH = DEMO_IDS.users.sarah;
const PAWS = DEMO_IDS.shelters.paws;

function resetCase008ForVetWorkflow() {
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

  const clearanceIdx = DEMO_MEDICAL_CLEARANCES.findIndex(
    (c) => c.animalId === "animal-008",
  );
  if (clearanceIdx >= 0) DEMO_MEDICAL_CLEARANCES.splice(clearanceIdx, 1);
}

describe("veterinary examination workflow", () => {
  beforeEach(() => {
    seedCase008Fixtures();
    resetCase008ForVetWorkflow();
  });

  it("creates animal awaiting examination after intake", () => {
    confirmShelterHandoff("case-008", PAWS, SARAH);
    const intake = completeShelterIntake("case-008", SARAH, {
      initialCondition: "Alert, limping",
    });
    expect(intake.ok).toBe(true);
    if (!intake.ok) return;

    const animal = getAnimalById(intake.animalId);
    expect(animal?.clearanceStatus).toBe("awaiting_examination");
    expect(animal?.pathwayStage).toBe("medical_clearance");
    expect(animal?.recommendedNextAction).toBe("Schedule veterinary examination");
  });

  it("records examination and transitions to under treatment", () => {
    confirmShelterHandoff("case-008", PAWS, SARAH);
    const intake = completeShelterIntake("case-008", SARAH);
    expect(intake.ok).toBe(true);
    if (!intake.ok) return;

    const result = updateMedicalClearance(intake.animalId, ANITA, {
      clearanceStatus: "under_treatment",
      generalCondition: "Moderate leg injury with swelling",
      treatmentSummary: "Splint applied and pain management started",
      medicalPriority: "urgent",
    });

    expect(result.ok).toBe(true);
    const animal = getAnimalById(intake.animalId);
    expect(animal?.clearanceStatus).toBe("under_treatment");
    expect(animal?.recommendedNextAction).toBe(
      "Continue treatment and monitor recovery",
    );

    const clearance = getMedicalClearanceForAnimal(intake.animalId);
    expect(clearance?.generalCondition).toContain("Moderate leg injury");
    expect(clearance?.examinationDate).toBeDefined();
  });

  it("progresses under treatment to medically cleared", () => {
    confirmShelterHandoff("case-008", PAWS, SARAH);
    const intake = completeShelterIntake("case-008", SARAH);
    expect(intake.ok).toBe(true);
    if (!intake.ok) return;

    updateMedicalClearance(intake.animalId, ANITA, {
      clearanceStatus: "under_treatment",
      generalCondition: "Recovering well",
      treatmentSummary: "Splint and rest",
    });

    const beforeNotifs = DEMO_NOTIFICATIONS.length;

    const cleared = updateMedicalClearance(intake.animalId, ANITA, {
      clearanceStatus: "medically_cleared",
      generalCondition: "Healed and stable",
    });

    expect(cleared.ok).toBe(true);
    const animal = getAnimalById(intake.animalId);
    expect(animal?.clearanceStatus).toBe("medically_cleared");
    expect(animal?.pathwayStage).toBe("behavior_assessment");
    expect(animal?.recommendedNextAction).toBe("Complete behavioral assessment");
    expect(animal?.temporaryId).toBeTruthy();

    expect(DEMO_NOTIFICATIONS.length).toBeGreaterThan(beforeNotifs);
    const staffNotif = DEMO_NOTIFICATIONS.find(
      (n) =>
        n.userId === SARAH &&
        n.title === "Animal medically cleared" &&
        n.message.includes(animal!.temporaryId),
    );
    expect(staffNotif).toBeDefined();
  });

  it("supports follow-up required path", () => {
    confirmShelterHandoff("case-008", PAWS, SARAH);
    const intake = completeShelterIntake("case-008", SARAH);
    expect(intake.ok).toBe(true);
    if (!intake.ok) return;

    const followUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const result = updateMedicalClearance(intake.animalId, ANITA, {
      clearanceStatus: "follow_up_required",
      generalCondition: "Stable but needs blood work review",
      followUpDate,
    });

    expect(result.ok).toBe(true);
    const animal = getAnimalById(intake.animalId);
    expect(animal?.clearanceStatus).toBe("follow_up_required");
    expect(animal?.recommendedNextAction).toBe(
      "Schedule follow-up veterinary examination",
    );
  });

  it("rejects invalid clearance transitions", () => {
    confirmShelterHandoff("case-008", PAWS, SARAH);
    const intake = completeShelterIntake("case-008", SARAH);
    expect(intake.ok).toBe(true);
    if (!intake.ok) return;

    const invalid = updateMedicalClearance(intake.animalId, ANITA, {
      clearanceStatus: "medically_cleared",
      generalCondition: "Skipped examination",
    });

    expect(invalid.ok).toBe(false);
    if (invalid.ok) return;
    expect(invalid.error).toContain("Cannot transition");
  });

  it("requires general condition when recording examination", () => {
    confirmShelterHandoff("case-008", PAWS, SARAH);
    const intake = completeShelterIntake("case-008", SARAH);
    expect(intake.ok).toBe(true);
    if (!intake.ok) return;

    const missing = updateMedicalClearance(intake.animalId, ANITA, {
      clearanceStatus: "under_treatment",
      treatmentSummary: "Treatment without condition",
    });

    expect(missing.ok).toBe(false);
    if (missing.ok) return;
    expect(missing.error).toContain("General condition is required");
  });

  it("locks medically cleared records", () => {
    seedAnimal001Fixtures();

    const clearedAnimal = getAnimalById("animal-001");
    expect(clearedAnimal?.clearanceStatus).toBe("medically_cleared");

    const locked = updateMedicalClearance("animal-001", ANITA, {
      clearanceStatus: "under_treatment",
      generalCondition: "Attempt edit",
    });

    expect(locked.ok).toBe(false);
    if (locked.ok) return;
    expect(locked.error).toContain("cannot be modified");
  });
});

function resetLunaForVetTests() {
  const luna = DEMO_ANIMALS.find((a) => a.id === DEMO_IDS.luna.animal);
  if (luna) {
    luna.clearanceStatus = "under_treatment";
    luna.pathwayStage = "medical_clearance";
    luna.recommendedNextAction = "Continue treatment and monitor recovery";
  }
  const clearance = DEMO_MEDICAL_CLEARANCES.find(
    (c) => c.animalId === DEMO_IDS.luna.animal,
  );
  if (clearance) {
    clearance.clearanceStatus = "under_treatment";
  }
}

describe("Luna veterinary workflow", () => {
  beforeEach(() => {
    seedLunaFixtures();
    resetLunaForVetTests();
  });
  it("Luna is under treatment with examination recorded", () => {
    const luna = getAnimalById(DEMO_IDS.luna.animal);
    expect(luna?.clearanceStatus).toBe("under_treatment");

    const clearance = getMedicalClearanceForAnimal(DEMO_IDS.luna.animal);
    expect(clearance?.examinationDate).toBeDefined();
    expect(clearance?.treatmentSummary).toBeTruthy();
  });

  it("Luna can be marked medically cleared", () => {
    const result = updateMedicalClearance(DEMO_IDS.luna.animal, ANITA, {
      clearanceStatus: "medically_cleared",
      generalCondition: "Fracture healed, splint removed",
      veterinarianNotes: "Ready for behavioral assessment",
    });

    expect(result.ok).toBe(true);
    const luna = getAnimalById(DEMO_IDS.luna.animal);
    expect(luna?.clearanceStatus).toBe("medically_cleared");
    expect(luna?.pathwayStage).toBe("behavior_assessment");
  });
});
