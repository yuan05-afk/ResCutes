import { describe, it, expect, beforeEach, afterAll } from "vitest";
import {
  acceptAssignment,
  declineAssignment,
  getCaseById,
  updateCaseStatusAsRescuer,
} from "@/lib/data/service";
import {
  resetWorkflowTestData,
  seedCase004Fixtures,
  TEST_IDS,
  testUsers,
} from "@/lib/data/workflow-test-fixtures";

describe("rescuer workflow", () => {
  let users: Awaited<ReturnType<typeof testUsers>>;

  beforeEach(async () => {
    await resetWorkflowTestData();
    users = await testUsers();
    await seedCase004Fixtures();
  });

  afterAll(async () => {
    await resetWorkflowTestData();
  });

  it("accepts a pending assignment without changing case status", async () => {
    const accepted = await acceptAssignment(
      TEST_IDS.assignment004,
      users.james,
    );
    expect(accepted).toBe(true);

    const caseItem = await getCaseById(TEST_IDS.case004);
    expect(caseItem?.status).toBe("rescuer_assigned");
  });

  it("declines a pending assignment and reverts case to verified", async () => {
    const declined = await declineAssignment(
      TEST_IDS.assignment004,
      users.james,
      "Too far",
    );
    expect(declined).toBe(true);

    const caseItem = await getCaseById(TEST_IDS.case004);
    expect(caseItem?.status).toBe("verified");
  });

  it("marks animal secured in one step after accept", async () => {
    await acceptAssignment(TEST_IDS.assignment004, users.james);

    const secured = await updateCaseStatusAsRescuer(
      TEST_IDS.case004,
      users.james,
      "animal_secured",
    );
    expect(secured.ok).toBe(true);
    expect((await getCaseById(TEST_IDS.case004))?.status).toBe("animal_secured");
  });

  it("rejects invalid status transitions", async () => {
    await acceptAssignment(TEST_IDS.assignment004, users.james);

    const invalid = await updateCaseStatusAsRescuer(
      TEST_IDS.case004,
      users.james,
      "awaiting_shelter",
    );
    expect(invalid.ok).toBe(false);
  });

  it("allows admin override on assignment acceptance", async () => {
    const accepted = await acceptAssignment(TEST_IDS.assignment004, users.alex, {
      adminOverride: true,
    });
    expect(accepted).toBe(true);

    const progressed = await updateCaseStatusAsRescuer(
      TEST_IDS.case004,
      users.alex,
      "animal_secured",
      { adminOverride: true },
    );
    expect(progressed.ok).toBe(true);
    expect((await getCaseById(TEST_IDS.case004))?.status).toBe("animal_secured");
  });
});
