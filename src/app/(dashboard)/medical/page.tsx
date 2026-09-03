import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/session";
import { getMedicalQueue } from "@/lib/data/service";
import {
  canEditMedical,
  canViewMedicalNotes,
} from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { MedicalWorkspace } from "@/components/medical/medical-workspace";
import { PageSkeleton } from "@/components/shared/PageSkeleton";

export default async function MedicalPage() {
  const session = await requireAuth();
  if (!canViewMedicalNotes(session.user.roles)) {
    redirect("/unauthorized");
  }

  const items = await getMedicalQueue();
  const canEdit = canEditMedical(session.user.roles);
  const activeCount = items.filter(
    (i) => i.animal.clearanceStatus !== "medically_cleared",
  ).length;

  return (
    <PageShell
      header={
        <DashboardHeader
          title="Medical Clearance"
          subtitle={`${activeCount} in care · ${items.length} on medical pathway`}
        />
      }
      fitViewport
    >
      <Suspense fallback={<PageSkeleton />}>
        <MedicalWorkspace items={items} canEdit={canEdit} />
      </Suspense>
    </PageShell>
  );
}
