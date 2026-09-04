import "server-only";

import {
  calculateUrgencyScore,
} from "@/lib/urgency/scoring";
import { calculateShelterRecommendations } from "@/lib/routing/shelter-routing";
import { approximateLocation, type Role } from "@/lib/auth/permissions";
import { generateCaseNumber } from "@/lib/utils";
import type {
  AnimalRecord,
  AssignmentRecord,
  ClearanceStatus,
  MedicalClearanceRecord,
  RescueCaseRecord,
  ShelterRecord,
} from "@/lib/data/types";
import { CLEARANCE_STATUSES } from "@/lib/data/types";
import {
  canTransitionClearance,
  formatClearanceStatusLabel,
  isClearanceRollback,
} from "@/lib/data/medical-clearance-workflow";
import { resolveCurrentUrgency, urgencyInputFromCase } from "@/lib/data/urgency";
import { revalidateNotifications } from "@/lib/cache-revalidate";
import { reverseGeocodeLabel } from "@/lib/maps/reverse-geocode";
import { stripEmDashes, stripEmDashesOptional } from "@/lib/text/sanitize-copy";

export { resolveCurrentUrgency } from "@/lib/data/urgency";
export { CLEARANCE_STATUSES, type ClearanceStatus } from "@/lib/data/types";

async function dataRepo() {
  return import("@/lib/data/db/repository");
}

async function pushNotification(input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  caseId?: string;
}) {
  await (await dataRepo()).insertNotification(input);
  revalidateNotifications(input.userId);
}

export type {
  AnimalRecord,
  AssignmentRecord,
  RescueCaseRecord,
  ShelterRecord,
  AppUser,
  RecommendationRecord,
  MedicalClearanceRecord,
  StatusHistoryRecord,
  NotificationRecord,
  HandoffRecord,
  AnimalNoteRecord,
  AdoptionApplicationRecord,
} from "@/lib/data/types";

export type DemoCase = RescueCaseRecord;
export type DemoAnimal = AnimalRecord;

const STATUSES_WITH_SHELTER_RECOMMENDATIONS = new Set([
  "verified",
  "rescuer_assigned",
  "rescue_accepted", // legacy
  "rescue_in_progress", // legacy
  "animal_secured",
  "awaiting_shelter", // legacy
]);

export async function getCases(filters?: {
  status?: string;
  urgencyLevel?: string;
  rescuerId?: string;
  shelterId?: string;
  reporterId?: string;
  search?: string;
  sortBy?: "urgency" | "waiting" | "date";
}): Promise<RescueCaseRecord[]> {
  return (await dataRepo()).fetchCases(filters);
}

export async function getCaseById(id: string) {
  return (await dataRepo()).fetchCaseById(id);
}

export function getCaseLocation(
  caseItem: RescueCaseRecord,
  roles: Role[],
  canExact: boolean,
) {
  if (canExact) {
    return { latitude: caseItem.latitude, longitude: caseItem.longitude };
  }
  return {
    latitude: caseItem.approximateLatitude,
    longitude: caseItem.approximateLongitude,
  };
}

export async function getAssignmentsForCases(caseIds: string[]) {
  return (await dataRepo()).fetchAssignmentsForCases(caseIds);
}

export async function getAssignmentsForCase(caseId: string) {
  return (await dataRepo()).fetchAssignmentsForCase(caseId);
}

export async function getAssignmentById(id: string) {
  return (await dataRepo()).fetchAssignmentById(id);
}

export async function getAdministratorMobileCases(): Promise<RescueCaseRecord[]> {
  const caseIds = new Set(await (await dataRepo()).fetchAdministratorMobileCaseIds());
  const cases = await getCases();
  return cases.filter((c) => caseIds.has(c.id));
}

export async function getFirstPendingAssignment() {
  const id = await (await dataRepo()).fetchFirstPendingAssignmentId();
  if (!id) return null;
  return (await dataRepo()).fetchAssignmentById(id);
}

export async function canAccessAssignment(
  assignmentId: string,
  userId: string,
  options?: { adminOverride?: boolean },
): Promise<boolean> {
  const assignment = await getAssignmentById(assignmentId);
  if (!assignment) return false;
  if (options?.adminOverride) return true;
  return assignment.rescuerId === userId;
}

export async function getRecommendationsForCase(caseId: string) {
  const existing = await (await dataRepo()).fetchRecommendationsForCase(caseId);
  if (existing.length > 0) return existing;

  const caseItem = await getCaseById(caseId);
  if (
    caseItem &&
    caseItem.verifiedAt &&
    STATUSES_WITH_SHELTER_RECOMMENDATIONS.has(caseItem.status)
  ) {
    await generateRecommendationsForCase(caseId);
    return (await dataRepo()).fetchRecommendationsForCase(caseId);
  }

  return [];
}

export async function getStatusHistoryForCase(caseId: string) {
  return (await dataRepo()).fetchStatusHistoryForCase(caseId);
}

export async function getHandoffForCase(caseId: string) {
  return (await dataRepo()).fetchHandoffForCase(caseId);
}

