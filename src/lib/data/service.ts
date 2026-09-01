import {
  DEMO_CASES,
  DEMO_ASSIGNMENTS,
  DEMO_ANIMALS,
  DEMO_SHELTERS,
  DEMO_RECOMMENDATIONS,
  DEMO_STATUS_HISTORY,
  DEMO_HANDOFFS,
  DEMO_MEDICAL_CLEARANCES,
  DEMO_ANIMAL_NOTES,
  DEMO_NOTIFICATIONS,
  DEMO_USERS,
  type DemoCase,
  type DemoAnimal,
} from "@/lib/data/demo-store";
import {
  calculateUrgencyScore,
  classifyUrgencyLevel,
  type UrgencyResult,
} from "@/lib/urgency/scoring";
import { calculateShelterRecommendations } from "@/lib/routing/shelter-routing";
import { approximateLocation, type Role } from "@/lib/auth/permissions";
import { generateCaseNumber } from "@/lib/utils";

const STATUSES_WITH_SHELTER_RECOMMENDATIONS = new Set([
  "verified",
  "rescuer_assigned",
  "rescue_accepted",
  "rescue_in_progress",
  "animal_secured",
  "awaiting_shelter",
]);

function urgencyInputFromCase(
  caseItem: DemoCase,
  verifiedAt?: Date | null,
) {
  return {
    injurySeverity: caseItem.injurySeverity,
    environmentalDanger: caseItem.environmentalDanger,
    vulnerability: caseItem.vulnerability,
    verifiedAt:
      verifiedAt ??
      (caseItem.verifiedAt ? new Date(caseItem.verifiedAt) : null),
  } as {
    injurySeverity: "none_visible";
    environmentalDanger: "none";
    vulnerability: "adult_healthy";
    verifiedAt?: Date | null;
  };
}

/** Authoritative live urgency for display — factors + waiting time + optional staff override. */
export function resolveCurrentUrgency(caseItem: DemoCase): UrgencyResult {
  if (caseItem.urgencyOverrideScore != null) {
    const score = caseItem.urgencyOverrideScore;
    const level = classifyUrgencyLevel(score);
    const base = calculateUrgencyScore(urgencyInputFromCase(caseItem));
    return {
      score,
      level,
      factors: base.factors,
      explanation: caseItem.urgencyOverrideReason
        ? `Staff override applied (${score}/100). ${base.explanation}`
        : base.explanation,
    };
  }

  if (!caseItem.verifiedAt) {
    return {
      score: caseItem.urgencyScore,
      level: classifyUrgencyLevel(caseItem.urgencyScore),
      factors: [],
      explanation:
        caseItem.urgencyScore > 0
          ? `Urgency score ${caseItem.urgencyScore}/100 (${classifyUrgencyLevel(caseItem.urgencyScore)}).`
          : "Case not yet verified — urgency not calculated.",
    };
  }

  return calculateUrgencyScore(urgencyInputFromCase(caseItem));
}

