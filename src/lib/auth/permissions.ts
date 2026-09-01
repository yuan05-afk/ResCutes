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

export function canViewExactLocation(userRoles: Role[]): boolean {
  return hasAnyRole(userRoles, [
    ROLES.RESCUER,
    ROLES.SHELTER_STAFF,
    ROLES.VETERINARIAN,
    ROLES.ADMINISTRATOR,
  ]);
}

export function canViewReporterInfo(userRoles: Role[]): boolean {
  return hasAnyRole(userRoles, [
    ROLES.SHELTER_STAFF,
    ROLES.ADMINISTRATOR,
  ]);
}

export function canViewMedicalNotes(userRoles: Role[]): boolean {
  return hasAnyRole(userRoles, [
    ROLES.SHELTER_STAFF,
    ROLES.VETERINARIAN,
    ROLES.ADMINISTRATOR,
  ]);
}

export function canManageCases(userRoles: Role[]): boolean {
  return hasAnyRole(userRoles, [
    ROLES.SHELTER_STAFF,
    ROLES.ADMINISTRATOR,
  ]);
}

export function canAssignRescuer(userRoles: Role[]): boolean {
  return hasAnyRole(userRoles, [
    ROLES.SHELTER_STAFF,
    ROLES.ADMINISTRATOR,
  ]);
}

export function canEditMedical(userRoles: Role[]): boolean {
  return hasAnyRole(userRoles, [
    ROLES.VETERINARIAN,
    ROLES.ADMINISTRATOR,
  ]);
}

export function canManageSettings(userRoles: Role[]): boolean {
  return hasAnyRole(userRoles, [
    ROLES.SHELTER_STAFF,
    ROLES.ADMINISTRATOR,
  ]);
}

export function canAccessDashboard(userRoles: Role[]): boolean {
  return hasAnyRole(userRoles, [
    ROLES.SHELTER_STAFF,
    ROLES.VETERINARIAN,
    ROLES.ADMINISTRATOR,
  ]);
}

export function isStaffOrAdmin(userRoles: Role[]): boolean {
  return hasAnyRole(userRoles, [
    ROLES.SHELTER_STAFF,
    ROLES.VETERINARIAN,
    ROLES.ADMINISTRATOR,
  ]);
}

export function getPrimaryMobileRole(userRoles: Role[]): Role {
  if (hasRole(userRoles, ROLES.RESCUER)) return ROLES.RESCUER;
  return ROLES.CITIZEN;
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
    description: "Report animals and track your cases",
  },
  {
    email: "rescuer@rescutes.demo",
    password: "demo1234",
    name: "James Chen",
    role: ROLES.RESCUER,
    description: "Accept assignments and rescue animals",
  },
  {
    email: "staff@rescutes.demo",
    password: "demo1234",
    name: "Sarah Lim",
    role: ROLES.SHELTER_STAFF,
    description: "Verify reports and manage operations",
  },
  {
    email: "vet@rescutes.demo",
    password: "demo1234",
    name: "Dr. Anita Rao",
    role: ROLES.VETERINARIAN,
    description: "Record examinations and medical clearance",
  },
  {
    email: "admin@rescutes.demo",
    password: "demo1234",
    name: "Alex Wong",
    role: ROLES.ADMINISTRATOR,
    description: "Full system administration",
  },
] as const;
