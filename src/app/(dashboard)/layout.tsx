import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/permissions";
import { WebSidebar } from "@/components/layout/web-sidebar";

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
    <div className="flex min-h-screen bg-bone">
      <WebSidebar userName={session.user.name} userRoles={session.user.roles} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
