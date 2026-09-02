import { getAnimalById, resolveCurrentUrgency } from "@/lib/data/service";
import {
  getDashboardMapCasesCached,
  getDashboardMetricsCached,
} from "@/lib/data/cached-loaders";
import {
  DashboardHeader,
  PageShell,
} from "@/components/layout/dashboard-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CapacityRing } from "@/components/ui/capacity-ring";
import { DashboardInteractiveSections } from "@/components/dashboard/dashboard-interactive-sections";
import {
  Activity,
  AlertCircle,
  PawPrint,
  Stethoscope,
} from "lucide-react";

export default async function DashboardPage() {
  const [metrics, mapCases] = await Promise.all([
    getDashboardMetricsCached(),
    getDashboardMapCasesCached(),
  ]);

  const capacityPct = Math.round(
    (metrics.capacityUsed / metrics.capacityTotal) * 100,
  );
  const capacityAvailable = metrics.capacityTotal - metrics.capacityUsed;
  const dateLabel = new Date().toLocaleDateString("en-SG", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const criticalCases = metrics.criticalCases.map((c) => {
    const animal = c.animalId ? getAnimalById(c.animalId) : null;
    const urgency = resolveCurrentUrgency(c);
    return {
      id: c.id,
      caseNumber: c.caseNumber,
      species: c.species,
      urgencyLevel: urgency.level,
      urgencyScore: urgency.score,
      description: c.description,
      photoUrl: c.photoUrl,
      animalName: animal?.name,
    };
  });

  return (
    <PageShell
      header={
        <DashboardHeader title="Operations Overview" subtitle={dateLabel} />
      }
      className="gap-3"
    >
      <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Shelter Capacity"
          value={`${metrics.capacityUsed} / ${metrics.capacityTotal}`}
          icon={PawPrint}
          detail={`${capacityAvailable} spaces · ${metrics.underTreatment} in treatment`}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <CapacityRing percentage={capacityPct} size={40} />
              <span className="absolute text-[10px] font-bold text-graphite">
                {capacityPct}%
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <ProgressBar
                value={metrics.capacityUsed}
                max={metrics.capacityTotal}
              />
            </div>
          </div>
        </KpiCard>

        <KpiCard
          label="Active Rescue Cases"
          value={metrics.activeCases}
          icon={Activity}
          href="/rescue-cases"
          hrefLabel="View all →"
          detail={`${metrics.unassigned} unassigned`}
        />

        <KpiCard
          label="Attention Needed"
          value={metrics.criticalHigh}
          icon={AlertCircle}
          href="/rescue-cases"
          hrefLabel="View queue →"
        />

        <KpiCard
          label="Awaiting Examination"
          value={metrics.awaitingMedical}
          icon={Stethoscope}
          href="/animals"
          hrefLabel="View animals →"
        />
      </div>

      <DashboardInteractiveSections
        mapCases={mapCases.map((c) => ({
          id: c.id,
          latitude: c.latitude,
          longitude: c.longitude,
          caseNumber: c.caseNumber,
          urgencyLevel: resolveCurrentUrgency(c).level,
        }))}
        criticalCases={criticalCases}
        waitingForRescuer={metrics.waitingForRescuer}
      />
    </PageShell>
  );
}
