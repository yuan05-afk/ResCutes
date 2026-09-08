import type { userRoleEnum } from "@/db/schema";

export type Role = typeof userRoleEnum.enumValues[number];

export const ROLES = {
  CITIZEN: "citizen" as Role,
  RESCUER: "rescuer" as Role,
  SHELTER_STAFF: "shelter_staff" as Role,
  VETERINARIAN: "veterinarian" as Role,
  ADMINISTRATOR: "administrator" as Role,
};

export function hasRole(userRoles: Role[], role: Role): boolean {
  return userRoles.includes(role);
}

export function hasAnyRole(userRoles: Role[], roles: Role[]): boolean {
  return roles.some((r) => userRoles.includes(r));
}

/** Administrators have full access to every capability in the app. */
export function isAdministrator(userRoles: Role[]): boolean {
  return hasRole(userRoles, ROLES.ADMINISTRATOR);
}

function hasFullAccess(userRoles: Role[]): boolean {
  return isAdministrator(userRoles);
}

export function canViewExactLocation(userRoles: Role[]): boolean {
  if (hasFullAccess(userRoles)) return true;
  return hasAnyRole(userRoles, [
    ROLES.RESCUER,
    ROLES.SHELTER_STAFF,
    ROLES.VETERINARIAN,
  ]);
}

export function canViewReporterInfo(userRoles: Role[]): boolean {
  if (hasFullAccess(userRoles)) return true;
  return hasAnyRole(userRoles, [ROLES.SHELTER_STAFF, ROLES.RESCUER]);
}

export function canViewMedicalNotes(userRoles: Role[]): boolean {
  if (hasFullAccess(userRoles)) return true;
  return hasAnyRole(userRoles, [ROLES.SHELTER_STAFF, ROLES.VETERINARIAN]);
}

export function canManageCases(userRoles: Role[]): boolean {
  if (hasFullAccess(userRoles)) return true;
  return hasAnyRole(userRoles, [ROLES.SHELTER_STAFF]);
}

export function canAssignRescuer(userRoles: Role[]): boolean {
  if (hasFullAccess(userRoles)) return true;
  return hasAnyRole(userRoles, [ROLES.SHELTER_STAFF]);
}

export function canEditMedical(userRoles: Role[]): boolean {
  if (hasFullAccess(userRoles)) return true;
  return hasAnyRole(userRoles, [ROLES.VETERINARIAN]);
}

export function canManageSettings(userRoles: Role[]): boolean {
  if (hasFullAccess(userRoles)) return true;
  return hasAnyRole(userRoles, [ROLES.SHELTER_STAFF]);
}

export function canAccessDashboard(userRoles: Role[]): boolean {
  if (hasFullAccess(userRoles)) return true;
  return hasAnyRole(userRoles, [
    ROLES.SHELTER_STAFF,
    ROLES.VETERINARIAN,
  ]);
}

/**
 * Field PWA access: citizens, rescuers, and administrators (demo preview).
 * Shelter staff and veterinarians stay on the web dashboard.
 */
export function canAccessMobileApp(userRoles: Role[]): boolean {
  if (isAdministrator(userRoles)) return true;
  return hasAnyRole(userRoles, [ROLES.CITIZEN, ROLES.RESCUER]);
}

