"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  acceptAssignment,
  declineAssignment,
  updateCaseStatus,
  verifyCase,
  rejectCase,
  assignRescuer,
  generateRecommendationsForCase,
  selectShelter,
  confirmShelterHandoff,
  completeShelterIntake,
  overrideUrgency,
  updateMedicalClearance,
  updateShelterCapacity,
  updateShelterCapabilities,
  getAssignmentById,
  getAssignmentsForCase,
  updateCaseStatusAsRescuer,
} from "@/lib/data/service";
import {
  canManageCases,
  canAssignRescuer,
  canEditMedical,
  canManageSettings,
} from "@/lib/auth/permissions";

function revalidateCaseViews(
  caseId: string,
  assignmentId?: string,
  animalId?: string,
) {
  revalidatePath(`/rescue-cases/${caseId}`);
  revalidatePath("/rescue-cases");
  revalidatePath("/dashboard");
  revalidatePath(`/mobile/cases/${caseId}`);
  revalidatePath("/mobile/cases");
  revalidatePath("/mobile");
  revalidatePath("/animals");
  if (animalId) {
    revalidatePath(`/animals/${animalId}`);
  }
  if (assignmentId) {
    revalidatePath(`/mobile/assignments/${assignmentId}`);
  }
}

export async function acceptAssignmentAction(assignmentId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  const accepted = acceptAssignment(assignmentId, session.user.id);
  if (!accepted) return { error: "Assignment not found or already responded" };
  const assignment = getAssignmentById(assignmentId);
  if (assignment) {
    revalidateCaseViews(assignment.caseId, assignmentId);
  }
  return { success: true };
}

export async function declineAssignmentAction(
  assignmentId: string,
  reason: string,
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!reason.trim()) return { error: "Reason required" };
  const declined = declineAssignment(assignmentId, session.user.id, reason);
  if (!declined) return { error: "Assignment not found or already responded" };
  const assignment = getAssignmentById(assignmentId);
  if (assignment) {
    revalidateCaseViews(assignment.caseId, assignmentId);
  }
  return { success: true };
}

export async function updateCaseStatusAction(caseId: string, status: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  if (canManageCases(session.user.roles)) {
    updateCaseStatus(caseId, status, session.user.id);
  } else {
    const result = updateCaseStatusAsRescuer(
      caseId,
      session.user.id,
      status,
    );
    if (!result.ok) return { error: result.error };
  }

  const assignment = getAssignmentsForCase(caseId).find(
    (a) => a.rescuerId === session.user!.id,
  );
  revalidateCaseViews(caseId, assignment?.id);
  return { success: true };
}

export async function verifyCaseAction(caseId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageCases(session.user.roles))
    return { error: "Unauthorized" };
  const updated = verifyCase(caseId, session.user.id);
  if (!updated) return { error: "Case not found" };
  generateRecommendationsForCase(caseId);
  revalidateCaseViews(caseId);
  return { success: true };
}

export async function rejectCaseAction(caseId: string, reason: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageCases(session.user.roles))
    return { error: "Unauthorized" };
  rejectCase(caseId, session.user.id, reason);
  revalidateCaseViews(caseId);
  return { success: true };
}

export async function assignRescuerAction(caseId: string, rescuerId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canAssignRescuer(session.user.roles))
    return { error: "Unauthorized" };
  assignRescuer(caseId, rescuerId, session.user.id);
  revalidateCaseViews(caseId);
  return { success: true };
}

export async function selectShelterAction(
  caseId: string,
  shelterId: string,
  rejectionReason?: string,
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageCases(session.user.roles))
    return { error: "Unauthorized" };
  selectShelter(caseId, shelterId, session.user.id, rejectionReason);
  revalidateCaseViews(caseId);
  return { success: true };
}

export async function confirmHandoffAction(
  caseId: string,
  shelterId: string,
  notes?: string,
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageCases(session.user.roles))
    return { error: "Unauthorized" };
  const result = confirmShelterHandoff(
    caseId,
    shelterId,
    session.user.id,
    notes,
  );
  if (!result.ok) return { error: result.error };
  const assignment = getAssignmentsForCase(caseId).find(
    (a) => a.status === "completed" || a.status === "accepted",
  );
  revalidateCaseViews(caseId, assignment?.id);
  return { success: true };
}

export async function completeShelterIntakeAction(
  caseId: string,
  input?: {
    name?: string;
    estimatedAge?: string;
    sex?: string;
    breed?: string;
    color?: string;
    initialCondition?: string;
  },
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageCases(session.user.roles))
    return { error: "Unauthorized" };
  const result = completeShelterIntake(caseId, session.user.id, input);
  if (!result.ok) return { error: result.error };
  revalidateCaseViews(caseId, undefined, result.animalId);
  return { success: true, animalId: result.animalId };
}

export async function overrideUrgencyAction(
  caseId: string,
  score: number,
  reason: string,
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageCases(session.user.roles))
    return { error: "Unauthorized" };
  if (!reason.trim()) return { error: "Override reason required" };
  overrideUrgency(caseId, score, reason, session.user.id);
  return { success: true };
}

export async function updateMedicalClearanceAction(
  animalId: string,
  data: {
    examinationDate?: string;
    generalCondition?: string;
    medicalPriority?: string;
    treatmentSummary?: string;
    restrictions?: string;
    followUpDate?: string;
    clearanceStatus: string;
    veterinarianNotes?: string;
  },
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canEditMedical(session.user.roles))
    return { error: "Unauthorized" };
  updateMedicalClearance(animalId, session.user.id, data);
  return { success: true };
}

export async function updateShelterSettingsAction(
  shelterId: string,
  data: {
    totalCapacity?: number;
    currentOccupancy?: number;
    capabilities?: string[];
  },
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageSettings(session.user.roles))
    return { error: "Unauthorized" };
  if (data.totalCapacity !== undefined && data.currentOccupancy !== undefined) {
    updateShelterCapacity(shelterId, data.totalCapacity, data.currentOccupancy);
  }
  if (data.capabilities) {
    updateShelterCapabilities(shelterId, data.capabilities);
  }
  return { success: true };
}
