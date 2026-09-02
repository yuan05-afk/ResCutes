import { revalidatePath, revalidateTag } from "next/cache";
import { rolesTag } from "@/lib/auth/user-roles";

export function dashboardTag(userId: string) {
  return `dashboard:${userId}`;
}

export function revalidateApp(paths: string[]) {
  for (const p of paths) {
    revalidatePath(p, "page");
    revalidatePath(p, "layout");
  }
}

export function revalidateUserRoles(email: string) {
  revalidateTag(rolesTag(email));
}

export function revalidateDashboard(userId: string) {
  revalidateTag(dashboardTag(userId));
}

/** Invalidate dashboard + listed routes after rescue mutations. */
export function revalidateRescueData(
  userId: string,
  paths: string[],
  email?: string,
) {
  revalidateDashboard(userId);
  if (email) revalidateUserRoles(email);
  revalidateApp(paths);
}
