import { getDashboardMetrics, getCases, getAnimalById, resolveCurrentUrgency } from "@/lib/data/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { StatusBadge } from "@/components/status/status-badge";
import Link from "next/link";
import { DashboardMapClient } from "./dashboard-map";
import {
  DashboardHeader,
  PageShell,
} from "@/components/layout/dashboard-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CapacityRing } from "@/components/ui/capacity-ring";
import { AttentionQueueItem } from "@/components/dashboard/attention-queue-item";
import {
  Activity,
  AlertCircle,
  PawPrint,
  Stethoscope,
} from "lucide-react";

export default function DashboardPage() {
  const metrics = getDashboardMetrics();
  const mapCases = getCases({ sortBy: "urgency" })
    .filter(
      (c) =>
        !["completed", "rejected", "duplicate", "cancelled"].includes(c.status),
    )
    .slice(0, 10);

  const capacityPct = Math.round(
    (metrics.capacityUsed / metrics.capacityTotal) * 100,
  );
  const capacityAvailable = metrics.capacityTotal - metrics.capacityUsed;
  const dateLabel = new Date().toLocaleDateString("en-SG", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <PageShell>
      <DashboardHeader title="Operations Overview" subtitle={dateLabel} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Shelter Capacity"
          value={`${metrics.capacityUsed} / ${metrics.capacityTotal}`}
          icon={PawPrint}
          detail={`${capacityAvailable} spaces available`}
        >
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <CapacityRing percentage={capacityPct} size={52} />
              <span className="absolute text-xs font-bold text-graphite">
                {capacityPct}%
              </span>
            </div>
            <ProgressBar value={metrics.capacityUsed} max={metrics.capacityTotal} />
          </div>
        </KpiCard>

        <KpiCard
          label="Active Rescue Cases"
          value={metrics.activeCases}
          icon={Activity}
          href="/rescue-cases"
          hrefLabel="View all cases →"
        />

        <KpiCard
          label="Attention Needed"
          value={metrics.criticalHigh}
          icon={AlertCircle}
          href="/rescue-cases?urgency=critical"
          hrefLabel="View queue →"
        />

        <KpiCard
          label="Awaiting Examination"
          value={metrics.awaitingMedical}
          icon={Stethoscope}
          href="/animals?clearance=awaiting_examination"
          hrefLabel="View animals →"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader className="pb-3">
            <CardTitle>Live Rescue Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardMapClient cases={mapCases} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="pb-3">
            <CardTitle>Rescue Attention Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.criticalCases.length === 0 ? (
              <p className="text-sm text-graphite/60 py-4 text-center">
                No critical or high-urgency cases right now.
              </p>
            ) : (
              metrics.criticalCases.map((c) => {
                const animal = c.animalId ? getAnimalById(c.animalId) : null;
                const urgency = resolveCurrentUrgency(c);
                return (
                  <AttentionQueueItem
                    key={c.id}
                    id={c.id}
                    caseNumber={c.caseNumber}
                    species={c.species}
                    urgencyLevel={urgency.level}
                    urgencyScore={urgency.score}
                    description={c.description}
                    photoUrl={c.photoUrl}
                    animalName={animal?.name}
                  />
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Shelter Capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-graphite">
                  {metrics.capacityUsed}
                  <span className="text-lg font-normal text-graphite/50">
                    {" "}
                    / {metrics.capacityTotal}
                  </span>
                </p>
                <p className="text-sm text-graphite/60 mt-1">
                  {capacityAvailable} spaces available
                </p>
              </div>
              <p className="text-sm font-semibold text-evergreen">{capacityPct}% occupied</p>
            </div>
            <ProgressBar
              value={metrics.capacityUsed}
              max={metrics.capacityTotal}
              showLabel
            />
            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="rounded-xl bg-bone p-3">
                <p className="text-xs text-graphite/55">Under Treatment</p>
                <p className="text-lg font-bold text-graphite mt-1">
                  {metrics.underTreatment}
                </p>
              </div>
              <div className="rounded-xl bg-bone p-3">
                <p className="text-xs text-graphite/55">Unassigned</p>
                <p className="text-lg font-bold text-graphite mt-1">
                  {metrics.unassigned}
                </p>
              </div>
              <div className="rounded-xl bg-bone p-3">
                <p className="text-xs text-graphite/55">Completed</p>
                <p className="text-lg font-bold text-graphite mt-1">
                  {metrics.completed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Cases Waiting for Rescuer</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sage/20 bg-bone/50 text-left text-xs font-medium uppercase tracking-wide text-graphite/55">
                    <th className="px-5 py-3">Case</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Urgency</th>
                    <th className="px-5 py-3">Species</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.waitingForRescuer.slice(0, 6).map((c) => {
                    const urgency = resolveCurrentUrgency(c);
                    return (
                    <tr
                      key={c.id}
                      className="border-b border-sage/15 last:border-0 hover:bg-bone/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/rescue-cases/${c.id}`}
                          className="font-semibold text-evergreen hover:underline"
                        >
                          {c.caseNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        {urgency.score > 0 ? (
                          <UrgencyBadge
                            level={urgency.level}
                            score={urgency.score}
                          />
                        ) : (
                          <span className="text-graphite/40">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 capitalize text-graphite/80">
                        {c.species}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
