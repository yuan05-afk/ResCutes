"use server";

import { auth } from "@/lib/auth";
import {
  getCaseById,
  getStatusHistoryForCase,
  getAssignmentsForCase,
  getRecommendationsForCase,
  getHandoffForCase,
  getAnimalById,
  getShelterById,
  getRescuers,
  getMedicalClearanceForAnimal,
  getNotesForAnimal,
  resolveCurrentUrgency,
} from "@/lib/data/service";
import { canManageCases, canViewReporterInfo, canViewMedicalNotes, canEditMedical } from "@/lib/auth/permissions";

export async function fetchCaseModalData(caseId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" as const };

  const caseItem = await getCaseById(caseId);
  if (!caseItem) return { error: "Not found" as const };

  const [
    history,
    assignments,
    recommendations,
    handoff,
    animal,
    shelter,
    rescuers,
  ] = await Promise.all([
    getStatusHistoryForCase(caseId),
    getAssignmentsForCase(caseId),
    getRecommendationsForCase(caseId),
    getHandoffForCase(caseId),
    caseItem.animalId ? getAnimalById(caseItem.animalId) : Promise.resolve(null),
    caseItem.assignedShelterId
      ? getShelterById(caseItem.assignedShelterId)
      : Promise.resolve(null),
    getRescuers(),
  ]);
  const currentUrgency = resolveCurrentUrgency(caseItem);

  return {
    data: {
      caseItem,
      currentUrgency,
      history,
      assignments,
      recommendations,
      handoff,
      animal,
      shelter,
      rescuers,
      canManage: canManageCases(session.user.roles),
      canReporter: canViewReporterInfo(session.user.roles),
    },
  };
}

export async function fetchAnimalModalData(animalId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" as const };

  const animal = await getAnimalById(animalId);
  if (!animal) return { error: "Not found" as const };

  const [clearance, notes, rescueCase, shelter] = await Promise.all([
    getMedicalClearanceForAnimal(animalId),
    getNotesForAnimal(animalId),
    animal.rescueCaseId ? getCaseById(animal.rescueCaseId) : Promise.resolve(null),
    animal.shelterId ? getShelterById(animal.shelterId) : Promise.resolve(null),
  ]);

  return {
    data: {
      animal,
      clearance,
      notes: notes.slice(0, 3),
      rescueCase,
      shelter,
      canMedical: canViewMedicalNotes(session.user.roles),
      canEdit: canEditMedical(session.user.roles),
    },
  };
}
