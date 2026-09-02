import { getSheltersCached } from "@/lib/data/cached-loaders";
import { requireAuth } from "@/lib/auth/session";
import { canManageSettings } from "@/lib/auth/permissions";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { ShelterSettingsWorkspace } from "@/components/settings/shelter-settings-workspace";

export default async function SettingsPage() {
  const [shelters, session] = await Promise.all([
    getSheltersCached(),
    requireAuth(),
  ]);

  const canEdit = canManageSettings(session.user.roles);

  return (
    <PageShell
      header={
        <DashboardHeader
          title="Shelter Settings"
          subtitle="Manage capacity and medical capabilities for each location"
        />
      }
      fitViewport
    >
      <ShelterSettingsWorkspace
        shelters={shelters}
        canEdit={canEdit}
      />
    </PageShell>
  );
}
