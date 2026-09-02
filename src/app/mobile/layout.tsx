import { requireAuth } from "@/lib/auth/session";
import { MobileAppShell } from "@/components/layout/MobileAppShell";

export default async function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <MobileAppShell>{children}</MobileAppShell>;
}
