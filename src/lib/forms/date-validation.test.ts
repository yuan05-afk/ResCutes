import { describe, expect, it } from "vitest";
import {
  addDaysIso,
  followUpDateBounds,
  formatDisplayDate,
  parseIsoDate,
  toIsoDate,
  todayIso,
  validateIsoDate,
} from "@/lib/forms/date-validation";

describe("date-validation", () => {
  it("parses and rejects invalid calendar dates", () => {
    expect(parseIsoDate("2026-09-03")?.getDate()).toBe(3);
    expect(parseIsoDate("2026-02-30")).toBeNull();
    expect(parseIsoDate("26-09-03")).toBeNull();
    expect(parseIsoDate("")).toBeNull();
  });

  it("round-trips local dates without timezone shift", () => {
    const iso = "2026-12-31";
    expect(toIsoDate(parseIsoDate(iso)!)).toBe(iso);
  });

  it("requires a date when requested", () => {
    expect(validateIsoDate("", { required: true, label: "Follow-up date" })).toBe(
      "Follow-up date is required.",
    );
    expect(validateIsoDate("  ", { required: true })).toBe("Date is required.");
  });

  it("enforces notBeforeToday and max bounds", () => {
    const { min, max } = followUpDateBounds();
    expect(validateIsoDate(min, { notBeforeToday: true })).toBeNull();

    const yesterday = addDaysIso(todayIso(), -1)!;
    expect(
      validateIsoDate(yesterday, {
        notBeforeToday: true,
        label: "Follow-up date",
      }),
    ).toMatch(/cannot be before/i);

    const afterMax = addDaysIso(max, 1)!;
    expect(
      validateIsoDate(afterMax, {
        max,
        label: "Follow-up date",
      }),
    ).toMatch(/cannot be after/i);
  });

  it("formats display dates for en-SG", () => {
    expect(formatDisplayDate("2026-09-03")).toMatch(/Sep/);
    expect(formatDisplayDate("not-a-date")).toBe("");
  });
});
