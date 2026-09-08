import { requireAuth } from "@/lib/auth/session";
import { getCases, getCaseLocation, resolveCurrentUrgency } from "@/lib/data/service";
import {
  canViewExactLocation,
  shouldUseRescuerMobileExperience,
} from "@/lib/auth/permissions";
import {
  formatShelterSpeciesLabel,
  getPhilippinesShelterDirectory,
} from "@/lib/data/philippines-shelters-directory";
import { OPERATIONAL_SHELTER_PROFILES } from "@/lib/data/operational-shelter-profiles";
import { isActiveCaseStatus, statusToStage } from "@/lib/rescue-stages";
import { HomeMapClient } from "./home-map-client";

export default async function MobileHomePage() {
  const session = await requireAuth();
  const isRescuer = shouldUseRescuerMobileExperience(session.user.roles);
  const canExact = canViewExactLocation(session.user.roles);

  const shelters = getPhilippinesShelterDirectory().map((s) => {
    const profile = OPERATIONAL_SHELTER_PROFILES[s.id];
    return {
      id: s.id,
      name: s.name,
      address: s.address,
      city: s.city,
      region: s.region,
      latitude: s.latitude,
      longitude: s.longitude,
      phone: s.phone,
      email: s.email,
      website: s.website,
      speciesAccepted: [...s.speciesAccepted],
      speciesProfile: s.speciesProfile,
      speciesLabel: formatShelterSpeciesLabel(s),
      capabilities: profile?.capabilities
        ? [...profile.capabilities]
        : undefined,
    };
  });

  let fieldCases: Array<{
    id: string;
    caseNumber: string;
    species: string;
    urgencyLevel: string;
    urgencyScore: number;
    status: string;
    latitude: number;
    longitude: number;
    description: string;
    photoUrl?: string;
  }> = [];

  if (isRescuer) {
    const allCases = await getCases();
    const fieldReadyCases = allCases.filter((c) => {
      if (!isActiveCaseStatus(c.status)) return false;
      const stage = statusToStage(c.status);
      return (
        stage === "needs_review" ||
        stage === "verified" ||
        stage === "with_rescuer" ||
        stage === "animal_secured"
      );
    });

    fieldCases = fieldReadyCases.map((c) => {
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
        photoUrl: c.photoUrl,
      };
    });
  }

  return (
    <HomeMapClient
      shelters={shelters}
      cases={fieldCases}
      showCasesLayer={isRescuer}
    />
  );
}
