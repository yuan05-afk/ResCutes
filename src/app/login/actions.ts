"use server";

import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/server";
import { DEMO_ACCOUNTS, ROLES, canAccessDashboard } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/permissions";

function defaultPathForRoles(roles: Role[]): string {
  if (canAccessDashboard(roles)) return "/dashboard";
  if (roles.includes(ROLES.RESCUER) || roles.includes(ROLES.CITIZEN)) return "/mobile";
  return "/";
}

function rolesForEmail(email: string): Role[] {
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email === email.trim().toLowerCase(),
  );
  return account ? [account.role] : [];
}

export async function signInAction(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await neonAuth.signIn.email({ email, password });

  if (error) {
    return {
      error: "Invalid email or password. Use demo1234 for seeded demo accounts.",
    };
  }

  const destination =
    callbackUrl && callbackUrl !== "/login"
      ? callbackUrl
      : defaultPathForRoles(rolesForEmail(email));

  redirect(destination);
}
