import { cache } from "react";
import "server-only";

import { neonAuth } from "@/lib/auth/server";
import { getRolesByEmail } from "@/lib/auth/user-roles";
import { fetchUserByEmail } from "@/lib/data/db/repository";
import type { AppSession } from "@/lib/auth/types";

function isRscCookieMutationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("Cookies can only be modified");
}

export const getAppSession = cache(async function getAppSession(): Promise<AppSession | null> {
  let session: Awaited<ReturnType<typeof neonAuth.getSession>>["data"] = null;
  try {
    const result = await neonAuth.getSession();
    session = result.data;
  } catch (error) {
    // Neon Auth may try to refresh cookies during getSession(). That is legal in
    // middleware / route handlers, but throws in RSC render. Middleware should
    // refresh first; if we still hit this, fail soft instead of crashing the page.
    if (isRscCookieMutationError(error)) {
      return null;
    }
    throw error;
  }

  const email = session?.user?.email?.trim().toLowerCase();
  if (!session?.user || !email) return null;

  const [roles, appUser] = await Promise.all([
    getRolesByEmail(email),
    fetchUserByEmail(email),
  ]);

  return {
    user: {
      id: appUser?.id ?? session.user.id,
      email,
      name: appUser?.name ?? session.user.name ?? email,
      roles,
    },
  };
});
