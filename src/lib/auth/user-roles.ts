import { cache } from "react";
import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { userIdForEmail } from "@/db/stable-ids";
import type { Role } from "@/lib/auth/permissions";

export function rolesTag(email: string) {
  return `roles:${email.trim().toLowerCase()}`;
}

async function loadRolesFromDb(email: string): Promise<Role[]> {
  const normalized = email.trim().toLowerCase();
  const db = getDb();
  const row = await db.query.users.findFirst({
    where: eq(users.email, normalized),
    columns: { id: true },
    with: { roles: { columns: { role: true } } },
  });
  if (!row?.roles.length) return [];
  return row.roles.map((r) => r.role);
}

export const getRolesByEmail = cache(async (email: string): Promise<Role[]> => {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];

  return unstable_cache(
    () => loadRolesFromDb(normalized),
    ["roles-by-email", normalized],
    { revalidate: 300, tags: [rolesTag(normalized)] },
  )();
});

export function resolveDemoUserId(email: string): string {
  return userIdForEmail(email);
}
