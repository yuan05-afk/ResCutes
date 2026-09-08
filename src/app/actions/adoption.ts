"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import {
  createAdoptionApplication,
  recordAdoptionInterest,
  clearAdoptionInterests,
  clearAdoptionInterestForAnimal,
  reviewAdoptionApplication,
  transferClearedAnimalToAdoption,
  updateAnimalProfile,
  deleteAnimal,
} from "@/lib/data/service";
import {
  canEditMedical,
  canManageCases,
  canManageSettings,
} from "@/lib/auth/permissions";
import {
  HOME_TYPE_OPTIONS,
  REPORT_SPECIES,
  isAllowedCatalogOrOther,
  validateAnimalProfilePayload,
  validateEmail,
  validateOptionalText,
  validatePhoneRequired,
  validateSocialLinkOptional,
} from "@/lib/forms/animal-field-options";

function canManageAdoption(roles: Parameters<typeof canManageCases>[0]) {
  return canManageCases(roles) || canManageSettings(roles);
}

function revalidateAdoptionViews(animalId?: string) {
  revalidatePath("/adoption");
  revalidatePath("/mobile/adoption");
  revalidatePath("/animals");
  revalidatePath("/medical");
  revalidatePath("/dashboard");
  revalidateTag("animals");
  if (animalId) revalidatePath(`/animals/${animalId}`);
}

function canTransferClearedAnimal(
  roles: Parameters<typeof canManageCases>[0],
) {
  return canManageAdoption(roles) || canEditMedical(roles);
}

/** Medical → adoption handoff from the Medical Clearance workspace. */
export async function transferAnimalToAdoptionAction(
  animalId: string,
  destination: "ready_for_adoption" | "ready_for_foster" = "ready_for_adoption",
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canTransferClearedAnimal(session.user.roles)) {
    return { error: "Forbidden" };
  }

  const result = await transferClearedAnimalToAdoption(animalId, destination);
  if (!result.ok) return { error: result.error };

  revalidateAdoptionViews(animalId);
  return {
    success: true as const,
    alreadyReady: result.alreadyReady,
    destination,
  };
}

export async function passAdoptionAnimalAction(animalId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const result = await recordAdoptionInterest(
    session.user.id,
    animalId,
    "pass",
  );
  if (!result.ok) return { error: result.error };

  revalidatePath("/mobile/adoption");
  return { success: true as const };
}

export async function expressAdoptionInterestAction(animalId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const result = await recordAdoptionInterest(
    session.user.id,
    animalId,
    "interested",
  );
  if (!result.ok) return { error: result.error };

  revalidatePath("/mobile/adoption");
  return { success: true as const };
}

/** Cancel a liked (or passed) decision for one animal. Does not withdraw applications. */
export async function cancelAdoptionInterestAction(animalId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await clearAdoptionInterestForAnimal(session.user.id, animalId);
  revalidatePath("/mobile/adoption");
  return { success: true as const };
}

/** Put passed animals back into the swipe queue. */
export async function resetAdoptionPassesAction() {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const result = await clearAdoptionInterests(session.user.id, "pass");
  revalidatePath("/mobile/adoption");
  return { success: true as const, removed: result.removed };
}

/** Clear all swipe decisions (pass + interest). Does not withdraw applications. */
export async function resetAllAdoptionSwipesAction() {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const result = await clearAdoptionInterests(session.user.id, "all");
  revalidatePath("/mobile/adoption");
  return { success: true as const, removed: result.removed };
}

