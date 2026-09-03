import { getAnimalsListCached } from "@/lib/data/cached-loaders";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { AnimalsTable } from "@/components/admin/AnimalsTable";
import { requireAuth } from "@/lib/auth/session";
import { canManageCases, canManageSettings } from "@/lib/auth/permissions";

export default async function AnimalsPage() {
  const session = await requireAuth();
  const animals = await getAnimalsListCached();
  const canManage =
    canManageCases(session.user.roles) ||
    canManageSettings(session.user.roles);

  return (
    <PageShell
      header={
        <DashboardHeader
          title="Animals"
          subtitle={`${animals.length} animals in system`}
        />
      }
      fitViewport
    >
      <AnimalsTable animals={animals} canManage={canManage} />
    </PageShell>
  );
}
