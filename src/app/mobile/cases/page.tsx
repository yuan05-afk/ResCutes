import { requireAuth } from "@/lib/auth/session";
import {
  getAssignmentsForCases,
  getCaseById,
  getFirstPendingAssignment,
  resolveCurrentUrgency,
} from "@/lib/data/service";
import {
  getMobileCasesListCached,
  getMobileHomeDataCached,
} from "@/lib/data/cached-loaders";
import {
  isAdministrator,
  shouldUseRescuerMobileExperience,
} from "@/lib/auth/permissions";
import Link from "next/link";
import { MobileCaseCard } from "@/components/mobile/mobile-case-card";
import { PendingAssignmentBanner } from "@/components/mobile/pending-assignment-banner";
import { StateMessage } from "@/components/status/state-message";
import { mobileHrefForNotification } from "@/lib/notifications";
import { formatStatus } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export default async function MobileCasesPage() {
  const session = await requireAuth();
  const isAdmin = isAdministrator(session.user.roles);
  const isRescuer = shouldUseRescuerMobileExperience(session.user.roles);

  const [cases, homeData] = await Promise.all([
    getMobileCasesListCached(session.user.id, {
      isRescuer,
      isAdministrator: isAdmin,
    }),
    getMobileHomeDataCached(session.user.id, {
      isRescuer,
      isAdministrator: isAdmin,
    }),
  ]);

  const updates = homeData.notifications.slice(0, 4);
  const assignmentMap = await getAssignmentsForCases(cases.map((c) => c.id));

  let pendingAssignment: {
    id: string;
    caseNumber: string;
    species: string;
    urgencyLevel: string;
    urgencyScore: number;
  } | null = null;

  if (isRescuer) {
    if (isAdmin) {
      const assignment = await getFirstPendingAssignment();
      if (assignment) {
        const caseItem = await getCaseById(assignment.caseId);
        if (caseItem) {
          const urgency = resolveCurrentUrgency(caseItem);
          pendingAssignment = {
            id: assignment.id,
            caseNumber: caseItem.caseNumber,
            species: caseItem.species,
            urgencyLevel: urgency.level,
            urgencyScore: urgency.score,
          };
        }
      }
    } else {
      for (const c of cases) {
        const pending = assignmentMap
          .get(c.id)
          ?.find(
            (a) => a.rescuerId === session.user.id && a.status === "pending",
          );
        if (pending) {
          const urgency = resolveCurrentUrgency(c);
          pendingAssignment = {
            id: pending.id,
            caseNumber: c.caseNumber,
            species: c.species,
            urgencyLevel: urgency.level,
            urgencyScore: urgency.score,
          };
          break;
        }
      }
    }
  }

  const subtitle = isAdmin
    ? "Active workflows"
    : isRescuer
      ? "Your assignments"
      : "Your reports";

  const listCases = pendingAssignment
    ? cases.filter((c) => c.caseNumber !== pendingAssignment.caseNumber)
    : cases;

  return (
    <div>
      <header className="border-b border-sage/20 bg-white px-4 py-3.5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-graphite">Cases</h1>
            <p className="mt-0.5 text-sm text-graphite/50">{subtitle}</p>
          </div>
          {cases.length > 0 ? (
            <p className="shrink-0 pb-0.5 text-xs font-semibold tabular-nums text-graphite/40">
              {cases.length} active
            </p>
          ) : null}
        </div>
      </header>

      <div className="space-y-5 px-4 py-4">
        {pendingAssignment ? (
          <section aria-labelledby="pending-assignment-heading">
            <h2 id="pending-assignment-heading" className="sr-only">
              Needs your response
            </h2>
            <PendingAssignmentBanner
              assignmentId={pendingAssignment.id}
              caseNumber={pendingAssignment.caseNumber}
              urgencyLevel={pendingAssignment.urgencyLevel}
              urgencyScore={pendingAssignment.urgencyScore}
              summary={formatStatus(pendingAssignment.species)}
            />
          </section>
        ) : null}

        {cases.length === 0 ? (
          <StateMessage
            type="empty"
            title="No cases yet"
            message={
              isRescuer
                ? "Assigned cases will show up here."
                : "Reports you submit will appear here."
            }
          />
        ) : listCases.length === 0 ? null : (
          <section aria-labelledby="active-cases-heading">
            <div className="mb-2.5 flex items-baseline justify-between gap-2">
              <h2
                id="active-cases-heading"
                className="text-[11px] font-semibold uppercase tracking-wide text-graphite/45"
              >
                {pendingAssignment ? "Other cases" : "Active"}
              </h2>
            </div>
            <ul className="space-y-2.5">
              {listCases.map((c) => {
                const assignments = assignmentMap.get(c.id) ?? [];
                const pendingForUser = isRescuer
                  ? isAdmin
                    ? assignments.find((a) => a.status === "pending")
                    : assignments.find(
                        (a) =>
                          a.rescuerId === session.user.id &&
                          a.status === "pending",
                      )
                  : undefined;
                const urgency = resolveCurrentUrgency(c);

                return (
                  <li key={c.id}>
                    <MobileCaseCard
                      id={c.id}
                      caseNumber={c.caseNumber}
                      species={c.species}
                      status={c.status}
                      urgencyLevel={urgency.level}
                      urgencyScore={urgency.score}
                      description={c.description}
                      photoUrl={c.photoUrl}
                      href={
                        pendingForUser
                          ? `/mobile/assignments/${pendingForUser.id}`
                          : `/mobile/cases/${c.id}`
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {updates.length > 0 ? (
          <section id="updates" className="scroll-mt-4">
            <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-graphite/45">
              Updates
            </h2>
            <ul className="overflow-hidden rounded-2xl border border-sage/20 bg-white divide-y divide-sage/15">
              {updates.map((n) => {
                const href = mobileHrefForNotification(n);
                const body = (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-graphite">
                        {n.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-graphite/55">
                        {n.message}
                      </p>
                    </div>
                    {href ? (
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-graphite/35"
                        aria-hidden
                      />
                    ) : null}
                  </>
                );

                return (
                  <li key={n.id}>
                    {href ? (
                      <Link
                        href={href}
                        className="flex min-h-11 items-center gap-2 px-3.5 py-2.5 active:bg-bone/80"
                        aria-label={`${n.title}. Open related case.`}
                      >
                        {body}
                      </Link>
                    ) : (
                      <div className="flex min-h-11 items-center gap-2 px-3.5 py-2.5">
                        {body}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
