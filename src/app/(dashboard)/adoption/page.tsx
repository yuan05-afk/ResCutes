import { requireAuth } from "@/lib/auth/session";
import {
  getAdoptionApplications,
  getAdoptionReadyAnimals,
} from "@/lib/data/service";
import { canManageCases, canManageSettings } from "@/lib/auth/permissions";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { AdoptionWorkspace } from "@/components/adoption/adoption-workspace";

export default async function AdoptionPage() {
  const session = await requireAuth();
  const [animals, applications] = await Promise.all([
    getAdoptionReadyAnimals(),
    getAdoptionApplications(),
  ]);

  const canManage =
    canManageCases(session.user.roles) ||
    canManageSettings(session.user.roles);

  return (
    <PageShell
      header={
        <DashboardHeader
          title="Adoption"
          subtitle={`${animals.length} ready · ${applications.length} applications`}
        />
      }
      fitViewport
    >
      <AdoptionWorkspace
        animals={animals}
        applications={applications}
        canManage={canManage}
      />
    </PageShell>
  );
}
