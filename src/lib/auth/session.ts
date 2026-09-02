import { redirect } from "next/navigation";
import type { Role } from "@/lib/auth/permissions";
import { getAppSession } from "@/lib/auth/stack-session";
import type { AppSession } from "@/lib/auth/types";

export async function requireAuth(): Promise<AppSession> {
  const session = await getAppSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(roles: Role[]): Promise<AppSession> {
  const session = await requireAuth();
  const hasRole = roles.some((r) => session.user.roles.includes(r));
  if (!hasRole) {
    redirect("/unauthorized");
  }
  return session;
}

export async function getSession(): Promise<AppSession | null> {
  return getAppSession();
}
