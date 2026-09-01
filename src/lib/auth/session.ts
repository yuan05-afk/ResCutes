import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/auth/permissions";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireAuth();
  const userRoles = session.user.roles;
  const hasRole = roles.some((r) => userRoles.includes(r));
  if (!hasRole) {
    redirect("/unauthorized");
  }
  return session;
}

export async function getSession() {
  return await auth();
}
