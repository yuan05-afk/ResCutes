import { cache } from "react";
import "server-only";

import { neonAuth } from "@/lib/auth/server";
import { AUTH_DEMO_USERS } from "@/lib/auth/demo-users";
import { getRolesByEmail, resolveDemoUserId } from "@/lib/auth/user-roles";
import type { AppSession } from "@/lib/auth/types";

export const getAppSession = cache(async function getAppSession(): Promise<AppSession | null> {
  const { data: session } = await neonAuth.getSession();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!session?.user || !email) return null;

  const roles = await getRolesByEmail(email);
  const demoUser = AUTH_DEMO_USERS.find((u) => u.email === email);

  return {
    user: {
      id: demoUser?.id ?? resolveDemoUserId(email) ?? session.user.id,
      email,
      name: session.user.name ?? demoUser?.name ?? email,
      roles,
    },
  };
});
