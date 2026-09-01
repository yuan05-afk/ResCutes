"use server";

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
  confirmHandoff,
  overrideUrgency,
  updateMedicalClearance,
  updateShelterCapacity,
  updateShelterCapabilities,
} from "@/lib/data/service";
import {
  canManageCases,
  canAssignRescuer,
  canEditMedical,
  canManageSettings,
} from "@/lib/auth/permissions";

export async function acceptAssignmentAction(assignmentId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  acceptAssignment(assignmentId, session.user.id);
  return { success: true };
}

export async function declineAssignmentAction(
  assignmentId: string,
  reason: string,
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!reason.trim()) return { error: "Reason required" };
  declineAssignment(assignmentId, session.user.id, reason);
  return { success: true };
}

export async function updateCaseStatusAction(caseId: string, status: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  updateCaseStatus(caseId, status, session.user.id);
  return { success: true };
}

export async function verifyCaseAction(caseId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageCases(session.user.roles))
    return { error: "Unauthorized" };
  verifyCase(caseId, session.user.id);
  generateRecommendationsForCase(caseId);
  return { success: true };
}

export async function rejectCaseAction(caseId: string, reason: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageCases(session.user.roles))
    return { error: "Unauthorized" };
  rejectCase(caseId, session.user.id, reason);
  return { success: true };
}

export async function assignRescuerAction(caseId: string, rescuerId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canAssignRescuer(session.user.roles))
    return { error: "Unauthorized" };
  assignRescuer(caseId, rescuerId, session.user.id);
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
  return { success: true };
}

export async function confirmHandoffAction(
  caseId: string,
  shelterId: string,
  notes?: string,
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  confirmHandoff(
    caseId,
    shelterId,
    session.user.id,
    session.user.id,
    notes,
  );
  return { success: true };
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
