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

export default async function DashboardPage() {
  const [metrics, mapCases] = await Promise.all([
    getDashboardMetricsCached(),
    getDashboardMapCasesCached(),
  ]);

  const capacityPct = Math.round(
    (metrics.capacityUsed / metrics.capacityTotal) * 100,
  );
  const capacityAvailable = metrics.capacityTotal - metrics.capacityUsed;
  const assignmentPct =
    metrics.activeCases > 0
      ? Math.round((metrics.assignedCases / metrics.activeCases) * 100)
      : 0;
  const priorityPct =
    metrics.activeCases > 0
      ? Math.round((metrics.criticalHigh / metrics.activeCases) * 100)
      : 0;
  const dateLabel = new Date().toLocaleDateString("en-SG", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const criticalCases = await Promise.all(
    metrics.criticalCases.map(async (c) => {
      const animal = c.animalId ? await getAnimalById(c.animalId) : null;
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
    }),
  );

  return (
    <PageShell
      header={
        <DashboardHeader title="Operations Overview" subtitle={dateLabel} />
      }
      className="flex min-h-0 flex-1 flex-col gap-3 lg:overflow-hidden"
      fitViewport
    >
      <div className="grid shrink-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Shelter Capacity"
          value={`${metrics.capacityUsed} / ${metrics.capacityTotal}`}
          icon="paw"
          accent="sage"
          href="/settings"
          hrefLabel="Manage capacity"
          detail={`${capacityAvailable} spaces available · ${metrics.underTreatment} in treatment`}
        >
          <div className="flex items-center gap-3 rounded-lg bg-bone/60 px-3 py-2.5">
            <div className="relative flex shrink-0 items-center justify-center">
              <CapacityRing percentage={capacityPct} size={44} />
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
          icon="activity"
          accent="evergreen"
          href="/rescue-cases"
          hrefLabel="View all cases"
          detail={`${metrics.assignedCases} assigned · ${metrics.unassigned} unassigned`}
        >
          <div className="space-y-2 rounded-lg bg-bone/60 px-3 py-2.5">
            <div className="flex items-center justify-between text-[10px] font-medium text-graphite/55">
              <span>Assignment coverage</span>
              <span>{assignmentPct}%</span>
            </div>
            <ProgressBar
              value={metrics.assignedCases}
              max={Math.max(metrics.activeCases, 1)}
            />
            <p className="text-[10px] leading-snug text-graphite/50">
              {metrics.unassigned > 0
                ? `${metrics.unassigned} case${metrics.unassigned === 1 ? "" : "s"} still need a rescuer`
                : "All active cases have a rescuer assigned"}
            </p>
          </div>
        </KpiCard>

        <KpiCard
          label="Attention Needed"
          value={metrics.criticalHigh}
          icon="alert"
          accent="rescue"
          href="/rescue-cases"
          hrefLabel="View priority queue"
          detail={`${metrics.criticalCount} critical · ${metrics.highCount} high priority`}
        >
          <div className="space-y-2 rounded-lg bg-bone/60 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2 text-[10px] font-medium">
              <span className="inline-flex items-center gap-1 text-rescue">
                <span className="h-1.5 w-1.5 rounded-full bg-rescue" aria-hidden />
                Critical {metrics.criticalCount}
              </span>
              <span className="inline-flex items-center gap-1 text-ochre">
                <span className="h-1.5 w-1.5 rounded-full bg-ochre" aria-hidden />
                High {metrics.highCount}
              </span>
            </div>
            <ProgressBar
              value={metrics.criticalHigh}
              max={Math.max(metrics.activeCases, 1)}
              barClassName="bg-rescue"
            />
            <p className="text-[10px] leading-snug text-graphite/50">
              {priorityPct}% of active cases need urgent review
            </p>
          </div>
        </KpiCard>

        <KpiCard
          label="Awaiting Examination"
          value={metrics.awaitingMedical}
          icon="stethoscope"
          accent="ochre"
          href="/medical"
          hrefLabel="View animals"
          detail={`${metrics.underTreatment} currently in treatment`}
        >
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-bone/60 px-3 py-2.5">
            <div className="text-center">
              <p className="text-sm font-bold text-graphite">{metrics.awaitingExam}</p>
              <p className="text-[9px] font-medium leading-tight text-graphite/50">
                Awaiting
              </p>
            </div>
            <div className="border-x border-sage/20 text-center">
              <p className="text-sm font-bold text-graphite">{metrics.underExam}</p>
              <p className="text-[9px] font-medium leading-tight text-graphite/50">
                In exam
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-graphite">
                {metrics.followUpRequired}
              </p>
              <p className="text-[9px] font-medium leading-tight text-graphite/50">
                Follow-up
              </p>
            </div>
          </div>
        </KpiCard>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:overflow-hidden">
        <DashboardInteractiveSections
          mapCases={mapCases.map((c) => ({
            id: c.id,
            latitude: c.latitude,
            longitude: c.longitude,
            caseNumber: c.caseNumber,
            species: c.species,
            status: c.status,
            urgencyLevel: resolveCurrentUrgency(c).level,
          }))}
          criticalCases={criticalCases}
          waitingForRescuer={metrics.waitingForRescuer}
        />
      </div>
    </PageShell>
  );
}
