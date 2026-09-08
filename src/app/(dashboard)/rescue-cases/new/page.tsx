import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/permissions";
import { getUserProfilePrefs } from "@/lib/data/user-profile";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { CreateRescueCaseForm } from "@/components/case/create-rescue-case-form";

export const metadata = {
  title: "New rescue case",
};

export default async function NewRescueCasePage() {
  const session = await requireRole([ROLES.SHELTER_STAFF, ROLES.ADMINISTRATOR]);
  const prefs = await getUserProfilePrefs(session.user.id);

  return (
    <PageShell
      header={
        <DashboardHeader
          title="New rescue case"
          subtitle="Staff-logged case for operations"
        />
      }
    >
      <CreateRescueCaseForm initialPhone={prefs.phone ?? ""} />
    </PageShell>
  );
}
