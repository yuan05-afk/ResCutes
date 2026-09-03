"use client";

import { useMemo, useState } from "react";
import { ModalTabs } from "@/components/admin/AdminModal";
import { AdoptionAnimalCard } from "@/components/adoption/adoption-animal-card";
import { AdoptionApplicationForm } from "@/components/adoption/adoption-application-form";
import { AdoptionReviewActions } from "@/components/adoption/adoption-review-actions";
import { StatusBadge } from "@/components/status/status-badge";
import { ToastViewport } from "@/components/ui/toast";
import { formatDateTime, formatStatus } from "@/lib/utils";
import type {
  AdoptionApplicationRecord,
  AnimalRecord,
} from "@/lib/data/types";

interface AdoptionWorkspaceProps {
  animals: AnimalRecord[];
  applications: AdoptionApplicationRecord[];
  canManage: boolean;
}

type TabId = "animals" | "applications";

export function AdoptionWorkspace({
  animals,
  applications,
  canManage,
}: AdoptionWorkspaceProps) {
  const [tab, setTab] = useState<TabId>("animals");
  const [applyAnimal, setApplyAnimal] = useState<AnimalRecord | null>(null);

  const pendingCount = useMemo(
    () =>
      applications.filter(
        (a) => a.status === "pending" || a.status === "under_review",
      ).length,
    [applications],
  );

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <ModalTabs
          tabs={[
            { id: "animals", label: `Available animals (${animals.length})` },
            {
              id: "applications",
              label: `Applications (${applications.length}${pendingCount ? ` · ${pendingCount} open` : ""})`,
            },
          ]}
          active={tab}
          onChange={(id) => setTab(id as TabId)}
        />

        {tab === "animals" ? (
          animals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage/35 bg-white px-4 py-10 text-center text-sm text-graphite/55">
              No animals are currently ready for adoption or foster.
            </div>
          ) : (
            <div className="rc-scroll grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              {animals.map((animal) => (
                <AdoptionAnimalCard
                  key={animal.id}
                  animal={animal}
                  canApply={canManage}
                  onApply={setApplyAnimal}
                />
              ))}
            </div>
          )
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sage/35 bg-white px-4 py-10 text-center text-sm text-graphite/55">
            No adoption applications yet.
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card lg:min-h-0 lg:flex-1">
            <div className="rc-scroll overflow-x-auto lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="sticky top-0 z-10 bg-bone/95 backdrop-blur-sm">
                  <tr className="border-b border-sage/20 text-left text-[10px] font-semibold uppercase tracking-wide text-graphite/50">
                    <th className="px-4 py-2.5">Applicant</th>
                    <th className="px-4 py-2.5">Animal</th>
                    <th className="px-4 py-2.5">Home</th>
                    <th className="px-4 py-2.5">Submitted</th>
                    <th className="px-4 py-2.5">Status</th>
                    {canManage ? <th className="px-4 py-2.5">Review</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-sage/10 align-top last:border-0"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-graphite">
                          {app.applicantName}
                        </p>
                        <p className="text-[11px] text-graphite/50">
                          {app.applicantEmail}
                        </p>
                        {app.applicantPhone ? (
                          <p className="text-[11px] text-graphite/45">
                            {app.applicantPhone}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-graphite">
                          {app.animalName ?? app.animalTemporaryId ?? "Animal"}
                        </p>
                        <p className="text-[11px] capitalize text-graphite/50">
                          {app.animalSpecies
                            ? formatStatus(app.animalSpecies)
                            : "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-graphite/70">
                        <p className="capitalize">{app.homeType}</p>
                        <p className="text-[11px] text-graphite/45">
                          {app.householdSize} in home
                          {app.hasYard ? " · yard" : ""}
                          {app.hasOtherPets ? " · other pets" : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-graphite/65">
                        {formatDateTime(app.submittedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      {canManage ? (
                        <td className="px-4 py-3">
                          <AdoptionReviewActions
                            applicationId={app.id}
                            applicantName={app.applicantName}
                            animalLabel={
                              app.animalName ??
                              app.animalTemporaryId ??
                              "this animal"
                            }
                            status={app.status}
                          />
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AdoptionApplicationForm
        open={Boolean(applyAnimal)}
        animal={applyAnimal}
        onClose={() => setApplyAnimal(null)}
      />
      <ToastViewport />
    </>
  );
}
