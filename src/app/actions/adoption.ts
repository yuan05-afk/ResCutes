"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import {
  createAdoptionApplication,
  reviewAdoptionApplication,
  updateAnimalProfile,
  deleteAnimal,
} from "@/lib/data/service";
import { canManageCases, canManageSettings } from "@/lib/auth/permissions";

function canManageAdoption(roles: Parameters<typeof canManageCases>[0]) {
  return canManageCases(roles) || canManageSettings(roles);
}

function revalidateAdoptionViews(animalId?: string) {
  revalidatePath("/adoption");
  revalidatePath("/animals");
  revalidatePath("/dashboard");
  revalidateTag("animals");
  if (animalId) revalidatePath(`/animals/${animalId}`);
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
  if (!canManageAdoption(session.user.roles)) {
    return { error: "Forbidden" };
  }

  if (!input.applicantName.trim()) return { error: "Applicant name is required" };
  if (!input.applicantEmail.trim()) return { error: "Applicant email is required" };
  if (!input.homeType.trim()) return { error: "Home type is required" };
  if (!input.motivation.trim()) return { error: "Motivation is required" };

  const result = await createAdoptionApplication({
    animalId: input.animalId,
    applicantName: input.applicantName.trim(),
    applicantEmail: input.applicantEmail.trim().toLowerCase(),
    applicantPhone: input.applicantPhone?.trim() || undefined,
    homeType: input.homeType.trim(),
    hasYard: input.hasYard,
    hasOtherPets: input.hasOtherPets,
    householdSize: input.householdSize,
    experienceNotes: input.experienceNotes?.trim() || undefined,
    motivation: input.motivation.trim(),
  });

  if (!result.ok) return { error: result.error };

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
