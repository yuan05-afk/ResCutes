import { requireAuth } from "@/lib/auth/session";
import { MobileAppShell } from "@/components/layout/MobileAppShell";
import { isAdministrator } from "@/lib/auth/permissions";

export default async function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <MobileAppShell isAdministrator={isAdministrator(session.user.roles)}>
      {children}
    </MobileAppShell>
  );
}
