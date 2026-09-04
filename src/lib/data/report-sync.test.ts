import { describe, it, expect, beforeEach } from "vitest";
import { submitReport, getCases } from "@/lib/data/service";
import {
  resetWorkflowTestData,
  testUsers,
} from "@/lib/data/workflow-test-fixtures";

describe("report sync", () => {
  let users: Awaited<ReturnType<typeof testUsers>>;

  beforeEach(async () => {
    await resetWorkflowTestData();
    users = await testUsers();
  });

  it("adds a submitted report to case lists", async () => {
    const newCase = await submitReport({
      reporterId: users.maria,
      species: "dog",
      injurySeverity: "minor",
      environmentalDanger: "none",
      vulnerability: "adult_healthy",
      description: "Small tan aspin wandering near school gate.",
      contactPreference: "in_app",
      latitude: 14.5995,
      longitude: 120.9842,
    });

    const allCases = await getCases();
    expect(allCases.some((c) => c.id === newCase.id)).toBe(true);

    const reporterCases = await getCases({ reporterId: users.maria });
    expect(reporterCases.some((c) => c.id === newCase.id)).toBe(true);

    const staffView = await getCases({ status: "report_submitted" });
    expect(staffView.some((c) => c.id === newCase.id)).toBe(true);
  });
});
