"use client";

import { useMemo, useState } from "react";
import { ModalTabs } from "@/components/admin/AdminModal";
import { AdoptionAnimalCard } from "@/components/adoption/adoption-animal-card";
import { AdoptionApplicationForm } from "@/components/adoption/adoption-application-form";
import { AdoptionApplicationDetailModal } from "@/components/adoption/adoption-application-detail-modal";
import { AnimalImage } from "@/components/ui/animal-image";
import { StatusBadge } from "@/components/status/status-badge";
import { ToastViewport } from "@/components/ui/toast";
import {
  ClickableRow,
  stopRowClick,
  tableTdClass,
  tableThClass,
} from "@/components/admin/ClickableTable";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { formatDateTime, formatStatus, cn } from "@/lib/utils";
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
type PathwayFilter = "all" | "ready_for_adoption" | "ready_for_foster";

export function AdoptionWorkspace({
  animals,
  applications,
  canManage,
}: AdoptionWorkspaceProps) {
  const [tab, setTab] = useState<TabId>("animals");
  const [pathwayFilter, setPathwayFilter] = useState<PathwayFilter>("all");
  const [applyAnimal, setApplyAnimal] = useState<AnimalRecord | null>(null);
  const [openAppId, setOpenAppId] = useState<string | null>(null);

  const pendingCount = useMemo(
    () =>
      applications.filter(
        (a) => a.status === "pending" || a.status === "under_review",
      ).length,
    [applications],
  );

  const adoptionReadyCount = useMemo(
    () => animals.filter((a) => a.pathwayStage === "ready_for_adoption").length,
    [animals],
  );
  const fosterReadyCount = useMemo(
    () => animals.filter((a) => a.pathwayStage === "ready_for_foster").length,
    [animals],
  );

  const filteredAnimals = useMemo(() => {
    if (pathwayFilter === "all") return animals;
    return animals.filter((a) => a.pathwayStage === pathwayFilter);
  }, [animals, pathwayFilter]);

  const openApplication =
    applications.find((a) => a.id === openAppId) ?? null;

  const emptyAnimalsCopy =
    pathwayFilter === "ready_for_adoption"
      ? "No animals are currently adoption ready."
      : pathwayFilter === "ready_for_foster"
        ? "No animals are currently foster ready."
        : "No animals are currently ready for adoption or foster.";

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
          <>
            <div
              className="flex shrink-0 flex-wrap gap-1.5"
              role="group"
              aria-label="Filter by placement pathway"
            >
              {(
                [
                  {
                    id: "all" as const,
                    label: `All (${animals.length})`,
                  },
                  {
                    id: "ready_for_adoption" as const,
                    label: `Adoption ready (${adoptionReadyCount})`,
                  },
                  {
                    id: "ready_for_foster" as const,
                    label: `Foster ready (${fosterReadyCount})`,
                  },
                ] as const
              ).map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setPathwayFilter(filter.id)}
                  aria-pressed={pathwayFilter === filter.id}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen/40",
                    pathwayFilter === filter.id
                      ? "bg-evergreen text-white"
                      : "border border-sage/25 bg-white text-graphite/60 hover:border-sage/40 hover:text-graphite",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {filteredAnimals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sage/35 bg-white px-4 py-10 text-center text-sm text-graphite/55">
                {emptyAnimalsCopy}
              </div>
            ) : (
              <div className="rc-scroll grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                {filteredAnimals.map((animal) => (
                  <AdoptionAnimalCard
                    key={animal.id}
                    animal={animal}
                    canApply={canManage}
                    onApply={setApplyAnimal}
                  />
                ))}
              </div>
            )}
          </>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sage/35 bg-white px-4 py-10 text-center text-sm text-graphite/55">
            No adoption applications yet.
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card lg:min-h-0 lg:flex-1">
            <div className="shrink-0 border-b border-sage/20 bg-bone/40 px-4 py-2.5 text-xs text-graphite/55">
              {applications.length} application
              {applications.length !== 1 ? "s" : ""} · click a row for full
              details
            </div>
            <div className="rc-scroll overflow-x-auto lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-sage/20 text-left">
                    <th className={tableThClass}>Applicant</th>
                    <th className={tableThClass}>Animal</th>
                    <th className={tableThClass}>Motivation</th>
                    <th className={tableThClass}>Home</th>
                    <th className={tableThClass}>Submitted</th>
                    <th className={tableThClass}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const animalLabel =
                      app.animalName ?? app.animalTemporaryId ?? "Animal";
                    const img = getCasePhotoUrl(
                      app.animalSpecies ?? "other",
                      app.animalPhotoUrl,
                    );
                    return (
                      <ClickableRow
                        key={app.id}
                        onOpen={() => setOpenAppId(app.id)}
                      >
                        <td className={tableTdClass}>
                          <p className="font-semibold text-graphite">
                            {app.applicantName}
                          </p>
                          <p className="truncate text-[11px] text-graphite/50">
                            {app.applicantEmail}
                          </p>
                          {app.applicantPhone ? (
                            <p className="text-[11px] text-graphite/45">
                              {app.applicantPhone}
                            </p>
                          ) : null}
                        </td>
                        <td
                          className={tableTdClass}
                          onClick={stopRowClick}
                          onKeyDown={stopRowClick}
                        >
                          <div className="flex items-center gap-2.5">
                            <AnimalImage
                              src={img}
                              species={app.animalSpecies ?? "other"}
                              alt={animalLabel}
                              containerClassName="h-9 w-9 shrink-0 rounded-lg"
                              sizes="36px"
                              objectPosition="center top"
                              expandable
                              lightboxCaption={animalLabel}
                              showExpandHint={false}
                            />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-graphite">
                                {animalLabel}
                              </p>
                              <p className="text-[11px] capitalize text-graphite/50">
                                {app.animalSpecies
                                  ? formatStatus(app.animalSpecies)
                                  : "-"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className={`${tableTdClass} text-graphite/65`}>
                          <p className="line-clamp-2 max-w-[16rem] text-xs leading-relaxed">
                            {app.motivation?.trim() ||
                              "No motivation provided."}
                          </p>
                        </td>
                        <td className={`${tableTdClass} text-graphite/70`}>
                          <p className="capitalize">
                            {formatStatus(app.homeType)}
                          </p>
                          <p className="text-[11px] text-graphite/45">
                            {app.householdSize} in home
                            {app.hasYard ? " · yard" : ""}
                            {app.hasOtherPets ? " · pets" : ""}
                          </p>
                        </td>
                        <td className={`${tableTdClass} text-graphite/65`}>
                          {formatDateTime(app.submittedAt)}
                        </td>
                        <td className={tableTdClass}>
                          <StatusBadge status={app.status} />
                        </td>
                      </ClickableRow>
                    );
                  })}
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
      <AdoptionApplicationDetailModal
        application={openApplication}
        canManage={canManage}
        onClose={() => setOpenAppId(null)}
      />
      <ToastViewport />
    </>
  );
}