export async function submitAdoptionApplicationAction(input: {
  animalId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  socialLink?: string;
  applicantCity?: string;
  homeType: string;
  hasYard?: boolean;
  hasOtherPets?: boolean;
  householdSize?: number;
  experienceNotes?: string;
  motivation: string;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const staffLogging = canManageAdoption(session.user.roles);

  // Adopters enter their real name on the form; email stays tied to the account.
  const name = input.applicantName.trim();
  const email = staffLogging
    ? input.applicantEmail.trim().toLowerCase()
    : session.user.email.trim().toLowerCase();

  if (!name) return { error: "Full name is required" };
  const nameErr = validateOptionalText("Full name", name, {
    minLen: 2,
    maxLen: 100,
  });
  if (nameErr) return { error: nameErr };

  const emailErr = validateEmail(email);
  if (emailErr) return { error: emailErr };

  const phoneErr = validatePhoneRequired(input.applicantPhone ?? "");
  if (phoneErr) return { error: phoneErr };

  const city = (input.applicantCity ?? "").trim();
  if (!city) return { error: "City or area is required" };
  const cityErr = validateOptionalText("City / area", city, {
    minLen: 2,
    maxLen: 80,
  });
  if (cityErr) return { error: cityErr };

  const socialErr = validateSocialLinkOptional(input.socialLink ?? "");
  if (socialErr) return { error: socialErr };

  if (
    !isAllowedCatalogOrOther(input.homeType, HOME_TYPE_OPTIONS, {
      allowEmpty: false,
    })
  ) {
    return { error: "Select a valid home type" };
  }

  if (
    input.householdSize !== undefined &&
    (!Number.isFinite(input.householdSize) ||
      input.householdSize < 1 ||
      input.householdSize > 30)
  ) {
    return { error: "Household size must be between 1 and 30" };
  }

  const expErr = validateOptionalText(
    "Experience notes",
    input.experienceNotes ?? "",
    { maxLen: 1000 },
  );
  if (expErr) return { error: expErr };

  const motivation = input.motivation.trim();
  if (!motivation) return { error: "Please share why you want this animal" };
  const motErr = validateOptionalText("Motivation", motivation, {
    minLen: 10,
    maxLen: 2000,
  });
  if (motErr) return { error: motErr };

  const socialLink = input.socialLink?.trim() || undefined;
  const normalizedSocial = socialLink
    ? socialLink.startsWith("@") || /^https?:\/\//i.test(socialLink)
      ? socialLink
      : `https://${socialLink}`
    : undefined;

  const result = await createAdoptionApplication({
    animalId: input.animalId,
    applicantName: name,
    applicantEmail: email,
    applicantPhone: input.applicantPhone!.trim(),
    socialLink: normalizedSocial,
    applicantCity: city,
    homeType: input.homeType.trim(),
    hasYard: input.hasYard,
    hasOtherPets: input.hasOtherPets,
    householdSize: input.householdSize,
    experienceNotes: input.experienceNotes?.trim() || undefined,
    motivation,
  });

  if (!result.ok) return { error: result.error };

  await recordAdoptionInterest(session.user.id, input.animalId, "interested");

  revalidateAdoptionViews(input.animalId);
  return { success: true, applicationId: result.application.id };
}

export async function reviewAdoptionApplicationAction(
  id: string,
  status: "approved" | "rejected" | "under_review" | "withdrawn" | "completed",
  notes?: string,
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageAdoption(session.user.roles)) {
    return { error: "Forbidden" };
  }

  const result = await reviewAdoptionApplication(
    id,
    status,
    session.user.id,
    notes?.trim() || undefined,
  );

  if (!result.ok) return { error: result.error };

  revalidateAdoptionViews();
  return { success: true };
}

export async function updateAnimalAction(
  id: string,
  fields: {
    name?: string | null;
    bio?: string | null;
    temperament?: string | null;
    pathwayStage?: string;
    sex?: string | null;
    estimatedAge?: string | null;
    breed?: string | null;
    color?: string | null;
    recommendedNextAction?: string | null;
    photoUrl?: string | null;
  },
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageAdoption(session.user.roles)) {
    return { error: "Forbidden" };
  }

  const validationError = validateAnimalProfilePayload({
    ...fields,
    requireName: true,
  });
  if (validationError) return { error: validationError };

  const result = await updateAnimalProfile(id, {
    ...fields,
    name: fields.name?.trim() || null,
  });
  if (!result.ok) return { error: result.error };

  revalidateAdoptionViews(id);
  return { success: true };
}

export async function createAnimalAction(input: {
  name: string;
  species: string;
  sex?: string | null;
  estimatedAge?: string | null;
  breed?: string | null;
  color?: string | null;
  bio?: string | null;
  temperament?: string | null;
  pathwayStage?: string;
  shelterId?: string | null;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageAdoption(session.user.roles)) {
    return { error: "Forbidden" };
  }

  const validationError = validateAnimalProfilePayload({
    name: input.name,
    bio: input.bio,
    temperament: input.temperament,
    pathwayStage: input.pathwayStage ?? "intake",
    sex: input.sex,
    estimatedAge: input.estimatedAge,
    breed: input.breed,
    color: input.color,
    species: input.species,
    requireName: true,
  });
  if (validationError) return { error: validationError };

  if (!REPORT_SPECIES.includes(input.species as (typeof REPORT_SPECIES)[number])) {
    return { error: "Select a valid species." };
  }

  const { createAnimalRecord } = await import("@/lib/data/service");
  const result = await createAnimalRecord({
    name: input.name.trim(),
    species: input.species,
    sex: input.sex?.trim() || null,
    estimatedAge: input.estimatedAge?.trim() || null,
    breed: input.breed?.trim() || null,
    color: input.color?.trim() || null,
    bio: input.bio?.trim() || null,
    temperament: input.temperament?.trim() || null,
    pathwayStage: input.pathwayStage ?? "intake",
    shelterId: input.shelterId || null,
  });

  if (!result.ok) return { error: result.error };

  revalidateAdoptionViews(result.animal.id);
  return { success: true as const, animalId: result.animal.id };
}

export async function setAnimalAdoptionListingAction(
  animalId: string,
  listed: boolean,
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageAdoption(session.user.roles)) {
    return { error: "Forbidden" };
  }

  const { setAnimalAdoptionListing } = await import("@/lib/data/service");
  const result = await setAnimalAdoptionListing(animalId, listed);
  if (!result.ok) return { error: result.error };

  revalidateAdoptionViews(animalId);
  return { success: true as const, pathwayStage: result.pathwayStage };
}

export async function deleteAnimalAction(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageAdoption(session.user.roles)) {
    return { error: "Forbidden" };
  }

  const result = await deleteAnimal(id);
  if (!result.ok) return { error: result.error };

  revalidateAdoptionViews(id);
  return { success: true };
}
