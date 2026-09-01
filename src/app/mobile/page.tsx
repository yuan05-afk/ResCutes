import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import {
  getNotificationsForUser,
  getCases,
  getAssignmentsForCase,
  getShelterById,
} from "@/lib/data/service";
import { getPrimaryMobileRole, ROLES } from "@/lib/auth/permissions";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { ReportCtaCard } from "@/components/mobile/report-cta-card";
import { ActiveRescueCard } from "@/components/mobile/active-rescue-card";
import { Button } from "@/components/ui/button";
import { UrgencyBadge } from "@/components/status/urgency-badge";
import { CheckCircle2 } from "lucide-react";

export default async function MobileHomePage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const roles = session.user.roles;
  const primaryRole = getPrimaryMobileRole(roles);
  const isRescuer = primaryRole === ROLES.RESCUER;

  const notifications = getNotificationsForUser(userId);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 3);

  const myCases = isRescuer
    ? getCases({ rescuerId: userId })
    : getCases({ reporterId: userId });

  const activeCases = myCases.filter(
    (c) => !["completed", "rejected", "duplicate", "cancelled"].includes(c.status),
  );

  const activeCase = activeCases.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];

  const pendingAssignment = isRescuer
    ? myCases
        .flatMap((c) =>
          getAssignmentsForCase(c.id).map((a) => ({ ...a, case: c })),
        )
        .find((a) => a.rescuerId === userId && a.status === "pending")
    : null;

  let rescuerName: string | undefined;
  let shelterLat: number | undefined;
  let shelterLon: number | undefined;
  let shelterName: string | undefined;

  if (activeCase) {
    const assignments = getAssignmentsForCase(activeCase.id);
    const accepted = assignments.find((a) => a.status === "accepted" || a.status === "completed");
    rescuerName = accepted?.rescuerName;
    if (activeCase.assignedShelterId) {
      const shelter = getShelterById(activeCase.assignedShelterId);
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
        {!isRescuer && <ReportCtaCard />}

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
                level={pendingAssignment.case.urgencyLevel}
                score={pendingAssignment.case.urgencyScore}
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

        {activeCase && !isRescuer && (
          <ActiveRescueCard
            caseId={activeCase.id}
            caseNumber={activeCase.caseNumber}
            status={activeCase.status}
            species={activeCase.species}
            description={activeCase.description}
            urgencyLevel={activeCase.urgencyLevel}
            urgencyScore={activeCase.urgencyScore}
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
            urgencyLevel={activeCase.urgencyLevel}
            urgencyScore={activeCase.urgencyScore}
            photoUrl={activeCase.photoUrl}
            approximateLat={activeCase.approximateLatitude}
            approximateLon={activeCase.approximateLongitude}
            rescuerName={rescuerName}
            shelterName={shelterName}
            shelterLat={shelterLat}
            shelterLon={shelterLon}
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
