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
import { getDb } from "@/db";
import { rescueCases } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  resetWorkflowTestData,
  seedCase008Fixtures,
  TEST_IDS,
  TEST_SHELTERS,
  testUsers,
} from "@/lib/data/workflow-test-fixtures";

describe("shelter handoff guards", () => {
  let users: Awaited<ReturnType<typeof testUsers>>;

  beforeEach(async () => {
    await resetWorkflowTestData();
    users = await testUsers();
    await seedCase008Fixtures();
  });

  it("rejects handoff without destination", async () => {
    const db = getDb();
    await db
      .update(rescueCases)
      .set({ assignedShelterId: null })
      .where(eq(rescueCases.id, TEST_IDS.case008));

    const result = await confirmShelterHandoff(
      TEST_IDS.case008,
      TEST_SHELTERS.paws,
      users.sarah,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects handoff when case is not ready", async () => {
    const db = getDb();
    await db
      .update(rescueCases)
      .set({ status: "verified" })
      .where(eq(rescueCases.id, TEST_IDS.case008));

    const result = await confirmShelterHandoff(
      TEST_IDS.case008,
      TEST_SHELTERS.paws,
      users.sarah,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects duplicate handoff", async () => {
    const result = await confirmShelterHandoff(
      TEST_IDS.case008,
      TEST_SHELTERS.paws,
      users.sarah,
    );
    expect(result.ok).toBe(true);

    const second = await confirmShelterHandoff(
      TEST_IDS.case008,
      TEST_SHELTERS.paws,
      users.sarah,
    );
    expect(second.ok).toBe(false);
  });

  it("completes handoff and intake", async () => {
    const result = await confirmShelterHandoff(
      TEST_IDS.case008,
      TEST_SHELTERS.paws,
      users.sarah,
      "Safe arrival",
    );
    expect(result.ok).toBe(true);

    const caseItem = await getCaseById(TEST_IDS.case008);
    expect(caseItem?.status).toBe("shelter_handoff");
    expect(await getHandoffForCase(TEST_IDS.case008)).toBeTruthy();

    const first = await completeShelterIntake(TEST_IDS.case008, users.sarah, {
      name: "Buddy",
      initialCondition: "Limping but alert",
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const animal = await getAnimalById(first.animalId);
    expect(animal?.name).toBe("Buddy");

    const second = await completeShelterIntake(TEST_IDS.case008, users.sarah);
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.animalId).toBe(first.animalId);
  });

  it("records intake in status history", async () => {
    await confirmShelterHandoff(TEST_IDS.case008, TEST_SHELTERS.paws, users.sarah);
    await completeShelterIntake(TEST_IDS.case008, users.sarah);

    const history = await getStatusHistoryForCase(TEST_IDS.case008);
    expect(history.some((h) => h.note === "Shelter intake completed")).toBe(true);
  });

  it("records destination confirmation in history", async () => {
    await selectShelter(TEST_IDS.case008, TEST_SHELTERS.paws, users.sarah);

    const history = await getStatusHistoryForCase(TEST_IDS.case008);
    expect(history.some((h) => h.note?.includes("Destination confirmed"))).toBe(true);
  });
});
