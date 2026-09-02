import { cache } from "react";
import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db";
import { users } from "@/db/schema";
import { AUTH_DEMO_USERS } from "@/lib/auth/demo-users";
import type { Role } from "@/lib/auth/permissions";

export function rolesTag(email: string) {
  return `roles:${email.trim().toLowerCase()}`;
}

function rolesFromDemoStore(email: string): Role[] {
  const normalized = email.trim().toLowerCase();
  const demo = AUTH_DEMO_USERS.find((u) => u.email === normalized);
  return demo?.roles ?? [];
}

async function loadRolesFromDb(email: string): Promise<Role[]> {
  const normalized = email.trim().toLowerCase();
  const db = getDb();
  const row = await db.query.users.findFirst({
    where: eq(users.email, normalized),
    columns: { id: true },
    with: { roles: { columns: { role: true } } },
  });
  if (!row?.roles.length) return rolesFromDemoStore(normalized);
  return row.roles.map((r) => r.role);
}

export const getRolesByEmail = cache(async (email: string): Promise<Role[]> => {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];

  if (!isDbConfigured()) {
    return rolesFromDemoStore(normalized);
  }

  return unstable_cache(
    () => loadRolesFromDb(normalized),
    ["roles-by-email", normalized],
    { revalidate: 300, tags: [rolesTag(normalized)] },
  )();
});

export function resolveDemoUserId(email: string): string | undefined {
  const normalized = email.trim().toLowerCase();
  return AUTH_DEMO_USERS.find((u) => u.email === normalized)?.id;
}
