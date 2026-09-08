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
  canAccessMobileApp,
  canAccessMobileCase,
  shouldUseRescuerMobileExperience,
  getDisplayRoleLabel,
  getHomePathForRoles,
  getPostLoginPath,
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
    expect(canViewReporterInfo([ROLES.RESCUER])).toBe(true);
    expect(canViewReporterInfo([ROLES.SHELTER_STAFF])).toBe(true);
    expect(canViewReporterInfo([ROLES.CITIZEN])).toBe(false);
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

  it("gates mobile case detail to reporter, assigned rescuer, or staff", () => {
    const caseOpts = {
      reporterId: "citizen-1",
      assignedRescuerIds: ["rescuer-1"],
    };

    expect(
      canAccessMobileCase({
        userId: "citizen-1",
        userRoles: [ROLES.CITIZEN],
        ...caseOpts,
      }),
    ).toBe(true);

    expect(
      canAccessMobileCase({
        userId: "other-citizen",
        userRoles: [ROLES.CITIZEN],
        ...caseOpts,
      }),
    ).toBe(false);

    expect(
      canAccessMobileCase({
        userId: "rescuer-1",
        userRoles: [ROLES.RESCUER],
        ...caseOpts,
      }),
    ).toBe(true);

    expect(
      canAccessMobileCase({
        userId: "rescuer-2",
        userRoles: [ROLES.RESCUER],
        ...caseOpts,
      }),
    ).toBe(false);

    expect(
      canAccessMobileCase({
        userId: "staff-1",
        userRoles: [ROLES.SHELTER_STAFF],
        ...caseOpts,
      }),
    ).toBe(true);
  });

  it("routes field roles to mobile and operations roles to the web dashboard", () => {
    expect(getHomePathForRoles([ROLES.CITIZEN])).toBe("/mobile");
    expect(getHomePathForRoles([ROLES.RESCUER])).toBe("/mobile");
    expect(getHomePathForRoles([ROLES.SHELTER_STAFF])).toBe("/dashboard");
    expect(getHomePathForRoles([ROLES.VETERINARIAN])).toBe("/dashboard");
    expect(getHomePathForRoles([ROLES.ADMINISTRATOR])).toBe("/dashboard");
  });

  it("ignores callback URLs that point at the wrong surface for the role", () => {
    expect(getPostLoginPath([ROLES.CITIZEN], "/mobile/report")).toBe(
      "/mobile/report",
    );
    expect(getPostLoginPath([ROLES.CITIZEN], "/dashboard")).toBe("/mobile");
    expect(getPostLoginPath([ROLES.SHELTER_STAFF], "/mobile")).toBe(
      "/dashboard",
    );
    expect(getPostLoginPath([ROLES.VETERINARIAN], "/medical")).toBe("/medical");
    expect(getPostLoginPath([ROLES.ADMINISTRATOR], "/mobile/cases")).toBe(
      "/dashboard",
    );
  });

  it("gates mobile app access to citizen, rescuer, and admin", () => {
    expect(canAccessMobileApp([ROLES.CITIZEN])).toBe(true);
    expect(canAccessMobileApp([ROLES.RESCUER])).toBe(true);
    expect(canAccessMobileApp([ROLES.ADMINISTRATOR])).toBe(true);
    expect(canAccessMobileApp([ROLES.SHELTER_STAFF])).toBe(false);
    expect(canAccessMobileApp([ROLES.VETERINARIAN])).toBe(false);
  });
});
