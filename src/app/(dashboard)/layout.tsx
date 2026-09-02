import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/permissions";
import { AppShell } from "@/components/layout/AppShell";

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
    >
      {children}
    </AppShell>
  );
}
