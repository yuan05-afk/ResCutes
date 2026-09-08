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
  updateRescuerNote,
  type ClearanceStatus,
} from "@/lib/data/service";
import {
  canManageCases,
  canAssignRescuer,
  canEditMedical,
  canManageSettings,
  isAdministrator,
} from "@/lib/auth/permissions";
import {
  ANIMAL_AGE_OPTIONS,
  ANIMAL_SEX_OPTIONS,
  COAT_COLOR_OPTIONS,
  GENERAL_CONDITION_OPTIONS,
  isAllowedBreed,
  isAllowedCatalogOrOther,
  isMedicalPriority,
  validateOptionalText,
  validateRequiredAnimalName,
} from "@/lib/forms/animal-field-options";
import {
  followUpDateBounds,
  validateIsoDate,
} from "@/lib/forms/date-validation";

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
  const reasonErr = validateOptionalText("Decline reason", reason, {
    minLen: 3,
    maxLen: 500,
  });
  if (reasonErr) return { error: reasonErr };
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
  if (!reason.trim()) return { error: "Rejection reason required" };
  const reasonErr = validateOptionalText("Rejection reason", reason, {
    minLen: 3,
    maxLen: 500,
  });
  if (reasonErr) return { error: reasonErr };
  await rejectCase(caseId, session.user.id, reason.trim());
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

export async function updateRescuerNoteAction(caseId: string, note: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageCases(session.user.roles)) return { error: "Unauthorized" };
  const reasonErr = validateOptionalText("Rescuer note", note, {
    minLen: 0,
    maxLen: 1000,
  });
  if (reasonErr) return { error: reasonErr };
  const updated = await updateRescuerNote(caseId, note);
  if (!updated) return { error: "Case not found" };
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

  if (input) {
    const nameErr = validateRequiredAnimalName(input.name);
    if (nameErr) return { error: nameErr };
    if (
      input.sex !== undefined &&
      !isAllowedCatalogOrOther(input.sex, ANIMAL_SEX_OPTIONS)
    ) {
      return { error: "Invalid sex value" };
    }
    if (
      input.estimatedAge !== undefined &&
      !isAllowedCatalogOrOther(input.estimatedAge, ANIMAL_AGE_OPTIONS)
    ) {
      return { error: "Invalid age value" };
    }
    if (
      input.color !== undefined &&
      !isAllowedCatalogOrOther(input.color, COAT_COLOR_OPTIONS)
    ) {
      return { error: "Invalid color value" };
    }
    if (input.breed !== undefined && !isAllowedBreed(input.breed)) {
      return { error: "Invalid breed value" };
    }
    const condErr = validateOptionalText(
      "Initial condition",
      input.initialCondition ?? "",
      { maxLen: 2000 },
    );
    if (condErr) return { error: condErr };
  }

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
  const reasonErr = validateOptionalText("Override reason", reason, {
    minLen: 3,
    maxLen: 500,
  });
  if (reasonErr) return { error: reasonErr };
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return { error: "Urgency score must be between 0 and 100" };
  }
  await overrideUrgency(caseId, score, reason.trim(), session.user.id);
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
    statusChangeNote?: string;
  },
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canEditMedical(session.user.roles))
    return { error: "Unauthorized" };

  if (
    data.generalCondition !== undefined &&
    data.generalCondition.trim() &&
    !isAllowedCatalogOrOther(data.generalCondition, GENERAL_CONDITION_OPTIONS, {
      allowEmpty: true,
      maxLen: 200,
    })
  ) {
    return { error: "Invalid general condition" };
  }

  if (
    data.medicalPriority !== undefined &&
    !isMedicalPriority(data.medicalPriority)
  ) {
    return { error: "Invalid medical priority" };
  }

  for (const [label, value, max] of [
    ["Treatment summary", data.treatmentSummary, 2000],
    ["Restrictions", data.restrictions, 1000],
    ["Veterinarian notes", data.veterinarianNotes, 2000],
    ["Status change note", data.statusChangeNote, 500],
  ] as const) {
    const err = validateOptionalText(label, value ?? "", { maxLen: max });
    if (err) return { error: err };
  }

  const notes = data.veterinarianNotes?.trim() ?? "";
  if (
    (data.clearanceStatus === "under_examination" ||
      data.clearanceStatus === "medically_cleared") &&
    notes.length < 10
  ) {
    return {
      error:
        "Clinical notes are required (at least 10 characters) before this step.",
    };
  }

  let normalizedFollowUp: string | undefined;
  if (data.clearanceStatus === "follow_up_required") {
    const bounds = followUpDateBounds();
    const raw = data.followUpDate?.trim() ?? "";
    // Prefer calendar day (YYYY-MM-DD). If a full ISO datetime arrives, use UTC
    // date parts so timezone conversion does not shift the scheduled day.
    const asDay = /^\d{4}-\d{2}-\d{2}$/.test(raw)
      ? raw
      : (() => {
          const d = new Date(raw);
          if (Number.isNaN(d.getTime())) return "";
          const y = d.getUTCFullYear();
          const m = String(d.getUTCMonth() + 1).padStart(2, "0");
          const day = String(d.getUTCDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        })();
    const dateErr = validateIsoDate(asDay, {
      required: true,
      label: "Follow-up date",
      notBeforeToday: true,
      min: bounds.min,
      max: bounds.max,
    });
    if (dateErr) return { error: dateErr };
    // Store noon UTC so the calendar day is stable across timezones.
    normalizedFollowUp = asDay ? `${asDay}T12:00:00.000Z` : undefined;
  }

  const result = await updateMedicalClearance(animalId, session.user.id, {
    ...data,
    followUpDate: normalizedFollowUp,
    clearanceStatus: data.clearanceStatus as ClearanceStatus,
    statusChangeNote: data.statusChangeNote,
  });

  if (!result.ok) return { error: result.error };

  revalidatePath("/dashboard");
  revalidatePath("/animals");
  revalidatePath("/medical");
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

/** Staff-logged rescue case (web Create flow). Uses the signed-in user as reporter. */
export async function createStaffCaseAction(input: {
  species: string;
  injurySeverity: string;
  environmentalDanger: string;
  vulnerability: string;
  description: string;
  contactPreference?: string;
  locationNote?: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!canManageCases(session.user.roles)) return { error: "Forbidden" };

  const { submitReportAction } = await import("@/app/actions/report");
  return submitReportAction({
    species: input.species as "dog" | "cat" | "bird" | "rabbit" | "other",
    injurySeverity: input.injurySeverity as
      | "none_visible"
      | "minor"
      | "moderate"
      | "severe"
      | "critical",
    environmentalDanger: input.environmentalDanger as
      | "none"
      | "traffic"
      | "weather"
      | "predators"
      | "trapped"
      | "other_danger",
    vulnerability: input.vulnerability as
      | "adult_healthy"
      | "juvenile"
      | "elderly"
      | "pregnant"
      | "nursing"
      | "disabled",
    description: input.description,
    contactPreference: (input.contactPreference ?? "in_app") as
      | "in_app"
      | "phone"
      | "email"
      | "no_contact",
    locationNote: input.locationNote,
    latitude: input.latitude,
    longitude: input.longitude,
    photoUrl: input.photoUrl,
  });
}
