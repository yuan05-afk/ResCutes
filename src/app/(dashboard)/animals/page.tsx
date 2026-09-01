import { getAnimals } from "@/lib/data/service";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import Link from "next/link";
import Image from "next/image";
import { formatDate, formatStatus } from "@/lib/utils";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { DashboardHeader, PageShell } from "@/components/layout/dashboard-header";

export default async function AnimalsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; clearance?: string }>;
}) {
  const params = await searchParams;
  const animals = getAnimals({
    search: params.search,
    clearanceStatus: params.clearance,
  });

  return (
    <PageShell>
      <DashboardHeader
        title="Animals"
        subtitle={`${animals.length} animal${animals.length !== 1 ? "s" : ""} in system`}
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage/20 bg-bone/40 text-left text-xs font-medium uppercase tracking-wide text-graphite/55">
                  <th className="px-5 py-3.5">Animal</th>
                  <th className="px-5 py-3.5">Species</th>
                  <th className="px-5 py-3.5">Intake</th>
                  <th className="px-5 py-3.5">Medical Status</th>
                  <th className="px-5 py-3.5">Pathway</th>
                  <th className="px-5 py-3.5">Case</th>
                </tr>
              </thead>
              <tbody>
                {animals.map((a) => {
                  const img = getCasePhotoUrl(
                    a.species,
                    a.photoUrl,
                    a.rescueCaseId,
                  );
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-sage/15 last:border-0 hover:bg-bone/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/animals/${a.id}`}
                          className="flex items-center gap-3 hover:text-evergreen"
                        >
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-sage/20">
                            <Image
                              src={img}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                              sizes="44px"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-graphite">
                              {a.name ?? a.temporaryId}
                            </p>
                            <p className="text-xs text-graphite/50">{a.temporaryId}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-4 capitalize text-graphite/80">
                        {a.species}
                      </td>
                      <td className="px-5 py-4 text-graphite/70">
                        {formatDate(a.intakeDate)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={a.clearanceStatus} />
                      </td>
                      <td className="px-5 py-4 capitalize text-graphite/70">
                        {formatStatus(a.pathwayStage)}
                      </td>
                      <td className="px-5 py-4">
                        {a.rescueCaseId ? (
                          <Link
                            href={`/rescue-cases/${a.rescueCaseId}`}
                            className="text-evergreen hover:underline text-sm font-medium"
                          >
                            View case
                          </Link>
                        ) : (
                          "—"
                        )}
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
