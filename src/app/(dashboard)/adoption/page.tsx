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

  const adoptionReady = animals.filter(
    (a) => a.pathwayStage === "ready_for_adoption",
  ).length;
  const fosterReady = animals.filter(
    (a) => a.pathwayStage === "ready_for_foster",
  ).length;

  return (
    <PageShell
      header={
        <DashboardHeader
          title="Adoption"
          subtitle={`${adoptionReady} adoption ready · ${fosterReady} foster ready · ${applications.length} applications`}
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
