import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getRescueCasesListCached, getRescuersCached } from "@/lib/data/cached-loaders";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { RescueCasesTable } from "@/components/admin/RescueCasesTable";
import { requireAuth } from "@/lib/auth/session";
import { canManageCases } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";

export default async function RescueCasesPage() {
  const session = await requireAuth();
  const canManage = canManageCases(session.user.roles);
  const [cases, rescuers] = await Promise.all([
    getRescueCasesListCached(JSON.stringify({})),
    getRescuersCached(),
  ]);

  return (
    <PageShell
      header={
        <DashboardHeader
          title="Rescue Cases"
          subtitle={`${cases.length} cases in system`}
        >
          {canManage ? (
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/rescue-cases/new">
                <Plus className="h-4 w-4" aria-hidden />
                New case
              </Link>
            </Button>
          ) : null}
        </DashboardHeader>
      }
      fitViewport
    >
      <Suspense fallback={null}>
        <RescueCasesTable cases={cases} rescuers={rescuers} />
      </Suspense>
    </PageShell>
  );
}