export function getCases(filters?: {
  status?: string;
  urgencyLevel?: string;
  rescuerId?: string;
  shelterId?: string;
  reporterId?: string;
  search?: string;
  sortBy?: "urgency" | "waiting" | "date";
}): DemoCase[] {
  let cases = [...DEMO_CASES];

  if (filters?.status) {
    cases = cases.filter((c) => c.status === filters.status);
  }
  if (filters?.urgencyLevel) {
    cases = cases.filter((c) => c.urgencyLevel === filters.urgencyLevel);
  }
  if (filters?.rescuerId) {
    const assignedCaseIds = DEMO_ASSIGNMENTS
      .filter((a) => a.rescuerId === filters.rescuerId && a.status !== "declined")
      .map((a) => a.caseId);
    cases = cases.filter((c) => assignedCaseIds.includes(c.id));
  }
  if (filters?.reporterId) {
    cases = cases.filter((c) => c.reporterId === filters.reporterId);
  }
  if (filters?.shelterId) {
    cases = cases.filter((c) => c.assignedShelterId === filters.shelterId);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    cases = cases.filter(
      (c) =>
        c.caseNumber.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.species.toLowerCase().includes(q),
    );
  }

  if (filters?.sortBy === "urgency") {
    cases.sort(
      (a, b) =>
        resolveCurrentUrgency(b).score - resolveCurrentUrgency(a).score,
    );
  } else if (filters?.sortBy === "waiting") {
    cases.sort((a, b) => {
      const aTime = a.verifiedAt ? new Date(a.verifiedAt).getTime() : 0;
      const bTime = b.verifiedAt ? new Date(b.verifiedAt).getTime() : 0;
      return aTime - bTime;
    });
  } else {
    cases.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  return cases;
}

export function getCaseById(id: string) {
  return DEMO_CASES.find((c) => c.id === id);
}

export function getCaseLocation(
  caseItem: DemoCase,
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

export function getAssignmentsForCase(caseId: string) {
  return DEMO_ASSIGNMENTS.filter((a) => a.caseId === caseId);
}

export function getAssignmentById(id: string) {
  return DEMO_ASSIGNMENTS.find((a) => a.id === id);
}

export function getRecommendationsForCase(caseId: string) {
  const existing = DEMO_RECOMMENDATIONS.filter((r) => r.caseId === caseId);
  if (existing.length > 0) {
    return existing.sort((a, b) => a.rank - b.rank);
  }

  const caseItem = DEMO_CASES.find((c) => c.id === caseId);
  if (
    caseItem &&
    caseItem.verifiedAt &&
    STATUSES_WITH_SHELTER_RECOMMENDATIONS.has(caseItem.status)
  ) {
    generateRecommendationsForCase(caseId);
    return DEMO_RECOMMENDATIONS
      .filter((r) => r.caseId === caseId)
      .sort((a, b) => a.rank - b.rank);
  }

  return [];
}

export function getStatusHistoryForCase(caseId: string) {
  return DEMO_STATUS_HISTORY
    .filter((h) => h.caseId === caseId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

export function getHandoffForCase(caseId: string) {
  return DEMO_HANDOFFS.find((h) => h.caseId === caseId);
}

export function getAnimals(filters?: {
  search?: string;
  shelterId?: string;
  clearanceStatus?: string;
}) {
  let animals = [...DEMO_ANIMALS];
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    animals = animals.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.temporaryId.toLowerCase().includes(q) ||
        a.species.toLowerCase().includes(q),
    );
  }
  if (filters?.shelterId) {
    animals = animals.filter((a) => a.shelterId === filters.shelterId);
  }
  if (filters?.clearanceStatus) {
    animals = animals.filter((a) => a.clearanceStatus === filters.clearanceStatus);
  }
  return animals;
}

export function getAnimalById(id: string) {
  return DEMO_ANIMALS.find((a) => a.id === id);
}

export function getMedicalClearanceForAnimal(animalId: string) {
  return DEMO_MEDICAL_CLEARANCES.find((m) => m.animalId === animalId);
}

export function getNotesForAnimal(animalId: string) {
  return DEMO_ANIMAL_NOTES
    .filter((n) => n.animalId === animalId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getShelters() {
  return DEMO_SHELTERS;
}

export function getShelterById(id: string) {
  return DEMO_SHELTERS.find((s) => s.id === id);
}

export function getNotificationsForUser(userId: string) {
  return DEMO_NOTIFICATIONS
    .filter((n) => n.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getRescuers() {
  return DEMO_USERS.filter((u) => u.roles.includes("rescuer"));
}

export function getDashboardMetrics() {
  const activeCases = DEMO_CASES.filter(
    (c) =>
      !["completed", "rejected", "duplicate", "cancelled"].includes(c.status),
  );
  const criticalHigh = activeCases.filter((c) => {
    const level = resolveCurrentUrgency(c).level;
    return level === "critical" || level === "high";
  });
  const unassigned = activeCases.filter(
    (c) =>
      c.status === "verified" ||
      (c.status === "rescuer_assigned" &&
        DEMO_ASSIGNMENTS.some(
          (a) => a.caseId === c.id && a.status === "pending",
        )),
  );
  const awaitingMedical = DEMO_ANIMALS.filter(
    (a) =>
      a.clearanceStatus === "awaiting_examination" ||
      a.clearanceStatus === "under_examination",
  );
  const underTreatment = DEMO_ANIMALS.filter(
    (a) => a.clearanceStatus === "under_treatment",
  );
  const completed = DEMO_CASES.filter((c) => c.status === "completed");
  const totalCapacity = DEMO_SHELTERS.reduce((s, sh) => s + sh.totalCapacity, 0);
  const totalOccupancy = DEMO_SHELTERS.reduce(
    (s, sh) => s + sh.currentOccupancy,
    0,
  );

  return {
    activeCases: activeCases.length,
    criticalHigh: criticalHigh.length,
    unassigned: unassigned.length,
    awaitingMedical: awaitingMedical.length,
    underTreatment: underTreatment.length,
    completed: completed.length,
    capacityUsed: totalOccupancy,
    capacityTotal: totalCapacity,
    recentHandoffs: DEMO_HANDOFFS.slice(0, 5),
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
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

export function submitReport(input: ReportInput): DemoCase {
  const approx = approximateLocation(input.latitude, input.longitude);
  const id = `case-${Date.now()}`;
  const reportId = `report-${Date.now()}`;
  const caseNumber = generateCaseNumber();

  const newCase: DemoCase = {
    id,
    caseNumber,
    reportId,
    reporterId: input.reporterId,
    reporterName:
      DEMO_USERS.find((u) => u.id === input.reporterId)?.name ?? "Unknown",
    status: "report_submitted",
    species: input.species,
    injurySeverity: input.injurySeverity,
    environmentalDanger: input.environmentalDanger,
    vulnerability: input.vulnerability,
    description: input.description,
    contactPreference: input.contactPreference,
    latitude: input.latitude,
    longitude: input.longitude,
    approximateLatitude: approx.latitude,
    approximateLongitude: approx.longitude,
    urgencyScore: 0,
    urgencyLevel: "low",
    photoUrl: input.photoUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  DEMO_CASES.unshift(newCase);
  return newCase;
}

export function verifyCase(
  caseId: string,
  staffId: string,
): DemoCase | undefined {
  const caseItem = DEMO_CASES.find((c) => c.id === caseId);
  if (!caseItem) return undefined;

  const verifiedAt = new Date();
  const urgency = calculateUrgencyScore({
    ...urgencyInputFromCase(caseItem, verifiedAt),
  });

  const fromStatus = caseItem.status;

  caseItem.status = "verified";
  caseItem.verifiedAt = verifiedAt.toISOString();
  caseItem.verifiedById = staffId;
  caseItem.urgencyScore = urgency.score;
  caseItem.urgencyLevel = urgency.level;
  caseItem.updatedAt = new Date().toISOString();

  DEMO_STATUS_HISTORY.push({
    id: `hist-${Date.now()}`,
    caseId,
    fromStatus,
    toStatus: "verified",
    changedById: staffId,
    createdAt: new Date().toISOString(),
  });

  return caseItem;
}

export function rejectCase(
  caseId: string,
  staffId: string,
  reason: string,
): DemoCase | undefined {
  const caseItem = DEMO_CASES.find((c) => c.id === caseId);
  if (!caseItem) return undefined;
  caseItem.status = "rejected";
  caseItem.rejectionReason = reason;
  caseItem.updatedAt = new Date().toISOString();
  return caseItem;
}

export function assignRescuer(
  caseId: string,
  rescuerId: string,
  staffId: string,
): void {
  const rescuer = DEMO_USERS.find((u) => u.id === rescuerId);
  const caseItem = DEMO_CASES.find((c) => c.id === caseId);
  if (!caseItem || !rescuer) return;

  const fromStatus = caseItem.status;

  DEMO_ASSIGNMENTS.push({
    id: `assignment-${Date.now()}`,
    caseId,
    rescuerId,
    rescuerName: rescuer.name,
    status: "pending",
    assignedById: staffId,
    assignedAt: new Date().toISOString(),
  });

  caseItem.status = "rescuer_assigned";
  caseItem.updatedAt = new Date().toISOString();

  DEMO_STATUS_HISTORY.push({
    id: `hist-${Date.now()}`,
    caseId,
    fromStatus,
    toStatus: "rescuer_assigned",
    changedById: staffId,
    note: `Assigned ${rescuer.name}`,
    createdAt: new Date().toISOString(),
  });
}

export function acceptAssignment(
  assignmentId: string,
  rescuerId: string,
): boolean {
  const assignment = DEMO_ASSIGNMENTS.find((a) => a.id === assignmentId);
  if (!assignment || assignment.rescuerId !== rescuerId) return false;
  if (assignment.status !== "pending") return false;

  assignment.status = "accepted";
  assignment.respondedAt = new Date().toISOString();

  const caseItem = DEMO_CASES.find((c) => c.id === assignment.caseId);
  if (!caseItem) return false;

  const fromStatus = caseItem.status;
  caseItem.status = "rescue_accepted";
  caseItem.updatedAt = new Date().toISOString();

  DEMO_STATUS_HISTORY.push({
    id: `hist-${Date.now()}`,
    caseId: assignment.caseId,
    fromStatus,
    toStatus: "rescue_accepted",
    changedById: rescuerId,
    createdAt: new Date().toISOString(),
  });

  return true;
}

export function declineAssignment(
  assignmentId: string,
  rescuerId: string,
  reason: string,
): boolean {
  const assignment = DEMO_ASSIGNMENTS.find((a) => a.id === assignmentId);
  if (!assignment || assignment.rescuerId !== rescuerId) return false;
  if (assignment.status !== "pending") return false;

  assignment.status = "declined";
  assignment.declineReason = reason;
  assignment.respondedAt = new Date().toISOString();

  const caseItem = DEMO_CASES.find((c) => c.id === assignment.caseId);
  if (caseItem && caseItem.status === "rescuer_assigned") {
    const fromStatus = caseItem.status;
    caseItem.status = "verified";
    caseItem.updatedAt = new Date().toISOString();

    DEMO_STATUS_HISTORY.push({
      id: `hist-${Date.now()}-decline`,
      caseId: assignment.caseId,
      fromStatus,
      toStatus: "verified",
      changedById: rescuerId,
      note: `Assignment declined: ${reason}`,
      createdAt: new Date().toISOString(),
    });
  }

  return true;
}

const RESCUER_CASE_TRANSITIONS: Record<string, string[]> = {
  rescue_accepted: ["rescue_in_progress"],
  rescue_in_progress: ["animal_secured"],
  animal_secured: ["awaiting_shelter"],
};

export function updateCaseStatusAsRescuer(
  caseId: string,
  rescuerId: string,
  newStatus: string,
): { ok: true } | { ok: false; error: string } {
  const assignment = DEMO_ASSIGNMENTS.find(
    (a) =>
      a.caseId === caseId &&
      a.rescuerId === rescuerId &&
      a.status === "accepted",
  );
  if (!assignment) {
    return { ok: false, error: "No active assignment for this case" };
  }

  const caseItem = DEMO_CASES.find((c) => c.id === caseId);
  if (!caseItem) {
    return { ok: false, error: "Case not found" };
  }

  const allowed = RESCUER_CASE_TRANSITIONS[caseItem.status];
  if (!allowed?.includes(newStatus)) {
    return { ok: false, error: "Invalid status transition" };
  }

  updateCaseStatus(caseId, newStatus, rescuerId);
  return { ok: true };
}

export function updateCaseStatus(
  caseId: string,
  newStatus: string,
  userId: string,
  note?: string,
): void {
  const caseItem = DEMO_CASES.find((c) => c.id === caseId);
  if (!caseItem) return;

  const fromStatus = caseItem.status;
  caseItem.status = newStatus;
  caseItem.updatedAt = new Date().toISOString();

  DEMO_STATUS_HISTORY.push({
    id: `hist-${Date.now()}`,
    caseId,
    fromStatus,
    toStatus: newStatus,
    changedById: userId,
    note,
    createdAt: new Date().toISOString(),
  });
}

export function generateRecommendationsForCase(caseId: string): void {
  const caseItem = DEMO_CASES.find((c) => c.id === caseId);
  if (!caseItem) return;

  const requiredCaps =
    caseItem.injurySeverity === "severe" || caseItem.injurySeverity === "critical"
      ? ["emergency surgery", "wound care"]
      : caseItem.injurySeverity === "moderate"
        ? ["wound care", "orthopedic treatment"]
        : [];

  const recs = calculateShelterRecommendations(
    DEMO_SHELTERS.map((s) => ({
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

  DEMO_RECOMMENDATIONS.filter((r) => r.caseId === caseId).forEach((r) => {
    const idx = DEMO_RECOMMENDATIONS.indexOf(r);
    if (idx >= 0) DEMO_RECOMMENDATIONS.splice(idx, 1);
  });

  recs.forEach((r, i) => {
    DEMO_RECOMMENDATIONS.push({
      id: `rec-${caseId}-${i}`,
      caseId,
      shelterId: r.shelterId,
      shelterName: r.shelterName,
      matchScore: r.matchScore,
      distanceKm: r.distanceKm,
      reasons: r.reasons,
      warnings: r.warnings,
      missingCapabilities: r.missingCapabilities,
      rank: r.rank,
      status: "recommended",
    });
  });
}

export function selectShelter(
  caseId: string,
  shelterId: string,
  staffId: string,
  rejectionReason?: string,
): void {
  const caseItem = DEMO_CASES.find((c) => c.id === caseId);
  if (!caseItem) return;

  const recs = DEMO_RECOMMENDATIONS.filter((r) => r.caseId === caseId);
  const topRec = recs.find((r) => r.rank === 1);

  recs.forEach((r) => {
    if (r.shelterId === shelterId) {
      r.status = "selected";
    } else if (r.status === "selected") {
      r.status = "rejected";
    }
  });

  if (topRec && topRec.shelterId !== shelterId && rejectionReason) {
    topRec.status = "overridden";
    topRec.rejectionReason = rejectionReason;
  }

  caseItem.assignedShelterId = shelterId;
  caseItem.updatedAt = new Date().toISOString();

  const shelter = DEMO_SHELTERS.find((s) => s.id === shelterId);
  DEMO_STATUS_HISTORY.push({
    id: `hist-${Date.now()}-dest`,
    caseId,
    fromStatus: caseItem.status,
    toStatus: caseItem.status,
    changedById: staffId,
    note: `Destination confirmed: ${shelter?.name ?? "Shelter"}`,
    createdAt: new Date().toISOString(),
  });
}

const HANDOFF_ELIGIBLE_STATUSES = new Set([
  "awaiting_shelter",
  "animal_secured",
]);

export function confirmShelterHandoff(
  caseId: string,
  shelterId: string,
  staffId: string,
  notes?: string,
): { ok: true } | { ok: false; error: string } {
  const caseItem = DEMO_CASES.find((c) => c.id === caseId);
  if (!caseItem) {
    return { ok: false, error: "Case not found" };
  }

  if (["rejected", "duplicate", "cancelled", "completed"].includes(caseItem.status)) {
    return { ok: false, error: "Cannot hand off a closed case" };
  }

  if (caseItem.status === "shelter_handoff") {
    return { ok: false, error: "Handoff already completed" };
  }

  if (getHandoffForCase(caseId)) {
    return { ok: false, error: "Handoff already completed" };
  }

  if (!HANDOFF_ELIGIBLE_STATUSES.has(caseItem.status)) {
    return { ok: false, error: "Case is not ready for shelter handoff" };
  }

  if (!caseItem.assignedShelterId) {
    return { ok: false, error: "No destination shelter confirmed" };
  }

  if (caseItem.assignedShelterId !== shelterId) {
    return { ok: false, error: "Destination shelter does not match confirmed assignment" };
  }

  const history = getStatusHistoryForCase(caseId);
  const animalWasSecured =
    caseItem.status === "awaiting_shelter" ||
    history.some((h) => h.toStatus === "animal_secured");
  if (!animalWasSecured) {
    return { ok: false, error: "Animal must be secured before shelter handoff" };
  }

  const assignment = DEMO_ASSIGNMENTS.find(
    (a) => a.caseId === caseId && a.status === "accepted",
  );

  DEMO_HANDOFFS.push({
    id: `handoff-${caseId}`,
    caseId,
    shelterId,
    confirmedByRescuerId: assignment?.rescuerId,
    confirmedByStaffId: staffId,
    handoffNotes: notes?.trim() || undefined,
    confirmedAt: new Date().toISOString(),
  });

  updateCaseStatus(
    caseId,
    "shelter_handoff",
    staffId,
    notes?.trim() || "Shelter handoff confirmed",
  );

  if (assignment) {
    assignment.status = "completed";
  }

  const reporter = DEMO_USERS.find((u) => u.id === caseItem.reporterId);
  if (reporter) {
    DEMO_NOTIFICATIONS.push({
      id: `notif-handoff-${caseId}-${Date.now()}`,
      userId: reporter.id,
      type: "status_update",
      title: "Animal is safe at shelter",
      message:
        "Your reported animal has been safely transferred to a shelter and is receiving care.",
      caseId,
      read: false,
      createdAt: new Date().toISOString(),
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

export function completeShelterIntake(
  caseId: string,
  staffId: string,
  input?: ShelterIntakeInput,
): { ok: true; animalId: string } | { ok: false; error: string } {
  const caseItem = DEMO_CASES.find((c) => c.id === caseId);
  if (!caseItem) {
    return { ok: false, error: "Case not found" };
  }

  if (caseItem.status !== "shelter_handoff") {
    return { ok: false, error: "Shelter handoff must be completed before intake" };
  }

  const handoff = getHandoffForCase(caseId);
  if (!handoff) {
    return { ok: false, error: "No handoff record found" };
  }

  if (caseItem.animalId) {
    return { ok: true, animalId: caseItem.animalId };
  }

  const existingAnimal = DEMO_ANIMALS.find((a) => a.rescueCaseId === caseId);
  if (existingAnimal) {
    caseItem.animalId = existingAnimal.id;
    return { ok: true, animalId: existingAnimal.id };
  }

  const staff = DEMO_USERS.find((u) => u.id === staffId);
  const animalId = `animal-${caseId.replace("case-", "")}`;
  const temporaryId = `A-${caseItem.caseNumber.replace("RC-", "")}`;

  const animal: DemoAnimal = {
    id: animalId,
    temporaryId,
    name: input?.name?.trim() || undefined,
    species: caseItem.species,
    estimatedAge: input?.estimatedAge?.trim() || undefined,
    sex: input?.sex?.trim() || undefined,
    breed: input?.breed?.trim() || undefined,
    color: input?.color?.trim() || undefined,
    rescueCaseId: caseId,
    shelterId: handoff.shelterId,
    intakeDate: new Date().toISOString(),
    pathwayStage: "medical_clearance",
    recommendedNextAction: "Schedule veterinary examination",
    photoUrl: caseItem.photoUrl,
    clearanceStatus: "awaiting_examination",
    createdAt: new Date().toISOString(),
  };

  DEMO_ANIMALS.unshift(animal);
  caseItem.animalId = animalId;
  caseItem.updatedAt = new Date().toISOString();

  if (input?.initialCondition?.trim()) {
    DEMO_ANIMAL_NOTES.push({
      id: `note-${animalId}-intake`,
      animalId,
      authorId: staffId,
      authorName: staff?.name,
      noteType: "staff",
      content: `Initial condition at intake: ${input.initialCondition.trim()}`,
      createdAt: new Date().toISOString(),
    });
  }

  if (!handoff.intakeCompletedAt) {
    const shelter = DEMO_SHELTERS.find((s) => s.id === handoff.shelterId);
    if (shelter && shelter.currentOccupancy < shelter.totalCapacity) {
      shelter.currentOccupancy += 1;
    }
    handoff.intakeCompletedAt = new Date().toISOString();
  }

  DEMO_STATUS_HISTORY.push({
    id: `hist-${Date.now()}-intake`,
    caseId,
    fromStatus: "shelter_handoff",
    toStatus: "shelter_handoff",
    changedById: staffId,
    note: "Shelter intake completed",
    createdAt: new Date().toISOString(),
  });

  const vet = DEMO_USERS.find((u) => u.roles.includes("veterinarian"));
  if (vet) {
    DEMO_NOTIFICATIONS.push({
      id: `notif-vet-${animalId}`,
      userId: vet.id,
      type: "system",
      title: "New animal awaiting examination",
      message: `${temporaryId} (${caseItem.species}) requires veterinary examination.`,
      caseId,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  return { ok: true, animalId };
}

/** @deprecated Use confirmShelterHandoff — kept for internal migration */
export function confirmHandoff(
  caseId: string,
  shelterId: string,
  rescuerId: string,
  staffId: string,
  notes?: string,
): void {
  void rescuerId;
  const result = confirmShelterHandoff(caseId, shelterId, staffId, notes);
  if (!result.ok) return;
}

export function updateMedicalClearance(
  animalId: string,
  vetId: string,
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
): void {
  const animal = DEMO_ANIMALS.find((a) => a.id === animalId);
  if (!animal) return;

  let clearance = DEMO_MEDICAL_CLEARANCES.find((m) => m.animalId === animalId);
  const vet = DEMO_USERS.find((u) => u.id === vetId);

  if (!clearance) {
    clearance = {
      id: `clearance-${Date.now()}`,
      animalId,
      veterinarianId: vetId,
      veterinarianName: vet?.name,
      clearanceStatus: data.clearanceStatus,
    };
    DEMO_MEDICAL_CLEARANCES.push(clearance);
  }

  Object.assign(clearance, {
    ...data,
    veterinarianId: vetId,
    veterinarianName: vet?.name,
  });

  animal.clearanceStatus = data.clearanceStatus;
  if (data.clearanceStatus === "medically_cleared") {
    animal.pathwayStage = "behavior_assessment";
    animal.recommendedNextAction = "Complete behavioral assessment";
  } else if (data.clearanceStatus === "under_treatment") {
    animal.pathwayStage = "medical_clearance";
  }
}

export function overrideUrgency(
  caseId: string,
  score: number,
  reason: string,
  staffId: string,
): void {
  const caseItem = DEMO_CASES.find((c) => c.id === caseId);
  if (!caseItem) return;

  caseItem.urgencyOverrideScore = score;
  caseItem.urgencyOverrideReason = reason;
  caseItem.urgencyScore = score;
  caseItem.urgencyLevel =
    score >= 80
      ? "critical"
      : score >= 60
        ? "high"
        : score >= 30
          ? "medium"
          : "low";
  caseItem.updatedAt = new Date().toISOString();
  void staffId;
}

export function updateShelterCapacity(
  shelterId: string,
  totalCapacity: number,
  currentOccupancy: number,
): void {
  const shelter = DEMO_SHELTERS.find((s) => s.id === shelterId);
  if (!shelter) return;
  shelter.totalCapacity = totalCapacity;
  shelter.currentOccupancy = currentOccupancy;
}

export function updateShelterCapabilities(
  shelterId: string,
  capabilities: string[],
): void {
  const shelter = DEMO_SHELTERS.find((s) => s.id === shelterId);
  if (!shelter) return;
  shelter.capabilities = capabilities;
}
