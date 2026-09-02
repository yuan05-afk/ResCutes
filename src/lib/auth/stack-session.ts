import "server-only";

import { hexclaveServerApp } from "@/stack/server";
import { AUTH_DEMO_USERS } from "@/lib/auth/demo-users";
import { getRolesByEmail, resolveDemoUserId } from "@/lib/auth/user-roles";
import type { Role } from "@/lib/auth/permissions";
import type { AppSession } from "@/lib/auth/types";

function rolesFromMetadata(metadata: unknown): Role[] | null {
  if (!metadata || typeof metadata !== "object") return null;
  const roles = (metadata as { roles?: unknown }).roles;
  if (!Array.isArray(roles)) return null;
  return roles.filter((r): r is Role => typeof r === "string");
}

function demoUserIdFromMetadata(metadata: unknown): string | undefined {
  if (!metadata || typeof metadata !== "object") return undefined;
  const id = (metadata as { demoUserId?: unknown }).demoUserId;
  return typeof id === "string" ? id : undefined;
}

export async function getAppSession(): Promise<AppSession | null> {
  const user = await hexclaveServerApp.getUser();
  const email = user?.primaryEmail?.trim().toLowerCase();
  if (!user || !email) return null;

  const metadataRoles = rolesFromMetadata(user.serverMetadata);
  const roles =
    metadataRoles && metadataRoles.length > 0
      ? metadataRoles
      : await getRolesByEmail(email);

  const demoUser = AUTH_DEMO_USERS.find((u) => u.email === email);
  const demoUserId =
    demoUserIdFromMetadata(user.serverMetadata) ??
    demoUser?.id ??
    resolveDemoUserId(email);

  return {
    user: {
      id: demoUserId ?? user.id,
      email,
      name: user.displayName ?? demoUser?.name ?? email,
      roles,
    },
  };
}