/** Roles to show on profile badges (admins collapse to a single label). */
export function getProfileRoleLabels(userRoles: Role[]): string[] {
  if (isAdministrator(userRoles)) {
    return [ROLE_LABELS.administrator];
  }
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const role of userRoles) {
    const label = ROLE_LABELS[role];
    if (!label || seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels.length > 0 ? labels : ["User"];
}

/** Nav label for Medical: staff are view-only; vets/admins can act. */
export function getMedicalNavLabel(userRoles: Role[]): string {
  if (canEditMedical(userRoles)) return "Medical";
  if (canViewMedicalNotes(userRoles)) return "Medical (view)";
  return "Medical";
}

/**
 * Primary post-login surface for a role set.
 * Field roles (citizen, rescuer) use the mobile app.
 * Operations roles (staff, vet, admin) use the web dashboard.
 */
export function getHomePathForRoles(
  userRoles: Role[],
): "/mobile" | "/dashboard" | "/" {
  if (canAccessDashboard(userRoles)) return "/dashboard";
  if (
    hasRole(userRoles, ROLES.CITIZEN) ||
    hasRole(userRoles, ROLES.RESCUER)
  ) {
    return "/mobile";
  }
  return "/";
}

/**
 * Resolve where to send the user after sign-in.
 * Honors a safe callbackUrl only when it matches that role's primary surface
 * (so landing "Open Mobile App" does not send shelter staff into /mobile).
 */
export function getPostLoginPath(
  userRoles: Role[],
  callbackUrl?: string | null,
): string {
  const home = getHomePathForRoles(userRoles);
  const raw = (callbackUrl ?? "").trim();

  if (
    !raw ||
    raw === "/login" ||
    !raw.startsWith("/") ||
    raw.startsWith("//")
  ) {
    return home;
  }

  const callbackIsMobile = raw === "/mobile" || raw.startsWith("/mobile/");
  const homeIsMobile = home === "/mobile";

  if (callbackIsMobile === homeIsMobile) {
    return raw;
  }

  return home;
}

export function canActAsRescuer(userRoles: Role[]): boolean {
  if (hasFullAccess(userRoles)) return true;
  return hasRole(userRoles, ROLES.RESCUER);
}

export function canUseCitizenMobileFeatures(userRoles: Role[]): boolean {
  if (hasFullAccess(userRoles)) return true;
  return hasRole(userRoles, ROLES.CITIZEN);
}

export function isStaffOrAdmin(userRoles: Role[]): boolean {
  if (hasFullAccess(userRoles)) return true;
  return hasAnyRole(userRoles, [
    ROLES.SHELTER_STAFF,
    ROLES.VETERINARIAN,
    ROLES.ADMINISTRATOR,
  ]);
}

/** Rescuer mobile workflows (assignments, field updates). */
export function shouldUseRescuerMobileExperience(userRoles: Role[]): boolean {
  return canActAsRescuer(userRoles);
}

/**
 * Mobile case detail access: reporter of the case, assigned rescuer,
 * or staff/admin who manage cases. Enforced on the server.
 */
export function canAccessMobileCase(opts: {
  userId: string;
  userRoles: Role[];
  reporterId: string;
  assignedRescuerIds?: string[];
}): boolean {
  if (isAdministrator(opts.userRoles) || canManageCases(opts.userRoles)) {
    return true;
  }
  if (opts.reporterId === opts.userId) return true;
  if (
    canActAsRescuer(opts.userRoles) &&
    opts.assignedRescuerIds?.includes(opts.userId)
  ) {
    return true;
  }
  return false;
}

export function getPrimaryMobileRole(userRoles: Role[]): Role {
  if (shouldUseRescuerMobileExperience(userRoles)) return ROLES.RESCUER;
  return ROLES.CITIZEN;
}

export function getDisplayRoleLabel(userRoles: Role[]): string {
  if (isAdministrator(userRoles)) return ROLE_LABELS.administrator;
  const primary = userRoles[0];
  return primary ? ROLE_LABELS[primary] : "User";
}

export function approximateLocation(
  lat: number,
  lon: number,
  radiusMeters = 200,
): { latitude: number; longitude: number } {
  const offset = (radiusMeters / 111000) * (0.5 + Math.random() * 0.5);
  const angle = Math.random() * 2 * Math.PI;
  return {
    latitude: lat + offset * Math.cos(angle),
    longitude: lon + offset * Math.sin(angle),
  };
}

export const ROLE_LABELS: Record<Role, string> = {
  citizen: "Citizen",
  rescuer: "Rescuer",
  shelter_staff: "Shelter Staff",
  veterinarian: "Veterinarian",
  administrator: "Administrator",
};

export const DEMO_ACCOUNTS = [
  {
    email: "citizen@rescutes.demo",
    password: "demo1234",
    name: "Maria Santos",
    role: ROLES.CITIZEN,
    description: "Report and track cases",
  },
  {
    email: "rescuer@rescutes.demo",
    password: "demo1234",
    name: "James Chen",
    role: ROLES.RESCUER,
    description: "Accept field assignments",
  },
  {
    email: "staff@rescutes.demo",
    password: "demo1234",
    name: "Sarah Lim",
    role: ROLES.SHELTER_STAFF,
    description: "Verify and dispatch",
  },
  {
    email: "vet@rescutes.demo",
    password: "demo1234",
    name: "Dr. Anita Rao",
    role: ROLES.VETERINARIAN,
    description: "Exams and clearance",
  },
  {
    email: "admin@rescutes.demo",
    password: "demo1234",
    name: "Alex Wong",
    role: ROLES.ADMINISTRATOR,
    description: "Full web operations",
  },
] as const;
