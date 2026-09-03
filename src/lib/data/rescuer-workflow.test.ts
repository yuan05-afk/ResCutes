import { describe, it, expect, beforeEach } from "vitest";
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

  it("accepts a pending assignment", async () => {
    const accepted = await acceptAssignment(
      TEST_IDS.assignment004,
      users.james,
    );
    expect(accepted).toBe(true);

    const caseItem = await getCaseById(TEST_IDS.case004);
    expect(caseItem?.status).toBe("rescue_accepted");
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

  it("progresses case through rescue statuses", async () => {
    await acceptAssignment(TEST_IDS.assignment004, users.james);

    const start = await updateCaseStatusAsRescuer(
      TEST_IDS.case004,
      users.james,
      "rescue_in_progress",
    );
    expect(start.ok).toBe(true);
    expect((await getCaseById(TEST_IDS.case004))?.status).toBe("rescue_in_progress");

    const secured = await updateCaseStatusAsRescuer(
      TEST_IDS.case004,
      users.james,
      "animal_secured",
    );
    expect(secured.ok).toBe(true);

    const awaiting = await updateCaseStatusAsRescuer(
      TEST_IDS.case004,
      users.james,
      "awaiting_shelter",
    );
    expect(awaiting.ok).toBe(true);
    expect((await getCaseById(TEST_IDS.case004))?.status).toBe("awaiting_shelter");
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
      "rescue_in_progress",
      { adminOverride: true },
    );
    expect(progressed.ok).toBe(true);
  });
});
