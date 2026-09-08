import { getAnimalsListCached } from "@/lib/data/cached-loaders";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { AnimalsTable } from "@/components/admin/AnimalsTable";
import { requireAuth } from "@/lib/auth/session";
import { canManageCases, canManageSettings } from "@/lib/auth/permissions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
        >
          {canManage ? (
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/animals/new">
                <Plus className="h-4 w-4" aria-hidden />
                New animal
              </Link>
            </Button>
          ) : null}
        </DashboardHeader>
      }
      fitViewport
    >
      <AnimalsTable animals={animals} canManage={canManage} />
    </PageShell>
  );
}
