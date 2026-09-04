import { describe, it, expect, beforeEach } from "vitest";
import {
  completeShelterIntake,
  confirmShelterHandoff,
  getAnimalById,
  getMedicalClearanceForAnimal,
  updateAnimalProfile,
  updateMedicalClearance,
} from "@/lib/data/service";
import {
  resetWorkflowTestData,
  seedCase008Fixtures,
  seedClearedAnimalFixture,
  seedLunaMedicalFixture,
  TEST_IDS,
  TEST_SHELTERS,
  testUsers,
} from "@/lib/data/workflow-test-fixtures";

describe("veterinary workflow", () => {
  let users: Awaited<ReturnType<typeof testUsers>>;

  beforeEach(async () => {
    await resetWorkflowTestData();
    users = await testUsers();
  });

  async function intakeAnimal() {
    await seedCase008Fixtures();
    await confirmShelterHandoff(TEST_IDS.case008, TEST_SHELTERS.paws, users.sarah);
    return completeShelterIntake(TEST_IDS.case008, users.sarah, {
      name: "Scout",
    });
  }

  it("creates animal awaiting examination after intake", async () => {
    const intake = await intakeAnimal();
    expect(intake.ok).toBe(true);
    if (!intake.ok) return;

    const animal = await getAnimalById(intake.animalId);
    expect(animal?.clearanceStatus).toBe("awaiting_examination");
  });

  it("records examination and moves to under treatment", async () => {
    const intake = await intakeAnimal();
    if (!intake.ok) return;

    const result = await updateMedicalClearance(intake.animalId, users.anita, {
      clearanceStatus: "under_treatment",
      generalCondition: "Stable with leg wound",
      treatmentSummary: "Antibiotics and rest",
    });
    expect(result.ok).toBe(true);

    const animal = await getAnimalById(intake.animalId);
    expect(animal?.clearanceStatus).toBe("under_treatment");

    const clearance = await getMedicalClearanceForAnimal(intake.animalId);
    expect(clearance?.treatmentSummary).toContain("Antibiotics");
  });

  it("clears animal medically", async () => {
    const intake = await intakeAnimal();
    if (!intake.ok) return;

    await updateMedicalClearance(intake.animalId, users.anita, {
      clearanceStatus: "under_treatment",
      generalCondition: "Stable",
      treatmentSummary: "Wound care",
    });

    const cleared = await updateMedicalClearance(intake.animalId, users.anita, {
      clearanceStatus: "medically_cleared",
      generalCondition: "Healthy",
    });
    expect(cleared.ok).toBe(true);

    const animal = await getAnimalById(intake.animalId);
    expect(animal?.clearanceStatus).toBe("medically_cleared");
    expect(animal?.pathwayStage).toBe("medical_clearance");
  });

  it("requires general condition when completing exam", async () => {
    const intake = await intakeAnimal();
    if (!intake.ok) return;

    const result = await updateMedicalClearance(intake.animalId, users.anita, {
      clearanceStatus: "medically_cleared",
    });
    expect(result.ok).toBe(false);
  });

  it("allows rollback from under treatment to examination", async () => {
    const intake = await intakeAnimal();
    if (!intake.ok) return;

    await updateMedicalClearance(intake.animalId, users.anita, {
      clearanceStatus: "under_treatment",
      generalCondition: "Stable",
      treatmentSummary: "Wound care",
    });

    const rolledBack = await updateMedicalClearance(intake.animalId, users.anita, {
      clearanceStatus: "under_examination",
    });
    expect(rolledBack.ok).toBe(true);

    const animal = await getAnimalById(intake.animalId);
    expect(animal?.clearanceStatus).toBe("under_examination");
    expect(animal?.pathwayStage).toBe("medical_clearance");
  });

  it("blocks reopening cleared animals on adoption pathway", async () => {
    await seedClearedAnimalFixture();
    await updateAnimalProfile(TEST_IDS.animal001, {
      pathwayStage: "ready_for_adoption",
    });

    const blocked = await updateMedicalClearance(TEST_IDS.animal001, users.anita, {
      clearanceStatus: "under_treatment",
      generalCondition: "Changed",
    });
    expect(blocked.ok).toBe(false);
  });

  it("rolls back from follow-up without requiring follow-up date", async () => {
    const intake = await intakeAnimal();
    if (!intake.ok) return;

    await updateMedicalClearance(intake.animalId, users.anita, {
      clearanceStatus: "under_treatment",
      generalCondition: "Stable",
      treatmentSummary: "Wound care",
    });

    const scheduled = await updateMedicalClearance(intake.animalId, users.anita, {
      clearanceStatus: "follow_up_required",
      followUpDate: "2026-12-01T12:00:00.000Z",
    });
    expect(scheduled.ok).toBe(true);

    const rolledBack = await updateMedicalClearance(intake.animalId, users.anita, {
      clearanceStatus: "awaiting_examination",
      statusChangeNote: "Corrected from Follow-up.",
    });
    expect(rolledBack.ok).toBe(true);

    const animal = await getAnimalById(intake.animalId);
    expect(animal?.clearanceStatus).toBe("awaiting_examination");

    const clearance = await getMedicalClearanceForAnimal(intake.animalId);
    expect(clearance?.followUpDate).toBeUndefined();
  });

  it("allows reopening cleared animals still on medical pathway", async () => {
    await seedClearedAnimalFixture();

    const reopened = await updateMedicalClearance(TEST_IDS.animal001, users.anita, {
      clearanceStatus: "under_examination",
    });
    expect(reopened.ok).toBe(true);

    const animal = await getAnimalById(TEST_IDS.animal001);
    expect(animal?.clearanceStatus).toBe("under_examination");
    expect(animal?.pathwayStage).toBe("medical_clearance");
  });

  it("updates luna fixture clearance", async () => {
    await seedLunaMedicalFixture();

    const luna = await getAnimalById(TEST_IDS.lunaAnimal);
    expect(luna?.clearanceStatus).toBe("awaiting_examination");

    const result = await updateMedicalClearance(TEST_IDS.lunaAnimal, users.anita, {
      clearanceStatus: "under_examination",
    });
    expect(result.ok).toBe(true);

    const updated = await getAnimalById(TEST_IDS.lunaAnimal);
    expect(updated?.clearanceStatus).toBe("under_examination");
  });
});