export async function getAnimals(filters?: {
  search?: string;
  shelterId?: string;
  clearanceStatus?: string;
}) {
  return (await dataRepo()).fetchAnimals(filters);
}

export async function getAnimalById(id: string) {
  return (await dataRepo()).fetchAnimalById(id);
}

export async function getMedicalClearanceForAnimal(animalId: string) {
  return (await dataRepo()).fetchMedicalClearanceForAnimal(animalId);
}

export async function getAllMedicalClearances() {
  return (await dataRepo()).fetchAllMedicalClearances();
}

/** Animals in the veterinary clearance pipeline, with clearance details. */
export async function getMedicalQueue(): Promise<
  {
    animal: AnimalRecord;
    clearance: MedicalClearanceRecord | null;
  }[]
> {
  const [animals, clearances] = await Promise.all([
    getAnimals(),
    getAllMedicalClearances(),
  ]);
  const clearanceByAnimal = new Map(clearances.map((c) => [c.animalId, c]));

  return animals
    .filter(
      (a) =>
        a.clearanceStatus !== "medically_cleared" ||
        // Still on medical pathway (includes legacy "behavior_assessment" rows).
        a.pathwayStage === "medical_clearance" ||
        a.pathwayStage === "behavior_assessment",
    )
    .map((animal) => ({
      animal,
      clearance: clearanceByAnimal.get(animal.id) ?? null,
    }))
    .sort((a, b) => {
      const order: Record<string, number> = {
        awaiting_examination: 0,
        under_examination: 1,
        under_treatment: 2,
        follow_up_required: 3,
        medically_cleared: 4,
      };
      const ao = order[a.animal.clearanceStatus] ?? 9;
      const bo = order[b.animal.clearanceStatus] ?? 9;
      if (ao !== bo) return ao - bo;
      return (a.animal.name ?? a.animal.temporaryId).localeCompare(
        b.animal.name ?? b.animal.temporaryId,
      );
    });
}

export async function getNotesForAnimal(animalId: string) {
  return (await dataRepo()).fetchNotesForAnimal(animalId);
}

export async function getShelters() {
  return (await dataRepo()).fetchShelters();
}

export async function getShelterById(id: string) {
  return (await dataRepo()).fetchShelterById(id);
}

export async function getNotificationsForUser(userId: string) {
  return (await dataRepo()).fetchNotificationsForUser(userId);
}

export async function getRescuers() {
  return (await dataRepo()).fetchRescuers();
}

export async function getDashboardMetrics() {
  const [cases, animals, shelters, handoffs] = await Promise.all([
    getCases(),
    getAnimals(),
    getShelters(),
    (await dataRepo()).fetchCases(),
  ]);

  const activeCases = cases.filter(
    (c) =>
      !["completed", "rejected", "duplicate", "cancelled"].includes(c.status),
  ); // terminal / closed stages
  const criticalHigh = activeCases.filter((c) => {
    const level = resolveCurrentUrgency(c).level;
    return level === "critical" || level === "high";
  });

  const assignmentsByCase = new Map<string, AssignmentRecord[]>();
  for (const c of activeCases) {
    if (c.activeRescuerId) {
      assignmentsByCase.set(c.id, [
        {
          id: "",
          caseId: c.id,
          rescuerId: c.activeRescuerId,
          rescuerName: "",
          status: "accepted",
          assignedAt: c.createdAt,
        },
      ]);
    }
  }

  const unassigned = activeCases.filter(
    (c) =>
      c.status === "verified" ||
      (c.status === "rescuer_assigned" && !c.activeRescuerId),
  );

  const awaitingMedical = animals.filter(
    (a) =>
      a.clearanceStatus === "awaiting_examination" ||
      a.clearanceStatus === "under_examination" ||
      a.clearanceStatus === "follow_up_required",
  );
  const underTreatment = animals.filter(
    (a) => a.clearanceStatus === "under_treatment",
  );
  const completed = cases.filter((c) => c.status === "completed");
  const totalCapacity = shelters.reduce((s, sh) => s + sh.totalCapacity, 0);
  const totalOccupancy = shelters.reduce(
    (s, sh) => s + sh.currentOccupancy,
    0,
  );

  const criticalCount = criticalHigh.filter(
    (c) => resolveCurrentUrgency(c).level === "critical",
  ).length;
  const highCount = criticalHigh.filter(
    (c) => resolveCurrentUrgency(c).level === "high",
  ).length;
  const assignedCases = activeCases.length - unassigned.length;

  return {
    activeCases: activeCases.length,
    criticalHigh: criticalHigh.length,
    criticalCount,
    highCount,
    unassigned: unassigned.length,
    assignedCases,
    awaitingMedical: awaitingMedical.length,
    awaitingExam: awaitingMedical.filter(
      (a) => a.clearanceStatus === "awaiting_examination",
    ).length,
    underExam: awaitingMedical.filter(
      (a) => a.clearanceStatus === "under_examination",
    ).length,
    followUpRequired: awaitingMedical.filter(
      (a) => a.clearanceStatus === "follow_up_required",
    ).length,
    underTreatment: underTreatment.length,
    completed: completed.length,
    capacityUsed: totalOccupancy,
    capacityTotal: totalCapacity,
    recentHandoffs: [],
    waitingForRescuer: unassigned,
    criticalCases: criticalHigh
      .sort(
        (a, b) =>
          resolveCurrentUrgency(b).score - resolveCurrentUrgency(a).score,
      )
      .slice(0, 5),
  };
}

