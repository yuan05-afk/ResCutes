import { requireAuth } from "@/lib/auth/session";
import { getCases, getAssignmentsForCase, resolveCurrentUrgency } from "@/lib/data/service";
import { getPrimaryMobileRole, ROLES } from "@/lib/auth/permissions";
import { MobileCaseCard } from "@/components/mobile/mobile-case-card";
import { StateMessage } from "@/components/status/state-message";

export default async function MobileCasesPage() {
  const session = await requireAuth();
  const isRescuer = getPrimaryMobileRole(session.user.roles) === ROLES.RESCUER;

  const cases = isRescuer
    ? getCases({ rescuerId: session.user.id })
    : getCases({ reporterId: session.user.id });

  return (
    <div>
      <header className="border-b border-sage/20 bg-white px-4 py-5">
        <h1 className="text-xl font-bold text-graphite">My Cases</h1>
        <p className="text-sm text-graphite/55 mt-1">
          {isRescuer ? "Your assigned rescue cases" : "Cases you reported"}
        </p>
      </header>

      <div className="px-4 py-5 space-y-3">
        {cases.length === 0 ? (
          <StateMessage
            type="empty"
            title="No cases yet"
            message={
              isRescuer
                ? "You have no assigned cases."
                : "Report an animal to start tracking a case."
            }
          />
        ) : (
          cases.map((c) => {
            const pendingAssignment = isRescuer
              ? getAssignmentsForCase(c.id).find(
                  (a) =>
                    a.rescuerId === session.user.id && a.status === "pending",
                )
              : undefined;

            const urgency = resolveCurrentUrgency(c);

            return (
              <MobileCaseCard
                key={c.id}
                id={c.id}
                caseNumber={c.caseNumber}
                species={c.species}
                status={c.status}
                urgencyLevel={urgency.level}
                urgencyScore={urgency.score}
                description={c.description}
                photoUrl={c.photoUrl}
                href={
                  pendingAssignment
                    ? `/mobile/assignments/${pendingAssignment.id}`
                    : undefined
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
