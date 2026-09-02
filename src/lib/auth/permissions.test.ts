import { describe, it, expect } from "vitest";
import {
  canViewExactLocation,
  canViewMedicalNotes,
  canManageCases,
  canEditMedical,
  canManageSettings,
  canViewReporterInfo,
  canActAsRescuer,
  canUseCitizenMobileFeatures,
  canAccessDashboard,
  shouldUseRescuerMobileExperience,
  getDisplayRoleLabel,
  isAdministrator,
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

  it("grants administrators every capability", () => {
    const admin = [ROLES.ADMINISTRATOR];

    expect(isAdministrator(admin)).toBe(true);
    expect(canViewExactLocation(admin)).toBe(true);
    expect(canViewReporterInfo(admin)).toBe(true);
    expect(canViewMedicalNotes(admin)).toBe(true);
    expect(canManageCases(admin)).toBe(true);
    expect(canEditMedical(admin)).toBe(true);
    expect(canManageSettings(admin)).toBe(true);
    expect(canAccessDashboard(admin)).toBe(true);
    expect(canActAsRescuer(admin)).toBe(true);
    expect(canUseCitizenMobileFeatures(admin)).toBe(true);
    expect(shouldUseRescuerMobileExperience(admin)).toBe(true);
    expect(getDisplayRoleLabel(admin)).toBe("Administrator");
  });
});
