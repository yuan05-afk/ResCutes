import { describe, it, expect } from "vitest";
import {
  canViewExactLocation,
  canViewMedicalNotes,
  canManageCases,
  ROLES,
} from "@/lib/auth/permissions";

describe("Authorization helpers", () => {
  it("allows staff and rescuers to view exact location", () => {
    expect(canViewExactLocation([ROLES.RESCUER])).toBe(true);
    expect(canViewExactLocation([ROLES.SHELTER_STAFF])).toBe(true);
    expect(canViewExactLocation([ROLES.CITIZEN])).toBe(false);
  });

  it("restricts medical notes to authorized roles", () => {
    expect(canViewMedicalNotes([ROLES.VETERINARIAN])).toBe(true);
    expect(canViewMedicalNotes([ROLES.SHELTER_STAFF])).toBe(true);
    expect(canViewMedicalNotes([ROLES.CITIZEN])).toBe(false);
    expect(canViewMedicalNotes([ROLES.RESCUER])).toBe(false);
  });

  it("allows staff to manage cases", () => {
    expect(canManageCases([ROLES.SHELTER_STAFF])).toBe(true);
    expect(canManageCases([ROLES.ADMINISTRATOR])).toBe(true);
    expect(canManageCases([ROLES.RESCUER])).toBe(false);
  });
});
