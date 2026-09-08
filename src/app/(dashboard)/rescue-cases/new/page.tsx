import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/permissions";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { CreateRescueCaseForm } from "@/components/case/create-rescue-case-form";

export const metadata = {
  title: "New rescue case",
};

export default async function NewRescueCasePage() {
  await requireRole([ROLES.SHELTER_STAFF, ROLES.ADMINISTRATOR]);

  return (
    <PageShell
      header={
        <DashboardHeader
          title="New rescue case"
          subtitle="Staff-logged case for operations"
        />
      }
    >
      <CreateRescueCaseForm />
    </PageShell>
  );
}
