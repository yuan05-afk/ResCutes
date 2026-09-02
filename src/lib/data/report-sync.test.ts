import { describe, it, expect, beforeEach } from "vitest";
import { submitReport, getCases } from "@/lib/data/service";
import { DEMO_CASES, DEMO_IDS } from "@/lib/data/demo-store";

describe("mobile report sync", () => {
  beforeEach(() => {
    DEMO_CASES.length = 0;
  });

  it("stores a citizen report in the shared case list for web and mobile", () => {
    const newCase = submitReport({
      reporterId: DEMO_IDS.users.maria,
      species: "dog",
      injurySeverity: "minor",
      environmentalDanger: "traffic",
      vulnerability: "adult_healthy",
      description: "Small tan dog pacing near a busy intersection.",
      contactPreference: "in_app",
      latitude: 14.5995,
      longitude: 120.9842,
      photoUrl: "https://example.com/report.jpg",
    });

    expect(newCase.status).toBe("report_submitted");
    expect(newCase.reporterName).toBe("Maria Santos");

    const allCases = getCases();
    expect(allCases.some((c) => c.id === newCase.id)).toBe(true);

    const reporterCases = getCases({ reporterId: DEMO_IDS.users.maria });
    expect(reporterCases[0]?.id).toBe(newCase.id);

    const staffView = getCases({ status: "report_submitted" });
    expect(staffView.some((c) => c.caseNumber === newCase.caseNumber)).toBe(true);
  });
});
