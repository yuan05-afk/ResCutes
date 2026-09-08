import { describe, it, expect, beforeEach, afterAll } from "vitest";
import {
  generateRecommendationsForCase,
  getCaseById,
  getRecommendationsForCase,
} from "@/lib/data/service";
import {
  resetWorkflowTestData,
  seedCase004Verified,
  TEST_IDS,
} from "@/lib/data/workflow-test-fixtures";

describe("integration workflow", () => {
  beforeEach(async () => {
    await resetWorkflowTestData();
    await seedCase004Verified();
  });

  afterAll(async () => {
    await resetWorkflowTestData();
  });

  it("loads a verified case", async () => {
    const caseItem = await getCaseById(TEST_IDS.case004);
    expect(caseItem?.status).toBe("verified");
  });

  it("generates shelter recommendations once", async () => {
    const caseItem = await getCaseById(TEST_IDS.case004);
    expect(caseItem).toBeTruthy();

    await generateRecommendationsForCase(TEST_IDS.case004);
    const first = await getRecommendationsForCase(TEST_IDS.case004);
    expect(first.length).toBeGreaterThan(0);

    const second = await getRecommendationsForCase(TEST_IDS.case004);
    expect(second.length).toBe(first.length);
  });
});
