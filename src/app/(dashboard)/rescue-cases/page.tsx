import { Suspense } from "react";
import { getRescueCasesListCached, getRescuersCached } from "@/lib/data/cached-loaders";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { RescueCasesTable } from "@/components/admin/RescueCasesTable";

export default async function RescueCasesPage() {
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
        />
      }
    >
      <Suspense fallback={null}>
        <RescueCasesTable cases={cases} rescuers={rescuers} />
      </Suspense>
    </PageShell>
  );
}
