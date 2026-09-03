import { Suspense } from "react";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/permissions";
import { AppShell } from "@/components/layout/AppShell";
import { NotificationBellServer } from "@/components/notifications/NotificationBellServer";
import { NotificationBellFallback } from "@/components/notifications/NotificationBellClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole([
    ROLES.SHELTER_STAFF,
    ROLES.VETERINARIAN,
    ROLES.ADMINISTRATOR,
  ]);

  return (
    <AppShell
      userName={session.user.name}
      userEmail={session.user.email}
      userRoles={session.user.roles}
      notificationSlot={
        <Suspense fallback={<NotificationBellFallback />}>
          <NotificationBellServer userId={session.user.id} />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
