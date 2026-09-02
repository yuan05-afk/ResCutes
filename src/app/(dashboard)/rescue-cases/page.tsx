import {
  getRescueCasesListCached,
  getRescuersCached,
} from "@/lib/data/cached-loaders";
import { resolveCurrentUrgency } from "@/lib/data/service";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import Link from "next/link";
import { RescueCasesFilters } from "./filters";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";

export default async function RescueCasesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    urgency?: string;
    rescuer?: string;
    shelter?: string;
    search?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const filtersKey = JSON.stringify({
    status: params.status,
    urgencyLevel: params.urgency,
    rescuerId: params.rescuer,
    shelterId: params.shelter,
    search: params.search,
    sortBy: (params.sort as "urgency" | "waiting" | "date") ?? "date",
  });

  const [cases, rescuers] = await Promise.all([
    getRescueCasesListCached(filtersKey),
    getRescuersCached(),
  ]);

  return (
    <PageShell>
      <DashboardHeader
        title="Rescue Cases"
        subtitle={`${cases.length} case${cases.length !== 1 ? "s" : ""} in system`}
      />

      <RescueCasesFilters rescuers={rescuers} />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage/20 bg-bone/40 text-left text-xs font-medium uppercase tracking-wide text-graphite/55">
                  <th className="px-5 py-3.5">Case</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Urgency</th>
                  <th className="px-5 py-3.5">Species</th>
                  <th className="px-5 py-3.5">Reporter</th>
                  <th className="px-5 py-3.5">Description</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => {
                  const urgency = resolveCurrentUrgency(c);
                  return (
                  <tr
                    key={c.id}
                    className="border-b border-sage/15 last:border-0 hover:bg-bone/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/rescue-cases/${c.id}`}
                        className="font-semibold text-evergreen hover:underline"
                      >
                        {c.caseNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-4">
                      {urgency.score > 0 ? (
                        <UrgencyBadge level={urgency.level} score={urgency.score} />
                      ) : (
                        <span className="text-graphite/40">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 capitalize text-graphite/80">{c.species}</td>
                    <td className="px-5 py-4 text-graphite/80">{c.reporterName}</td>
                    <td className="px-5 py-4 max-w-xs truncate text-graphite/60">
                      {c.description}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
