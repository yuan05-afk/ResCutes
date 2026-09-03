import { describe, it, expect, beforeEach } from "vitest";
import {
  completeShelterIntake,
  confirmShelterHandoff,
  getAnimalById,
  getMedicalClearanceForAnimal,
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
  });

  it("requires general condition when completing exam", async () => {
    const intake = await intakeAnimal();
    if (!intake.ok) return;

    const result = await updateMedicalClearance(intake.animalId, users.anita, {
      clearanceStatus: "medically_cleared",
    });
    expect(result.ok).toBe(false);
  });

  it("locks medically cleared records", async () => {
    await seedClearedAnimalFixture();

    const locked = await updateMedicalClearance(TEST_IDS.animal001, users.anita, {
      clearanceStatus: "under_treatment",
      generalCondition: "Changed",
    });
    expect(locked.ok).toBe(false);
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
