import { requireRole } from "@/lib/auth/session";
import { ROLES, canManageCases, canManageSettings } from "@/lib/auth/permissions";
import { getShelters } from "@/lib/data/service";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { CreateAnimalForm } from "@/components/animals/create-animal-form";
import { redirect } from "next/navigation";

export const metadata = {
  title: "New animal",
};

export default async function NewAnimalPage() {
  const session = await requireRole([
    ROLES.SHELTER_STAFF,
    ROLES.ADMINISTRATOR,
  ]);
  const canManage =
    canManageCases(session.user.roles) ||
    canManageSettings(session.user.roles);
  if (!canManage) redirect("/animals");

  const shelters = await getShelters();

  return (
    <PageShell
      header={
        <DashboardHeader
          title="New animal"
          subtitle="Manual intake without a rescue case"
        />
      }
    >
      <CreateAnimalForm
        shelters={shelters.map((s) => ({ id: s.id, name: s.name }))}
      />
    </PageShell>
  );
}
