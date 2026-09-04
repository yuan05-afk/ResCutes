import { requireAuth } from "@/lib/auth/session";
import { getCases, getCaseLocation, resolveCurrentUrgency } from "@/lib/data/service";
import {
  canViewExactLocation,
  shouldUseRescuerMobileExperience,
} from "@/lib/auth/permissions";
import { getCuratedShelterRecords } from "@/lib/data/philippines-shelters-directory";
import { isActiveCaseStatus, statusToStage } from "@/lib/rescue-stages";
import { HomeMapClient } from "./home-map-client";

export default async function MobileHomePage() {
  const session = await requireAuth();
  const isRescuer = shouldUseRescuerMobileExperience(session.user.roles);
  const canExact = canViewExactLocation(session.user.roles);

  const shelters = getCuratedShelterRecords().map((s) => ({
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
  }));

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
    const verifiedCases = allCases.filter((c) => {
      if (!isActiveCaseStatus(c.status)) return false;
      const stage = statusToStage(c.status);
      return (
        stage === "verified" ||
        stage === "with_rescuer" ||
        stage === "animal_secured"
      );
    });

    fieldCases = verifiedCases.map((c) => {
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
