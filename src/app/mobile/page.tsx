import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import {
  getAssignmentsForCase,
  getAssignmentsForCases,
  getCaseById,
  getFirstPendingAssignment,
  getShelterById,
  resolveCurrentUrgency,
} from "@/lib/data/service";
import { getMobileHomeDataCached } from "@/lib/data/cached-loaders";
import {
  isAdministrator,
  shouldUseRescuerMobileExperience,
  canUseCitizenMobileFeatures,
} from "@/lib/auth/permissions";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { ReportCtaCard } from "@/components/mobile/report-cta-card";
import { ActiveRescueCard } from "@/components/mobile/active-rescue-card";
import { Button } from "@/components/ui/button";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { CheckCircle2 } from "lucide-react";
import { isActiveCaseStatus } from "@/lib/rescue-stages";

export default async function MobileHomePage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const roles = session.user.roles;
  const isAdmin = isAdministrator(roles);
  const isRescuer = shouldUseRescuerMobileExperience(roles);
  const showCitizenFeatures = canUseCitizenMobileFeatures(roles);

  const { notifications, myCases } = await getMobileHomeDataCached(userId, {
    isRescuer,
    isAdministrator: isAdmin,
  });
  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 3);

  const activeCases = myCases.filter((c) => isActiveCaseStatus(c.status));

  const activeCase = activeCases.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];

  let pendingAssignment: {
    id: string;
    caseId: string;
    case: NonNullable<Awaited<ReturnType<typeof getCaseById>>>;
  } | null = null;

  if (isRescuer) {
    if (isAdmin) {
      const assignment = await getFirstPendingAssignment();
      if (assignment) {
        const caseItem = await getCaseById(assignment.caseId);
        if (caseItem) {
          pendingAssignment = { ...assignment, case: caseItem };
        }
      }
    } else {
      const assignmentMap = await getAssignmentsForCases(myCases.map((c) => c.id));
      for (const c of myCases) {
        const pending = assignmentMap
          .get(c.id)
          ?.find((a) => a.rescuerId === userId && a.status === "pending");
        if (pending) {
          pendingAssignment = { ...pending, case: c };
          break;
        }
      }
    }
  }

  let rescuerName: string | undefined;
  let shelterLat: number | undefined;
  let shelterLon: number | undefined;
  let shelterName: string | undefined;

  if (activeCase) {
    const assignments = await getAssignmentsForCase(activeCase.id);
    const accepted = assignments.find(
      (a) => a.status === "accepted" || a.status === "completed",
    );
    rescuerName = accepted?.rescuerName;
    if (activeCase.assignedShelterId) {
      const shelter = await getShelterById(activeCase.assignedShelterId);
      if (shelter) {
        shelterLat = shelter.latitude;
        shelterLon = shelter.longitude;
        shelterName = shelter.name;
      }
    }
  }

  return (
    <div>
      <MobileHeader
        userName={session.user.name}
        notificationCount={unreadCount}
      />

      <main className="px-4 py-5 space-y-5">
        {showCitizenFeatures && <ReportCtaCard />}

        {pendingAssignment && (
          <div className="rounded-2xl border border-ochre/30 bg-ochre/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ochre">
              New Assignment
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-bold text-graphite">
                {pendingAssignment.case.caseNumber}
              </span>
              <UrgencyBadge
                level={resolveCurrentUrgency(pendingAssignment.case).level}
                score={resolveCurrentUrgency(pendingAssignment.case).score}
              />
            </div>
            <p className="mt-2 text-sm text-graphite/65 line-clamp-2">
              {pendingAssignment.case.description}
            </p>
            <Button asChild className="mt-3 w-full rounded-full">
              <Link href={`/mobile/assignments/${pendingAssignment.id}`}>
                View Assignment
              </Link>
            </Button>
          </div>
        )}

        {activeCase && showCitizenFeatures && !isRescuer && (
          <ActiveRescueCard
            caseId={activeCase.id}
            caseNumber={activeCase.caseNumber}
            status={activeCase.status}
            species={activeCase.species}
            description={activeCase.description}
            urgencyLevel={resolveCurrentUrgency(activeCase).level}
            urgencyScore={resolveCurrentUrgency(activeCase).score}
            photoUrl={activeCase.photoUrl}
            approximateLat={activeCase.approximateLatitude}
            approximateLon={activeCase.approximateLongitude}
            rescuerName={rescuerName}
            shelterName={shelterName}
            shelterLat={shelterLat}
            shelterLon={shelterLon}
          />
        )}

        {isRescuer && activeCase && (
          <ActiveRescueCard
            caseId={activeCase.id}
            caseNumber={activeCase.caseNumber}
            status={activeCase.status}
            species={activeCase.species}
            description={activeCase.description}
            urgencyLevel={resolveCurrentUrgency(activeCase).level}
            urgencyScore={resolveCurrentUrgency(activeCase).score}
            photoUrl={activeCase.photoUrl}
            approximateLat={activeCase.approximateLatitude}
            approximateLon={activeCase.approximateLongitude}
            rescuerName={rescuerName}
            shelterName={shelterName}
            shelterLat={shelterLat}
            shelterLon={shelterLon}
            detailHref={
              pendingAssignment && pendingAssignment.caseId === activeCase.id
                ? `/mobile/assignments/${pendingAssignment.id}`
                : undefined
            }
          />
        )}

        {recentNotifications.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-graphite mb-3">
              Recent Updates
            </h2>
            <ul className="space-y-3">
              {recentNotifications.map((n) => (
                <li
                  key={n.id}
                  className="flex gap-3 rounded-xl border border-sage/20 bg-white p-3"
                >
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-evergreen mt-0.5"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-graphite">{n.title}</p>
                    <p className="text-xs text-graphite/60 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
