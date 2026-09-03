import { cache } from "react";
import "server-only";

import { neonAuth } from "@/lib/auth/server";
import { getRolesByEmail } from "@/lib/auth/user-roles";
import { fetchUserByEmail } from "@/lib/data/db/repository";
import type { AppSession } from "@/lib/auth/types";

export const getAppSession = cache(async function getAppSession(): Promise<AppSession | null> {
  const { data: session } = await neonAuth.getSession();
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
