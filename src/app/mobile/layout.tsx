import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import {
  canAccessMobileApp,
  getHomePathForRoles,
} from "@/lib/auth/permissions";
import { MobileAppShell } from "@/components/layout/MobileAppShell";

export const dynamic = "force-dynamic";

export default async function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth("/mobile");
  if (!canAccessMobileApp(session.user.roles)) {
    redirect(getHomePathForRoles(session.user.roles));
  }
  return <MobileAppShell>{children}</MobileAppShell>;
}
