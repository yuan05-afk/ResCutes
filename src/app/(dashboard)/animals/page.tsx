import { getAnimalsListCached } from "@/lib/data/cached-loaders";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";
import { AnimalsTable } from "@/components/admin/AnimalsTable";

export default async function AnimalsPage() {
  const animals = await getAnimalsListCached();

  return (
    <PageShell
      header={
        <DashboardHeader
          title="Animals"
          subtitle={`${animals.length} animals in system`}
        />
      }
      fitViewport
    >
      <AnimalsTable animals={animals} />
    </PageShell>
  );
}