export interface ReportInput {
  reporterId: string;
  species: string;
  injurySeverity: string;
  environmentalDanger: string;
  vulnerability: string;
  description: string;
  contactPreference: string;
  locationNote?: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

export async function submitReport(input: ReportInput): Promise<RescueCaseRecord> {
  const approx = approximateLocation(input.latitude, input.longitude);
  const geocodedLabel = await reverseGeocodeLabel(
    input.latitude,
    input.longitude,
  );
  return (await dataRepo()).insertReportBundle({
    reporterId: input.reporterId,
    species: input.species,
    injurySeverity: input.injurySeverity,
    environmentalDanger: input.environmentalDanger,
    vulnerability: input.vulnerability,
    description: stripEmDashes(input.description),
    contactPreference: input.contactPreference,
    locationLabel: geocodedLabel ?? undefined,
    locationNote: stripEmDashesOptional(input.locationNote),
    latitude: input.latitude,
    longitude: input.longitude,
    approximateLatitude: approx.latitude,
    approximateLongitude: approx.longitude,
    caseNumber: generateCaseNumber(),
    photoUrl: input.photoUrl,
  });
}

export async function verifyCase(
  caseId: string,
  staffId: string,
): Promise<RescueCaseRecord | undefined> {
  const caseItem = await getCaseById(caseId);
  if (!caseItem) return undefined;

  const verifiedAt = new Date();
  const urgency = calculateUrgencyScore({
    ...urgencyInputFromCase(caseItem, verifiedAt),
  });

  await (await dataRepo()).updateRescueCase(caseId, {
    status: "verified",
    verifiedAt,
    verifiedById: staffId,
    urgencyScore: urgency.score,
    urgencyLevel: urgency.level,
  });

  await (await dataRepo()).insertStatusHistory({
    caseId,
    fromStatus: caseItem.status,
    toStatus: "verified",
    changedById: staffId,
  });

  return getCaseById(caseId) as Promise<RescueCaseRecord>;
}

export async function rejectCase(
  caseId: string,
  staffId: string,
  reason: string,
): Promise<RescueCaseRecord | undefined> {
  const caseItem = await getCaseById(caseId);
  if (!caseItem) return undefined;

  await (await dataRepo()).updateRescueCase(caseId, {
    status: "rejected",
    rejectionReason: reason,
  });

  return getCaseById(caseId) as Promise<RescueCaseRecord>;
}

export async function assignRescuer(
  caseId: string,
  rescuerId: string,
  staffId: string,
): Promise<void> {
  const [rescuer, caseItem] = await Promise.all([
    (await dataRepo()).fetchUserById(rescuerId),
    getCaseById(caseId),
  ]);
  if (!caseItem || !rescuer) return;

  await (await dataRepo()).insertAssignment({
    caseId,
    rescuerId,
    assignedById: staffId,
  });

  await (await dataRepo()).updateRescueCase(caseId, { status: "rescuer_assigned" });

  await (await dataRepo()).insertStatusHistory({
    caseId,
    fromStatus: caseItem.status,
    toStatus: "rescuer_assigned",
    changedById: staffId,
    note: `Assigned ${rescuer.name}`,
  });
}

export async function updateRescuerNote(
  caseId: string,
  note: string,
): Promise<RescueCaseRecord | undefined> {
  const caseItem = await getCaseById(caseId);
  if (!caseItem) return undefined;

  const trimmed = stripEmDashes(note);
  await (await dataRepo()).updateRescueCase(caseId, {
    rescuerNote: trimmed || null,
  });

  return getCaseById(caseId) as Promise<RescueCaseRecord>;
}

export async function acceptAssignment(
  assignmentId: string,
  rescuerId: string,
  options?: { adminOverride?: boolean },
): Promise<boolean> {
  const assignment = await getAssignmentById(assignmentId);
  if (!assignment) return false;
  if (!options?.adminOverride && assignment.rescuerId !== rescuerId) return false;
  if (assignment.status !== "pending") return false;

  await (await dataRepo()).updateAssignment(assignmentId, {
    status: "accepted",
    respondedAt: new Date(),
  });

  const caseItem = await getCaseById(assignment.caseId);
  if (!caseItem) return false;

  // Hybrid flow: case stays rescuer_assigned; assignment acceptance is tracked on the assignment row.
  await (await dataRepo()).insertStatusHistory({
    caseId: assignment.caseId,
    fromStatus: caseItem.status,
    toStatus: caseItem.status,
    changedById: rescuerId,
    note: "Assignment accepted",
  });

  return true;
}

export async function declineAssignment(
  assignmentId: string,
  rescuerId: string,
  reason: string,
  options?: { adminOverride?: boolean },
): Promise<boolean> {
  const assignment = await getAssignmentById(assignmentId);
  if (!assignment) return false;
  if (!options?.adminOverride && assignment.rescuerId !== rescuerId) return false;
  if (assignment.status !== "pending") return false;

  await (await dataRepo()).updateAssignment(assignmentId, {
    status: "declined",
    declineReason: reason,
    respondedAt: new Date(),
  });

  const caseItem = await getCaseById(assignment.caseId);
  const withRescuer =
    caseItem &&
    ["rescuer_assigned", "rescue_accepted", "rescue_in_progress"].includes(
      caseItem.status,
    );
  if (caseItem && withRescuer) {
    await (await dataRepo()).updateRescueCase(assignment.caseId, { status: "verified" });
    await (await dataRepo()).insertStatusHistory({
      caseId: assignment.caseId,
      fromStatus: caseItem.status,
      toStatus: "verified",
      changedById: rescuerId,
      note: `Assignment declined: ${reason}`,
    });
  }

  return true;
}

/** Hybrid: accepted assignment may mark animal secured in one step. Legacy mid-statuses still allow forward moves. */
const RESCUER_CASE_TRANSITIONS: Record<string, string[]> = {
  rescuer_assigned: ["animal_secured"],
  rescue_accepted: ["animal_secured"],
  rescue_in_progress: ["animal_secured"],
};

export async function updateCaseStatusAsRescuer(
  caseId: string,
  rescuerId: string,
  newStatus: string,
  options?: { adminOverride?: boolean },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const assignments = await getAssignmentsForCase(caseId);
  const assignment = assignments.find(
    (a) =>
      a.status === "accepted" &&
      (options?.adminOverride || a.rescuerId === rescuerId),
  );
  if (!assignment) {
    return { ok: false, error: "No active assignment for this case" };
  }

  const caseItem = await getCaseById(caseId);
  if (!caseItem) {
    return { ok: false, error: "Case not found" };
  }

  const allowed = RESCUER_CASE_TRANSITIONS[caseItem.status];
  if (!allowed?.includes(newStatus)) {
    return { ok: false, error: "Invalid status transition" };
  }

  await updateCaseStatus(caseId, newStatus, rescuerId);
  return { ok: true };
}

export async function updateCaseStatus(
  caseId: string,
  newStatus: string,
  userId: string,
  note?: string,
): Promise<void> {
  const caseItem = await getCaseById(caseId);
  if (!caseItem) return;

  await (await dataRepo()).updateRescueCase(caseId, {
    status: newStatus as typeof import("@/db/schema").rescueCases.$inferInsert.status,
  });

  await (await dataRepo()).insertStatusHistory({
    caseId,
    fromStatus: caseItem.status,
    toStatus: newStatus,
    changedById: userId,
    note,
  });
}

export async function generateRecommendationsForCase(caseId: string): Promise<void> {
  const caseItem = await getCaseById(caseId);
  if (!caseItem) return;

  const shelterList = await getShelters();
  const requiredCaps =
    caseItem.injurySeverity === "severe" || caseItem.injurySeverity === "critical"
      ? ["emergency surgery", "wound care"]
      : caseItem.injurySeverity === "moderate"
        ? ["wound care", "orthopedic treatment"]
        : [];

  const recs = calculateShelterRecommendations(
    shelterList.map((s) => ({
      id: s.id,
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
      speciesAccepted: s.speciesAccepted,
      capabilities: s.capabilities,
      totalCapacity: s.totalCapacity,
      currentOccupancy: s.currentOccupancy,
      operationalWorkload: s.operationalWorkload,
    })),
    {
      caseLatitude: caseItem.latitude,
      caseLongitude: caseItem.longitude,
      species: caseItem.species as "dog",
      requiredCapabilities: requiredCaps,
    },
  );

  await (await dataRepo()).replaceRecommendationsForCase(
    caseId,
    recs.map((r, i) => ({
      shelterId: r.shelterId,
      shelterName: r.shelterName,
      matchScore: r.matchScore,
      distanceKm: r.distanceKm,
      reasons: r.reasons,
      warnings: r.warnings,
      missingCapabilities: r.missingCapabilities,
      rank: r.rank,
      status: "recommended",
    })),
  );
}

export async function selectShelter(
  caseId: string,
  shelterId: string,
  staffId: string,
  rejectionReason?: string,
): Promise<void> {
  const caseItem = await getCaseById(caseId);
  if (!caseItem) return;

  await (await dataRepo()).updateRecommendationStatuses(caseId, shelterId, rejectionReason);
  await (await dataRepo()).updateRescueCase(caseId, { assignedShelterId: shelterId });

  const shelter = await getShelterById(shelterId);
  await (await dataRepo()).insertStatusHistory({
    caseId,
    fromStatus: caseItem.status,
    toStatus: caseItem.status,
    changedById: staffId,
    note: `Destination confirmed: ${shelter?.name ?? "Shelter"}`,
  });
}

const HANDOFF_ELIGIBLE_STATUSES = new Set([
  "animal_secured",
  "awaiting_shelter", // legacy
]);

export async function confirmShelterHandoff(
  caseId: string,
  shelterId: string,
  staffId: string,
  notes?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const caseItem = await getCaseById(caseId);
  if (!caseItem) return { ok: false, error: "Case not found" };

  if (["rejected", "duplicate", "cancelled", "completed"].includes(caseItem.status)) {
    return { ok: false, error: "Cannot hand off a closed case" };
  }
  if (caseItem.status === "shelter_handoff") {
    return { ok: true };
  }
  const existingHandoff = await getHandoffForCase(caseId);
  if (existingHandoff) {
    await updateCaseStatus(
      caseId,
      "shelter_handoff",
      staffId,
      "Shelter handoff confirmed",
    );
    return { ok: true };
  }
  if (!HANDOFF_ELIGIBLE_STATUSES.has(caseItem.status)) {
    return { ok: false, error: "Case is not ready for shelter handoff" };
  }
  if (!caseItem.assignedShelterId) {
    return { ok: false, error: "No destination shelter confirmed" };
  }
  if (caseItem.assignedShelterId !== shelterId) {
    return {
      ok: false,
      error: "Destination shelter does not match confirmed assignment",
    };
  }

  const history = await getStatusHistoryForCase(caseId);
  const animalWasSecured =
    caseItem.status === "animal_secured" ||
    caseItem.status === "awaiting_shelter" ||
    history.some((h) => h.toStatus === "animal_secured");
  if (!animalWasSecured) {
    return { ok: false, error: "Animal must be secured before shelter handoff" };
  }

  const assignments = await getAssignmentsForCase(caseId);
  const assignment = assignments.find((a) => a.status === "accepted");

  await (await dataRepo()).insertHandoff({
    caseId,
    shelterId,
    confirmedByRescuerId: assignment?.rescuerId,
    confirmedByStaffId: staffId,
    handoffNotes: notes?.trim() || undefined,
  });

  await updateCaseStatus(
    caseId,
    "shelter_handoff",
    staffId,
    notes?.trim() || "Shelter handoff confirmed",
  );

  if (assignment) {
    await (await dataRepo()).updateAssignment(assignment.id, { status: "completed" });
  }

  const reporter = await (await dataRepo()).fetchUserById(caseItem.reporterId);
  if (reporter) {
    await pushNotification({
      userId: reporter.id,
      type: "status_update",
      title: "Animal is safe at shelter",
      message:
        "Your reported animal has been safely transferred to a shelter and is receiving care.",
      caseId,
    });
  }

  return { ok: true };
}

export interface ShelterIntakeInput {
  name?: string;
  estimatedAge?: string;
  sex?: string;
  breed?: string;
  color?: string;
  initialCondition?: string;
}

export async function completeShelterIntake(
  caseId: string,
  staffId: string,
  input?: ShelterIntakeInput,
): Promise<{ ok: true; animalId: string } | { ok: false; error: string }> {
  const caseItem = await getCaseById(caseId);
  if (!caseItem) return { ok: false, error: "Case not found" };

  if (caseItem.animalId) {
    if (caseItem.status === "shelter_handoff") {
      await updateCaseStatus(
        caseId,
        "completed",
        staffId,
        "Shelter intake completed",
      );
    }
    return { ok: true, animalId: caseItem.animalId };
  }

  if (caseItem.status !== "shelter_handoff") {
    return { ok: false, error: "Shelter handoff must be completed before intake" };
  }

  const handoff = await getHandoffForCase(caseId);
  if (!handoff) return { ok: false, error: "No handoff record found" };

  const existingAnimal = await (await dataRepo()).fetchAnimalByRescueCaseId(caseId);
  if (existingAnimal) {
    await (await dataRepo()).updateRescueCase(caseId, { animalId: existingAnimal.id });
    if (caseItem.status === "shelter_handoff") {
      await updateCaseStatus(
        caseId,
        "completed",
        staffId,
        "Shelter intake completed",
      );
    }
    return { ok: true, animalId: existingAnimal.id };
  }

  const staff = await (await dataRepo()).fetchUserById(staffId);
  const temporaryId = `A-${caseItem.caseNumber.replace("RC-", "")}`;

  const animal = await (await dataRepo()).insertAnimal(
    {
      temporaryId,
      name: input?.name?.trim() || undefined,
      species: caseItem.species as typeof import("@/db/schema").animals.$inferInsert.species,
      estimatedAge: input?.estimatedAge?.trim() || undefined,
      sex: input?.sex?.trim() || undefined,
      breed: input?.breed?.trim() || undefined,
      color: input?.color?.trim() || undefined,
      rescueCaseId: caseId,
      shelterId: handoff.shelterId,
      intakeDate: new Date(),
      pathwayStage: "medical_clearance",
      recommendedNextAction: "Schedule veterinary examination",
      photoUrl: caseItem.photoUrl,
    },
    "awaiting_examination",
  );

  await (await dataRepo()).updateRescueCase(caseId, { animalId: animal.id });

  if (input?.initialCondition?.trim()) {
    await (await dataRepo()).insertAnimalNote({
      animalId: animal.id,
      authorId: staffId,
      noteType: "staff",
      content: `Initial condition at intake: ${input.initialCondition.trim()}`,
    });
  }

  if (!handoff.intakeCompletedAt) {
    const shelter = await getShelterById(handoff.shelterId);
    if (shelter && shelter.currentOccupancy < shelter.totalCapacity) {
      await updateShelterCapacity(
        handoff.shelterId,
        shelter.totalCapacity,
        shelter.currentOccupancy + 1,
      );
    }
    await (await dataRepo()).markHandoffIntakeComplete(handoff.id);
  }

  await updateCaseStatus(
    caseId,
    "completed",
    staffId,
    "Shelter intake completed",
  );

  const vets = await (await dataRepo()).fetchStaffUsersByRole("veterinarian");
  const vet = vets[0];
  if (vet) {
    await pushNotification({
      userId: vet.id,
      type: "system",
      title: "New animal awaiting examination",
      message: `${temporaryId} (${caseItem.species}) requires veterinary examination.`,
      caseId,
    });
  }

  return { ok: true, animalId: animal.id };
}

function recommendedActionForClearance(status: ClearanceStatus): string {
  switch (status) {
    case "awaiting_examination":
      return "Schedule veterinary examination";
    case "under_examination":
      return "Complete veterinary examination";
    case "under_treatment":
      return "Continue treatment and monitor recovery";
    case "follow_up_required":
      return "Schedule follow-up veterinary examination";
    case "medically_cleared":
      return "Transfer to adoption or foster";
    default:
      return "Review animal status";
  }
}

export interface MedicalClearanceInput {
  examinationDate?: string;
  generalCondition?: string;
  medicalPriority?: string;
  treatmentSummary?: string;
  restrictions?: string;
  followUpDate?: string;
  clearanceStatus: ClearanceStatus;
  veterinarianNotes?: string;
  /** Optional note recorded when correcting / rolling back clearance status. */
  statusChangeNote?: string;
}

export async function updateMedicalClearance(
  animalId: string,
  vetId: string,
  data: MedicalClearanceInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const animal = await getAnimalById(animalId);
  if (!animal) return { ok: false, error: "Animal not found" };

  const currentStatus = animal.clearanceStatus as ClearanceStatus;
  const targetStatus = data.clearanceStatus;

  if (!CLEARANCE_STATUSES.includes(targetStatus)) {
    return { ok: false, error: "Invalid clearance status" };
  }

  const rollback = isClearanceRollback(currentStatus, targetStatus);

  if (targetStatus !== currentStatus) {
    const transition = canTransitionClearance(
      currentStatus,
      targetStatus,
      animal.pathwayStage,
    );
    if (!transition.ok) {
      return { ok: false, error: transition.error };
    }
  }

  const recordingExam =
    !rollback &&
    (currentStatus === "awaiting_examination" ||
      currentStatus === "under_examination");
  const completingExam =
    recordingExam &&
    (targetStatus === "under_treatment" ||
      targetStatus === "follow_up_required" ||
      targetStatus === "medically_cleared");

  const existing = await getMedicalClearanceForAnimal(animalId);

  if (completingExam && !data.generalCondition?.trim()) {
    return { ok: false, error: "General condition is required to record examination" };
  }
  if (
    !rollback &&
    targetStatus === "under_treatment" &&
    targetStatus !== currentStatus &&
    !data.treatmentSummary?.trim() &&
    !existing?.treatmentSummary?.trim()
  ) {
    return { ok: false, error: "Treatment summary is required for under treatment" };
  }
  if (
    !rollback &&
    targetStatus === "follow_up_required" &&
    targetStatus !== currentStatus &&
    !data.followUpDate
  ) {
    return { ok: false, error: "Follow-up date is required" };
  }

  const examinationDate =
    data.examinationDate ??
    existing?.examinationDate ??
    (!rollback &&
    (completingExam || targetStatus === "under_examination")
      ? new Date().toISOString()
      : undefined);

  const clearFollowUp =
    rollback &&
    currentStatus === "follow_up_required" &&
    targetStatus !== "follow_up_required";

  const followUpDate = clearFollowUp
    ? null
    : data.followUpDate
      ? new Date(data.followUpDate)
      : existing?.followUpDate
        ? new Date(existing.followUpDate)
        : undefined;

  await (await dataRepo()).upsertMedicalClearance(animalId, {
    generalCondition: data.generalCondition ?? existing?.generalCondition,
    medicalPriority:
      (data.medicalPriority as typeof import("@/db/schema").medicalClearances.$inferInsert.medicalPriority) ??
      (existing?.medicalPriority as typeof import("@/db/schema").medicalClearances.$inferInsert.medicalPriority),
    treatmentSummary:
      data.treatmentSummary?.trim() || existing?.treatmentSummary,
    restrictions: data.restrictions ?? existing?.restrictions,
    followUpDate,
    veterinarianNotes: data.veterinarianNotes ?? existing?.veterinarianNotes,
    examinationDate: examinationDate ? new Date(examinationDate) : undefined,
    clearanceStatus: targetStatus,
    veterinarianId: vetId,
  });

  // Cleared animals stay on Medical until staff transfer to adoption/foster.
  // Do not clobber placement pathways if medical notes are edited after listing.
  const preservePlacement =
    targetStatus === "medically_cleared" &&
    (animal.pathwayStage === "ready_for_adoption" ||
      animal.pathwayStage === "ready_for_foster" ||
      animal.pathwayStage === "transferred");
  const pathwayStage = preservePlacement
    ? (animal.pathwayStage as
        | "ready_for_adoption"
        | "ready_for_foster"
        | "transferred")
    : "medical_clearance";

  await (await dataRepo()).updateAnimalFields(animalId, {
    pathwayStage,
    recommendedNextAction: recommendedActionForClearance(targetStatus),
  });

  if (rollback && targetStatus !== currentStatus) {
    const noteBody = data.statusChangeNote?.trim();
    const fromLabel = formatClearanceStatusLabel(currentStatus);
    const toLabel = formatClearanceStatusLabel(targetStatus);
    const content = noteBody
      ? `Medical clearance corrected: ${fromLabel} → ${toLabel}. ${noteBody}`
      : `Medical clearance corrected: ${fromLabel} → ${toLabel}.`;
    await (await dataRepo()).insertAnimalNote({
      animalId,
      authorId: vetId,
      noteType: "staff",
      content,
    });
  }

  if (targetStatus === "medically_cleared") {
    const staffUsers = await (await dataRepo()).fetchStaffUsersByRole("shelter_staff");
    for (const staff of staffUsers) {
      await pushNotification({
        userId: staff.id,
        type: "system",
        title: "Animal medically cleared",
        message: `${animal.temporaryId}${animal.name ? ` (${animal.name})` : ""} is medically cleared and ready to transfer to adoption or foster.`,
        caseId: animal.rescueCaseId,
      });
    }
  }

  return { ok: true };
}

export async function overrideUrgency(
  caseId: string,
  score: number,
  reason: string,
  staffId: string,
): Promise<void> {
  void staffId;
  await (await dataRepo()).updateRescueCase(caseId, {
    urgencyOverrideScore: score,
    urgencyOverrideReason: reason,
    urgencyScore: score,
    urgencyLevel:
      score >= 80
        ? "critical"
        : score >= 60
          ? "high"
          : score >= 30
            ? "medium"
            : "low",
  });
}

export async function updateShelterCapacity(
  shelterId: string,
  totalCapacity: number,
  currentOccupancy: number,
): Promise<void> {
  await (await dataRepo()).updateShelterCapacityRow(
    shelterId,
    totalCapacity,
    currentOccupancy,
  );
}

export async function updateShelterCapabilities(
  shelterId: string,
  capabilities: string[],
): Promise<void> {
  await (await dataRepo()).replaceShelterCapabilities(shelterId, capabilities);
}

export async function getAdoptionReadyAnimals() {
  return (await dataRepo()).fetchAdoptionReadyAnimals();
}

export async function getAdoptionQueueForUser(userId: string) {
  const [ready, decidedIds] = await Promise.all([
    getAdoptionReadyAnimals(),
    (await dataRepo()).fetchAdoptionInterestAnimalIds(userId),
  ]);
  const decided = new Set(decidedIds);
  return ready.filter((animal) => !decided.has(animal.id));
}

/** Mobile adoption: swipe queue, liked-but-not-applied, and full browse list. */
export async function getAdoptionMobileDataForUser(
  userId: string,
  applicantEmail: string,
) {
  const [ready, interests, applications] = await Promise.all([
    getAdoptionReadyAnimals(),
    (await dataRepo()).fetchAdoptionInterestsForUser(userId),
    getAdoptionApplications(),
  ]);

  const email = applicantEmail.trim().toLowerCase();
  const appliedAnimalIds = new Set(
    applications
      .filter((a) => a.applicantEmail.trim().toLowerCase() === email)
      .map((a) => a.animalId),
  );

  const interestByAnimal = new Map(
    interests.map((i) => [i.animalId, i.decision] as const),
  );

  const queue = ready.filter((animal) => !interestByAnimal.has(animal.id));
  const interested = ready.filter((animal) => {
    if (interestByAnimal.get(animal.id) !== "interested") return false;
    return !appliedAnimalIds.has(animal.id);
  });

  return {
    queue,
    interested,
    browse: ready,
    appliedAnimalIds: [...appliedAnimalIds],
    passedCount: interests.filter((i) => i.decision === "pass").length,
  };
}

export async function recordAdoptionInterest(
  userId: string,
  animalId: string,
  decision: "pass" | "interested",
) {
  const animal = await getAnimalById(animalId);
  if (!animal) {
    return { ok: false as const, error: "Animal not found" };
  }
  if (
    animal.pathwayStage !== "ready_for_adoption" &&
    animal.pathwayStage !== "ready_for_foster"
  ) {
    return { ok: false as const, error: "Animal is not available for adoption" };
  }
  await (await dataRepo()).upsertAdoptionInterest({
    userId,
    animalId,
    decision,
  });
  return { ok: true as const };
}

export async function clearAdoptionInterests(
  userId: string,
  scope: "pass" | "all" = "pass",
) {
  const removed = await (await dataRepo()).deleteAdoptionInterestsForUser(
    userId,
    scope === "pass" ? "pass" : undefined,
  );
  return { ok: true as const, removed };
}

/** Remove one swipe decision (like or pass) for a single animal. */
export async function clearAdoptionInterestForAnimal(
  userId: string,
  animalId: string,
) {
  const removed = await (await dataRepo()).deleteAdoptionInterestForAnimal(
    userId,
    animalId,
  );
  return { ok: true as const, removed };
}

export async function getAdoptionApplications(filters?: {
  status?: string;
  animalId?: string;
}) {
  return (await dataRepo()).fetchAdoptionApplications(filters);
}

export async function createAdoptionApplication(input: {
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
  const animal = await getAnimalById(input.animalId);
  if (!animal) {
    return { ok: false as const, error: "Animal not found" };
  }

  const application = await (await dataRepo()).insertAdoptionApplication(input);

  const staffUsers = await (await dataRepo()).fetchStaffUsersByRole(
    "shelter_staff",
  );
  for (const staff of staffUsers) {
    await pushNotification({
      userId: staff.id,
      type: "adoption",
      title: "New adoption application",
      message: `${input.applicantName} applied for ${animal.name ?? animal.temporaryId}.`,
      caseId: animal.rescueCaseId,
    });
  }

  return { ok: true as const, application };
}

export async function reviewAdoptionApplication(
  id: string,
  status: "approved" | "rejected" | "under_review" | "withdrawn" | "completed",
  reviewerId: string,
  notes?: string,
) {
  const existing = await (await dataRepo()).fetchAdoptionApplicationById(id);
  if (!existing) {
    return { ok: false as const, error: "Application not found" };
  }

  const decided =
    status === "approved" ||
    status === "rejected" ||
    status === "completed" ||
    status === "withdrawn";

  await (await dataRepo()).updateAdoptionApplication(id, {
    status,
    reviewedById: reviewerId,
    reviewNotes: notes,
    decidedAt: decided ? new Date() : null,
  });

  if (status === "approved") {
    const animal = await getAnimalById(existing.animalId);
    await (await dataRepo()).updateAnimalFields(existing.animalId, {
      pathwayStage: "transferred",
      recommendedNextAction: "Adoption completed",
    });

    const staffUsers = await (await dataRepo()).fetchStaffUsersByRole(
      "shelter_staff",
    );
    const label = animal?.name ?? animal?.temporaryId ?? existing.animalId;
    for (const staff of staffUsers) {
      await pushNotification({
        userId: staff.id,
        type: "adoption",
        title: "Adoption approved",
        message: `Application for ${label} by ${existing.applicantName} was approved. Animal marked as transferred.`,
        caseId: animal?.rescueCaseId,
      });
    }
  }

  return { ok: true as const };
}

export async function updateAnimalProfile(
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
  const animal = await getAnimalById(id);
  if (!animal) {
    return { ok: false as const, error: "Animal not found" };
  }

  await (await dataRepo()).updateAnimalFields(id, {
    ...(fields.name !== undefined ? { name: fields.name } : {}),
    ...(fields.bio !== undefined ? { bio: fields.bio } : {}),
    ...(fields.temperament !== undefined
      ? { temperament: fields.temperament }
      : {}),
    ...(fields.pathwayStage !== undefined
      ? {
          pathwayStage:
            fields.pathwayStage as typeof import("@/db/schema").animals.$inferInsert.pathwayStage,
        }
      : {}),
    ...(fields.sex !== undefined ? { sex: fields.sex } : {}),
    ...(fields.estimatedAge !== undefined
      ? { estimatedAge: fields.estimatedAge }
      : {}),
    ...(fields.breed !== undefined ? { breed: fields.breed } : {}),
    ...(fields.color !== undefined ? { color: fields.color } : {}),
    ...(fields.recommendedNextAction !== undefined
      ? { recommendedNextAction: fields.recommendedNextAction }
      : {}),
    ...(fields.photoUrl !== undefined ? { photoUrl: fields.photoUrl } : {}),
  });

  return { ok: true as const };
}

/**
 * After medical clearance, move the animal onto the adoption (or foster) listing pathway.
 */
export async function transferClearedAnimalToAdoption(
  animalId: string,
  destination: "ready_for_adoption" | "ready_for_foster" = "ready_for_adoption",
) {
  const animal = await getAnimalById(animalId);
  if (!animal) {
    return { ok: false as const, error: "Animal not found" };
  }
  if (animal.clearanceStatus !== "medically_cleared") {
    return {
      ok: false as const,
      error: "Animal must be medically cleared before transfer to adoption",
    };
  }
  if (animal.pathwayStage === destination) {
    return { ok: true as const, alreadyReady: true as const };
  }

  await (await dataRepo()).updateAnimalFields(animalId, {
    pathwayStage: destination,
    recommendedNextAction:
      destination === "ready_for_foster"
        ? "List for foster placement"
        : "List for adoption",
  });

  return { ok: true as const, alreadyReady: false as const };
}

export async function deleteAnimal(id: string) {
  const animal = await getAnimalById(id);
  if (!animal) {
    return { ok: false as const, error: "Animal not found" };
  }

  const deleted = await (await dataRepo()).deleteAnimalById(id);
  if (!deleted) {
    return { ok: false as const, error: "Failed to delete animal" };
  }

  return { ok: true as const };
}
