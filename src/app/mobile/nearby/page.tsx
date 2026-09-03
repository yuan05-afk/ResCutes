import { requireAuth } from "@/lib/auth/session";
import { getCases, getCaseLocation, resolveCurrentUrgency } from "@/lib/data/service";
import { canViewExactLocation } from "@/lib/auth/permissions";
import { NearbyMapClient } from "./nearby-client";

export default async function NearbyPage() {
  const session = await requireAuth();
  const canExact = canViewExactLocation(session.user.roles);

  const allCases = await getCases();
  const verifiedCases = allCases.filter((c) =>
    ["verified", "rescuer_assigned", "rescue_accepted", "rescue_in_progress", "animal_secured", "awaiting_shelter"].includes(c.status),
  );

  const casesWithLocation = verifiedCases.map((c) => {
    const loc = getCaseLocation(c, session.user.roles, canExact);
    const urgency = resolveCurrentUrgency(c);
    return {
      id: c.id,
      caseNumber: c.caseNumber,
      species: c.species,
      urgencyLevel: urgency.level,
      urgencyScore: urgency.score,
      status: c.status,
      latitude: loc.latitude,
      longitude: loc.longitude,
      description: c.description,
    };
  });

  return (
    <div>
      <header className="border-b border-sage/30 bg-white px-4 py-4">
        <h1 className="text-lg font-semibold text-evergreen">Nearby Cases</h1>
        <p className="text-sm text-graphite/70 mt-1">
          {canExact
            ? "Showing verified cases with exact locations"
            : "Showing approximate locations for safety"}
        </p>
      </header>
      <NearbyMapClient cases={casesWithLocation} />
    </div>
  );
}
