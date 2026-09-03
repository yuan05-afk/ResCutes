import { requireAuth } from "@/lib/auth/session";
import { getUserProfilePrefs } from "@/lib/data/user-profile";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";

export default async function ProfilePage() {
  const session = await requireAuth();
  const prefs = await getUserProfilePrefs(session.user.id);

  return (
    <PageShell
      header={
        <DashboardHeader
          title="My Profile"
          subtitle="Manage your account details and notification preferences"
        />
      }
      fitViewport
    >
      <ProfileSettingsForm user={session.user} prefs={prefs} />
    </PageShell>
  );
}
