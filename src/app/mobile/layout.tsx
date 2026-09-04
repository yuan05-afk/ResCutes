import { requireAuth } from "@/lib/auth/session";
import { MobileAppShell } from "@/components/layout/MobileAppShell";

export const dynamic = "force-dynamic";

export default async function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("/mobile");
  return <MobileAppShell>{children}</MobileAppShell>;
}
