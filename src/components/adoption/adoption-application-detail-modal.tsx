"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Mail, Phone, Home, Users, PawPrint, FileText } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdoptionReviewActions } from "@/components/adoption/adoption-review-actions";
import { AnimalImage } from "@/components/ui/animal-image";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import { getCasePhotoUrl } from "@/lib/demo-images";
import { formatDateTime, formatStatus } from "@/lib/utils";
import type { AdoptionApplicationRecord } from "@/lib/data/types";

interface AdoptionApplicationDetailModalProps {
  application: AdoptionApplicationRecord | null;
  canManage: boolean;
  onClose: () => void;
}

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2 rounded-xl border border-sage/20 bg-bone/30 p-3.5">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-graphite/50">
        {icon}
        {title}
      </div>
      {children}
    </section>
  );
}

export function AdoptionApplicationDetailModal({
  application,
  canManage,
  onClose,
}: AdoptionApplicationDetailModalProps) {
  if (!application) return null;

  const animalLabel =
    application.animalName ?? application.animalTemporaryId ?? "Animal";
  const photoSrc = getCasePhotoUrl(
    application.animalSpecies ?? "other",
    application.animalPhotoUrl,
  );
  const isOpen =
    application.status === "pending" || application.status === "under_review";

  return (
    <AdminModal
      open={Boolean(application)}
      onClose={onClose}
      title={application.applicantName}
      description={`Application for ${animalLabel}`}
      size="lg"
      placement="center"
      fitViewport
      headerExtra={<StatusBadge status={application.status} />}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/animals/${application.animalId}`}>View animal</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-sage/20 bg-white p-3">
          <AnimalImage
            src={photoSrc}
            species={application.animalSpecies ?? "other"}
            alt={animalLabel}
            containerClassName="h-14 w-14 shrink-0 rounded-xl"
            sizes="56px"
            objectPosition="center top"
            expandable
            lightboxCaption={animalLabel}
            showExpandHint={false}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-graphite">{animalLabel}</p>
            <p className="text-xs capitalize text-graphite/55">
              {application.animalSpecies
                ? formatStatus(application.animalSpecies)
                : "Unknown species"}
              {application.animalTemporaryId
                ? ` · ${application.animalTemporaryId}`
                : ""}
            </p>
            <p className="mt-0.5 text-[11px] text-graphite/45">
              Submitted {formatDateTime(application.submittedAt)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DetailSection
            title="Applicant contact"
            icon={<Mail className="h-3.5 w-3.5" />}
          >
            <p className="text-sm font-medium text-graphite">
              {application.applicantName}
            </p>
            <a
              href={`mailto:${application.applicantEmail}`}
              className="mt-1 flex items-center gap-1.5 text-xs text-evergreen hover:underline"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {application.applicantEmail}
            </a>
            {application.applicantPhone ? (
              <a
                href={`tel:${application.applicantPhone.replace(/\s+/g, "")}`}
                className="mt-1 flex items-center gap-1.5 text-xs text-evergreen hover:underline"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {application.applicantPhone}
              </a>
            ) : (
              <p className="mt-1 text-xs text-graphite/45">No phone provided</p>
            )}
          </DetailSection>

          <DetailSection
            title="Home situation"
            icon={<Home className="h-3.5 w-3.5" />}
          >
            <p className="text-sm font-medium capitalize text-graphite">
              {formatStatus(application.homeType)}
            </p>
            <ul className="mt-1.5 space-y-1 text-xs text-graphite/65">
              <li className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0 text-graphite/40" />
                {application.householdSize} in household
              </li>
              <li>
                Yard:{" "}
                <span className="font-medium text-graphite">
                  {application.hasYard ? "Yes" : "No"}
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <PawPrint className="mt-0.5 h-3.5 w-3.5 shrink-0 text-graphite/40" />
                Other pets:{" "}
                <span className="font-medium text-graphite">
                  {application.hasOtherPets ? "Yes" : "No"}
                </span>
              </li>
            </ul>
          </DetailSection>
        </div>

        <DetailSection
          title="Why they want to adopt"
          icon={<FileText className="h-3.5 w-3.5" />}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-graphite/80">
            {application.motivation?.trim() || "No motivation provided."}
          </p>
        </DetailSection>

        <DetailSection
          title="Pet experience"
          icon={<PawPrint className="h-3.5 w-3.5" />}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-graphite/80">
            {application.experienceNotes?.trim() ||
              "No experience notes provided."}
          </p>
        </DetailSection>

        {application.reviewNotes || application.reviewerName ? (
          <DetailSection
            title="Staff review"
            icon={<FileText className="h-3.5 w-3.5" />}
          >
            {application.reviewerName ? (
              <p className="text-xs text-graphite/50">
                Reviewed by {application.reviewerName}
                {application.decidedAt
                  ? ` · ${formatDateTime(application.decidedAt)}`
                  : ""}
              </p>
            ) : null}
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-graphite/80">
              {application.reviewNotes?.trim() || "No review notes."}
            </p>
          </DetailSection>
        ) : null}

        {canManage && isOpen ? (
          <section className="rounded-xl border border-sage/25 bg-white p-3.5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-graphite/50">
              Decision
            </p>
            <AdoptionReviewActions
              applicationId={application.id}
              applicantName={application.applicantName}
              animalLabel={animalLabel}
              status={application.status}
              onDecided={onClose}
            />
          </section>
        ) : null}
      </div>
    </AdminModal>
  );
}
