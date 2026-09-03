"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { revalidateRescueData } from "@/lib/cache-revalidate";
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
  type ClearanceStatus,
} from "@/lib/data/service";
import {
  canManageCases,
  canAssignRescuer,
  canEditMedical,
  canManageSettings,
  isAdministrator,
} from "@/lib/auth/permissions";

function revalidateCaseViews(
  caseId: string,
  userId: string,
  email: string,
  assignmentId?: string,
  animalId?: string,
) {
  const paths = [
    `/rescue-cases/${caseId}`,
    "/rescue-cases",
    "/dashboard",
    `/mobile/cases/${caseId}`,
    "/mobile/cases",
    "/mobile",
    "/animals",
  ];
  if (animalId) paths.push(`/animals/${animalId}`);
  if (assignmentId) paths.push(`/mobile/assignments/${assignmentId}`);
  revalidateRescueData(userId, paths, email);
  revalidateTag("dashboard-metrics");
  revalidateTag("rescue-cases");
  revalidateTag("animals");
}

export async function acceptAssignmentAction(assignmentId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  const adminOverride = isAdministrator(session.user.roles);
  const accepted = await acceptAssignment(assignmentId, session.user.id, { adminOverride });
  if (!accepted) return { error: "Assignment not found or already responded" };
  const assignment = await getAssignmentById(assignmentId);
  if (assignment) {
    revalidateCaseViews(
      assignment.caseId,
      session.user.id,
      session.user.email,
      assignmentId,
    );
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
  const adminOverride = isAdministrator(session.user.roles);
  const declined = await declineAssignment(assignmentId, session.user.id, reason, {
    adminOverride,
  });
  if (!declined) return { error: "Assignment not found or already responded" };
  const assignment = await getAssignmentById(assignmentId);
  if (assignment) {
    revalidateCaseViews(
      assignment.caseId,
      session.user.id,
      session.user.email,
      assignmentId,
    );
  }
  return { success: true };
}

export async function updateCaseStatusAction(caseId: string, status: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const adminOverride = isAdministrator(session.user.roles);

  if (adminOverride) {
    const rescuerResult = await updateCaseStatusAsRescuer(
      caseId,
      session.user.id,
      status,
      { adminOverride: true },
    );
    if (!rescuerResult.ok) {
      await updateCaseStatus(caseId, status, session.user.id);
    }
  } else if (canManageCases(session.user.roles)) {
    await updateCaseStatus(caseId, status, session.user.id);
  } else {
    const result = await updateCaseStatusAsRescuer(caseId, session.user.id, status);
    if (!result.ok) return { error: result.error };
  }

  const assignments = await getAssignmentsForCase(caseId);
  const assignment = assignments.find(
    (a) => a.rescuerId === session.user!.id || adminOverride,
  );
  revalidateCaseViews(
    caseId,
    session.user.id,
    session.user.email,
    assignment?.id,
  );
  return { success: true };
}

export async function verifyCaseAction(caseId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageCases(session.user.roles))
    return { error: "Unauthorized" };
  const updated = await verifyCase(caseId, session.user.id);
  if (!updated) return { error: "Case not found" };
  await generateRecommendationsForCase(caseId);
  revalidateCaseViews(caseId, session.user.id, session.user.email);
  return { success: true };
}

export async function rejectCaseAction(caseId: string, reason: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageCases(session.user.roles))
    return { error: "Unauthorized" };
  await rejectCase(caseId, session.user.id, reason);
  revalidateCaseViews(caseId, session.user.id, session.user.email);
  return { success: true };
}

export async function assignRescuerAction(caseId: string, rescuerId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canAssignRescuer(session.user.roles))
    return { error: "Unauthorized" };
  await assignRescuer(caseId, rescuerId, session.user.id);
  revalidateCaseViews(caseId, session.user.id, session.user.email);
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
  await selectShelter(caseId, shelterId, session.user.id, rejectionReason);
  revalidateCaseViews(caseId, session.user.id, session.user.email);
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
  const result = await confirmShelterHandoff(
    caseId,
    shelterId,
    session.user.id,
    notes,
  );
  if (!result.ok) return { error: result.error };
  const assignments = await getAssignmentsForCase(caseId);
  const assignment = assignments.find(
    (a) => a.status === "completed" || a.status === "accepted",
  );
  revalidateCaseViews(
    caseId,
    session.user.id,
    session.user.email,
    assignment?.id,
  );
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
  const result = await completeShelterIntake(caseId, session.user.id, input);
  if (!result.ok) return { error: result.error };
  revalidateCaseViews(
    caseId,
    session.user.id,
    session.user.email,
    undefined,
    result.animalId,
  );
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
  await overrideUrgency(caseId, score, reason, session.user.id);
  revalidateCaseViews(caseId, session.user.id, session.user.email);
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

  const result = await updateMedicalClearance(animalId, session.user.id, {
    ...data,
    clearanceStatus: data.clearanceStatus as ClearanceStatus,
  });

  if (!result.ok) return { error: result.error };

  revalidatePath("/dashboard");
  revalidatePath("/animals");
  revalidatePath(`/animals/${animalId}`);
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
    await updateShelterCapacity(shelterId, data.totalCapacity, data.currentOccupancy);
  }
  if (data.capabilities) {
    await updateShelterCapabilities(shelterId, data.capabilities);
  }
  revalidateRescueData(session.user.id, ["/dashboard", "/settings"], session.user.email);
  revalidateTag("dashboard-metrics");
  revalidateTag("shelters");
  return { success: true };
}
