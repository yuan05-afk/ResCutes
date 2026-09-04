"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import {
  createAdoptionApplication,
  recordAdoptionInterest,
  clearAdoptionInterests,
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
  isAllowedCatalogOrOther,
  validateAnimalProfilePayload,
  validateEmail,
  validateOptionalText,
  validatePhoneOptional,
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
  homeType: string;
  hasYard?: boolean;
  hasOtherPets?: boolean;
  householdSize?: number;
  experienceNotes?: string;
  motivation: string;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const name = input.applicantName.trim();
  if (!name) return { error: "Applicant name is required" };
  const nameErr = validateOptionalText("Applicant name", name, {
    minLen: 2,
    maxLen: 100,
  });
  if (nameErr) return { error: nameErr };

  const emailErr = validateEmail(input.applicantEmail);
  if (emailErr) return { error: emailErr };

  const phoneErr = validatePhoneOptional(input.applicantPhone ?? "");
  if (phoneErr) return { error: phoneErr };

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
  if (!motivation) return { error: "Motivation is required" };
  const motErr = validateOptionalText("Motivation", motivation, {
    minLen: 10,
    maxLen: 2000,
  });
  if (motErr) return { error: motErr };

  const result = await createAdoptionApplication({
    animalId: input.animalId,
    applicantName: name,
    applicantEmail: input.applicantEmail.trim().toLowerCase(),
    applicantPhone: input.applicantPhone?.trim() || undefined,
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

  const validationError = validateAnimalProfilePayload(fields);
  if (validationError) return { error: validationError };

  const result = await updateAnimalProfile(id, fields);
  if (!result.ok) return { error: result.error };

  revalidateAdoptionViews(id);
  return { success: true };
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
