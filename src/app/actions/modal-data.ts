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
import { canManageCases, canViewReporterInfo, canViewMedicalNotes } from "@/lib/auth/permissions";

export async function fetchCaseModalData(caseId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" as const };

  const caseItem = getCaseById(caseId);
  if (!caseItem) return { error: "Not found" as const };

  const history = getStatusHistoryForCase(caseId);
  const assignments = getAssignmentsForCase(caseId);
  const recommendations = getRecommendationsForCase(caseId);
  const handoff = getHandoffForCase(caseId);
  const animal = caseItem.animalId ? getAnimalById(caseItem.animalId) : null;
  const shelter = caseItem.assignedShelterId
    ? getShelterById(caseItem.assignedShelterId)
    : null;
  const rescuers = getRescuers();
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

  const animal = getAnimalById(animalId);
  if (!animal) return { error: "Not found" as const };

  const clearance = getMedicalClearanceForAnimal(animalId);
  const notes = getNotesForAnimal(animalId);
  const rescueCase = animal.rescueCaseId ? getCaseById(animal.rescueCaseId) : null;
  const shelter = animal.shelterId ? getShelterById(animal.shelterId) : null;

  return {
    data: {
      animal,
      clearance,
      notes: notes.slice(0, 3),
      rescueCase,
      shelter,
      canMedical: canViewMedicalNotes(session.user.roles),
    },
  };
}
