import "server-only";

import {
  and,
  asc,
  desc,
  eq,
  inArray,
  like,
  ne,
  sql,
} from "drizzle-orm";
import { getDb } from "@/db";
import {
  adoptionApplications,
  adoptionInterests,
  animalNotes,
  animals,
  casePhotos,
  caseStatusHistory,
  medicalClearances,
  notifications,
  rescueCases,
  rescueReports,
  rescuerAssignments,
  shelterCapabilities,
  shelterCapacity,
  shelterHandoffs,
  shelterRecommendations,
  shelters,
  userPreferences,
  userRoles,
  users,
} from "@/db/schema";
import type {
  AdoptionApplicationRecord,
  AnimalNoteRecord,
  AnimalRecord,
  AppUser,
  AssignmentRecord,
  HandoffRecord,
  MedicalClearanceRecord,
  NotificationRecord,
  RecommendationRecord,
  RescueCaseRecord,
  ShelterRecord,
  StatusHistoryRecord,
  UserProfilePrefs,
} from "@/lib/data/types";

function toIso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

function mapShelterRow(
  shelter: typeof shelters.$inferSelect,
  capacity: typeof shelterCapacity.$inferSelect | null,
  capabilities: { capability: string }[],
): ShelterRecord {
  return {
    id: shelter.id,
    name: shelter.name,
    address: shelter.address,
    latitude: shelter.latitude,
    longitude: shelter.longitude,
    phone: shelter.phone ?? "",
    email: shelter.email ?? undefined,
    speciesAccepted: shelter.speciesAccepted ?? [],
    capabilities: capabilities.map((c) => c.capability),
    totalCapacity: capacity?.totalCapacity ?? 0,
    currentOccupancy: capacity?.currentOccupancy ?? 0,
    operationalWorkload: capacity?.operationalWorkload ?? 0,
  };
}

async function loadShelterMaps() {
  const db = getDb();
  const [allShelters, allCapacity, allCapabilities] = await Promise.all([
    db.select().from(shelters),
    db.select().from(shelterCapacity),
    db.select().from(shelterCapabilities),
  ]);

  const capacityByShelter = new Map(
    allCapacity.map((row) => [row.shelterId, row]),
  );
  const capabilitiesByShelter = new Map<string, { capability: string }[]>();
  for (const row of allCapabilities) {
    const list = capabilitiesByShelter.get(row.shelterId) ?? [];
    list.push({ capability: row.capability });
    capabilitiesByShelter.set(row.shelterId, list);
  }

  return allShelters.map((shelter) =>
    mapShelterRow(
      shelter,
      capacityByShelter.get(shelter.id) ?? null,
      capabilitiesByShelter.get(shelter.id) ?? [],
    ),
  );
}

type CaseBundle = {
  rescueCase: typeof rescueCases.$inferSelect;
  report: typeof rescueReports.$inferSelect;
  reporterName: string;
  photoUrl?: string;
  activeRescuerId?: string;
};

async function loadCaseBundles(caseIds?: string[]): Promise<CaseBundle[]> {
  const db = getDb();

  const caseRows = caseIds?.length
    ? await db
        .select()
        .from(rescueCases)
        .where(inArray(rescueCases.id, caseIds))
    : await db.select().from(rescueCases);

  if (caseRows.length === 0) return [];

  const ids = caseRows.map((c) => c.id);
  const reportIds = caseRows.map((c) => c.reportId);

  const [reports, photos, assignments] = await Promise.all([
    db
      .select()
      .from(rescueReports)
      .where(inArray(rescueReports.id, reportIds)),
    db
      .select()
      .from(casePhotos)
      .where(inArray(casePhotos.caseId, ids)      ),
    db
      .select()
      .from(rescuerAssignments)
      .where(
        and(
          inArray(rescuerAssignments.caseId, ids),
          ne(rescuerAssignments.status, "declined"),
        ),
      ),
  ]);

  const reportById = new Map(reports.map((r) => [r.id, r]));
  const reporterIds = [...new Set(reports.map((r) => r.reporterId))];
  const reporterRows =
    reporterIds.length > 0
      ? await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(inArray(users.id, reporterIds))
      : [];
  const reporterById = new Map(reporterRows.map((r) => [r.id, r.name]));

  const photoByCase = new Map<string, string>();
  for (const photo of photos) {
    if (!photoByCase.has(photo.caseId)) {
      photoByCase.set(photo.caseId, photo.url);
    }
  }

  const activeRescuerByCase = new Map<string, string>();
  for (const assignment of assignments) {
    if (
      assignment.status === "accepted" ||
      assignment.status === "pending"
    ) {
      activeRescuerByCase.set(assignment.caseId, assignment.rescuerId);
    }
  }

  return caseRows.map((rescueCase) => {
    const report = reportById.get(rescueCase.reportId)!;
    return {
      rescueCase,
      report,
      reporterName: reporterById.get(report.reporterId) ?? "Unknown",
      photoUrl: photoByCase.get(rescueCase.id),
      activeRescuerId: activeRescuerByCase.get(rescueCase.id),
    };
  });
}

function mapCaseBundle(bundle: CaseBundle): RescueCaseRecord {
  const { rescueCase: c, report } = bundle;
  return {
    id: c.id,
    caseNumber: c.caseNumber,
    reportId: c.reportId,
    reporterId: report.reporterId,
    reporterName: bundle.reporterName,
    status: c.status,
    species: report.species,
    injurySeverity: report.injurySeverity,
    environmentalDanger: report.environmentalDanger,
    vulnerability: report.vulnerability,
    description: report.description,
    contactPreference: report.contactPreference,
    locationLabel: report.locationLabel ?? undefined,
    locationNote: report.locationNote ?? undefined,
    rescuerNote: c.rescuerNote ?? undefined,
    latitude: report.latitude,
    longitude: report.longitude,
    approximateLatitude: report.approximateLatitude,
    approximateLongitude: report.approximateLongitude,
    urgencyScore: c.urgencyScore ?? 0,
    urgencyLevel: c.urgencyLevel ?? "low",
    urgencyOverrideScore: c.urgencyOverrideScore ?? undefined,
    urgencyOverrideReason: c.urgencyOverrideReason ?? undefined,
    verifiedAt: toIso(c.verifiedAt),
    verifiedById: c.verifiedById ?? undefined,
    rejectionReason: c.rejectionReason ?? undefined,
    assignedShelterId: c.assignedShelterId ?? undefined,
    animalId: c.animalId ?? undefined,
    photoUrl: bundle.photoUrl,
    createdAt: toIso(c.createdAt)!,
    updatedAt: toIso(c.updatedAt)!,
    activeRescuerId: bundle.activeRescuerId,
  };
}

export async function fetchCases(filters?: {
  status?: string;
  urgencyLevel?: string;
  rescuerId?: string;
  shelterId?: string;
  reporterId?: string;
  search?: string;
  sortBy?: "urgency" | "waiting" | "date";
}): Promise<RescueCaseRecord[]> {
  let bundles = await loadCaseBundles();

  if (filters?.status) {
    bundles = bundles.filter((b) => b.rescueCase.status === filters.status);
  }
  if (filters?.urgencyLevel) {
    bundles = bundles.filter(
      (b) => b.rescueCase.urgencyLevel === filters.urgencyLevel,
    );
  }
  if (filters?.reporterId) {
    bundles = bundles.filter((b) => b.report.reporterId === filters.reporterId);
  }
  if (filters?.shelterId) {
    bundles = bundles.filter(
      (b) => b.rescueCase.assignedShelterId === filters.shelterId,
    );
  }
  if (filters?.rescuerId) {
    bundles = bundles.filter(
      (b) => b.activeRescuerId === filters.rescuerId,
    );
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    bundles = bundles.filter((b) => {
      const c = mapCaseBundle(b);
      return (
        c.caseNumber.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.species.toLowerCase().includes(q)
      );
    });
  }

  const cases = bundles.map(mapCaseBundle);

  if (filters?.sortBy === "urgency") {
    cases.sort((a, b) => b.urgencyScore - a.urgencyScore);
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

export async function fetchCaseById(id: string): Promise<RescueCaseRecord | null> {
  const bundles = await loadCaseBundles([id]);
  return bundles[0] ? mapCaseBundle(bundles[0]) : null;
}

export async function fetchAssignmentsForCase(
  caseId: string,
): Promise<AssignmentRecord[]> {
  const db = getDb();
  const rows = await db
    .select({
      assignment: rescuerAssignments,
      rescuerName: users.name,
    })
    .from(rescuerAssignments)
    .innerJoin(users, eq(rescuerAssignments.rescuerId, users.id))
    .where(eq(rescuerAssignments.caseId, caseId));

  return rows.map(({ assignment, rescuerName }) => ({
    id: assignment.id,
    caseId: assignment.caseId,
    rescuerId: assignment.rescuerId,
    rescuerName,
    status: assignment.status,
    assignedById: assignment.assignedById ?? undefined,
    declineReason: assignment.declineReason ?? undefined,
    assignedAt: toIso(assignment.assignedAt)!,
    respondedAt: toIso(assignment.respondedAt),
  }));
}

export async function fetchAssignmentById(
  id: string,
): Promise<AssignmentRecord | null> {
  const db = getDb();
  const rows = await db
    .select({
      assignment: rescuerAssignments,
      rescuerName: users.name,
    })
    .from(rescuerAssignments)
    .innerJoin(users, eq(rescuerAssignments.rescuerId, users.id))
    .where(eq(rescuerAssignments.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  const { assignment, rescuerName } = row;
  return {
    id: assignment.id,
    caseId: assignment.caseId,
    rescuerId: assignment.rescuerId,
    rescuerName,
    status: assignment.status,
    assignedById: assignment.assignedById ?? undefined,
    declineReason: assignment.declineReason ?? undefined,
    assignedAt: toIso(assignment.assignedAt)!,
    respondedAt: toIso(assignment.respondedAt),
  };
}

export async function fetchRecommendationsForCase(
  caseId: string,
): Promise<RecommendationRecord[]> {
  const db = getDb();
  const rows = await db
    .select({
      rec: shelterRecommendations,
      shelterName: shelters.name,
    })
    .from(shelterRecommendations)
    .innerJoin(shelters, eq(shelterRecommendations.shelterId, shelters.id))
    .where(eq(shelterRecommendations.caseId, caseId))
    .orderBy(asc(shelterRecommendations.rank));

  return rows.map(({ rec, shelterName }) => ({
    id: rec.id,
    caseId: rec.caseId,
    shelterId: rec.shelterId,
    shelterName,
    matchScore: rec.matchScore,
    distanceKm: rec.distanceKm,
    reasons: rec.reasons ?? [],
    warnings: rec.warnings ?? [],
    missingCapabilities: rec.missingCapabilities ?? [],
    rank: rec.rank,
    status: rec.status,
    rejectionReason: rec.rejectionReason ?? undefined,
  }));
}

export async function replaceRecommendationsForCase(
  caseId: string,
  recs: Omit<RecommendationRecord, "id" | "caseId">[],
): Promise<void> {
  const db = getDb();
  await db
    .delete(shelterRecommendations)
    .where(eq(shelterRecommendations.caseId, caseId));

  if (recs.length === 0) return;

  await db.insert(shelterRecommendations).values(
    recs.map((rec) => ({
      caseId,
      shelterId: rec.shelterId,
      matchScore: rec.matchScore,
      distanceKm: rec.distanceKm,
      reasons: rec.reasons,
      warnings: rec.warnings,
      missingCapabilities: rec.missingCapabilities,
      rank: rec.rank,
      status: rec.status as "recommended",
      rejectionReason: rec.rejectionReason,
    })),
  );
}

export async function fetchStatusHistoryForCase(
  caseId: string,
): Promise<StatusHistoryRecord[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(caseStatusHistory)
    .where(eq(caseStatusHistory.caseId, caseId))
    .orderBy(asc(caseStatusHistory.createdAt));

  return rows.map((row) => ({
    id: row.id,
    caseId: row.caseId,
    fromStatus: row.fromStatus ?? undefined,
    toStatus: row.toStatus,
    changedById: row.changedById ?? undefined,
    note: row.note ?? undefined,
    createdAt: toIso(row.createdAt)!,
  }));
}

export async function insertStatusHistory(entry: {
  caseId: string;
  fromStatus?: string;
  toStatus: string;
  changedById?: string;
  note?: string;
}): Promise<void> {
  const db = getDb();
  await db.insert(caseStatusHistory).values({
    caseId: entry.caseId,
    fromStatus: entry.fromStatus as typeof caseStatusHistory.$inferInsert.fromStatus,
    toStatus: entry.toStatus as typeof caseStatusHistory.$inferInsert.toStatus,
    changedById: entry.changedById,
    note: entry.note,
  });
}

export async function fetchHandoffForCase(
  caseId: string,
): Promise<HandoffRecord | null> {
  const db = getDb();
  const row = await db.query.shelterHandoffs.findFirst({
    where: eq(shelterHandoffs.caseId, caseId),
  });
  if (!row) return null;
  return {
    id: row.id,
    caseId: row.caseId,
    shelterId: row.shelterId,
    confirmedByRescuerId: row.confirmedByRescuerId ?? undefined,
    confirmedByStaffId: row.confirmedByStaffId ?? undefined,
    handoffNotes: row.handoffNotes ?? undefined,
    confirmedAt: toIso(row.confirmedAt),
    intakeCompletedAt: toIso(row.intakeCompletedAt),
  };
}

async function mapAnimalRow(
  animal: typeof animals.$inferSelect,
  clearanceStatus: string,
  caseNumber?: string | null,
): Promise<AnimalRecord> {
  return {
    id: animal.id,
    name: animal.name ?? undefined,
    temporaryId: animal.temporaryId,
    species: animal.species,
    estimatedAge: animal.estimatedAge ?? undefined,
    breed: animal.breed ?? undefined,
    color: animal.color ?? undefined,
    sex: animal.sex ?? undefined,
    bio: animal.bio ?? undefined,
    temperament: animal.temperament ?? undefined,
    rescueCaseId: animal.rescueCaseId ?? undefined,
    caseNumber: caseNumber ?? undefined,
    shelterId: animal.shelterId ?? undefined,
    intakeDate: toIso(animal.intakeDate),
    pathwayStage: animal.pathwayStage ?? "intake",
    recommendedNextAction: animal.recommendedNextAction ?? undefined,
    photoUrl: animal.photoUrl ?? undefined,
    clearanceStatus,
    createdAt: toIso(animal.createdAt)!,
  };
}

function mapAdoptionApplicationRow(
  row: typeof adoptionApplications.$inferSelect,
  animal?: typeof animals.$inferSelect | null,
  reviewerName?: string,
): AdoptionApplicationRecord {
  return {
    id: row.id,
    animalId: row.animalId,
    animalName: animal?.name ?? undefined,
    animalTemporaryId: animal?.temporaryId,
    animalSpecies: animal?.species,
    animalPhotoUrl: animal?.photoUrl ?? undefined,
    applicantName: row.applicantName,
    applicantEmail: row.applicantEmail,
    applicantPhone: row.applicantPhone ?? undefined,
    socialLink: row.socialLink ?? undefined,
    applicantCity: row.applicantCity ?? undefined,
    homeType: row.homeType,
    hasYard: row.hasYard,
    hasOtherPets: row.hasOtherPets,
    householdSize: row.householdSize,
    experienceNotes: row.experienceNotes ?? undefined,
    motivation: row.motivation,
    status: row.status,
    reviewedById: row.reviewedById ?? undefined,
    reviewerName,
    reviewNotes: row.reviewNotes ?? undefined,
    submittedAt: toIso(row.submittedAt)!,
    decidedAt: toIso(row.decidedAt),
    createdAt: toIso(row.createdAt)!,
  };
}

export async function fetchAnimals(filters?: {
  search?: string;
  shelterId?: string;
  clearanceStatus?: string;
}): Promise<AnimalRecord[]> {
  const db = getDb();
  const animalRows = await db.select().from(animals);
  const clearances = await db.select().from(medicalClearances);
  const caseRows = await db
    .select({ id: rescueCases.id, caseNumber: rescueCases.caseNumber })
    .from(rescueCases);
  const clearanceByAnimal = new Map(
    clearances.map((c) => [c.animalId, c.clearanceStatus]),
  );
  const caseNumberById = new Map(caseRows.map((c) => [c.id, c.caseNumber]));

  let result = await Promise.all(
    animalRows.map((animal) =>
      mapAnimalRow(
        animal,
        clearanceByAnimal.get(animal.id) ?? "awaiting_examination",
        animal.rescueCaseId
          ? caseNumberById.get(animal.rescueCaseId)
          : undefined,
      ),
    ),
  );

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.temporaryId.toLowerCase().includes(q) ||
        a.species.toLowerCase().includes(q) ||
        a.caseNumber?.toLowerCase().includes(q) ||
        a.temperament?.toLowerCase().includes(q) ||
        a.bio?.toLowerCase().includes(q),
    );
  }
  if (filters?.shelterId) {
    result = result.filter((a) => a.shelterId === filters.shelterId);
  }
  if (filters?.clearanceStatus) {
    result = result.filter(
      (a) => a.clearanceStatus === filters.clearanceStatus,
    );
  }

  return result;
}

export async function fetchAnimalById(id: string): Promise<AnimalRecord | null> {
  const db = getDb();
  const animal = await db.query.animals.findFirst({
    where: eq(animals.id, id),
  });
  if (!animal) return null;
  const clearance = await db.query.medicalClearances.findFirst({
    where: eq(medicalClearances.animalId, id),
  });
  let caseNumber: string | undefined;
  if (animal.rescueCaseId) {
    const linked = await db.query.rescueCases.findFirst({
      where: eq(rescueCases.id, animal.rescueCaseId),
      columns: { caseNumber: true },
    });
    caseNumber = linked?.caseNumber;
  }
  return mapAnimalRow(
    animal,
    clearance?.clearanceStatus ?? "awaiting_examination",
    caseNumber,
  );
}

export async function fetchMedicalClearanceForAnimal(
  animalId: string,
): Promise<MedicalClearanceRecord | null> {
  const db = getDb();
  const row = await db.query.medicalClearances.findFirst({
    where: eq(medicalClearances.animalId, animalId),
  });
  if (!row) return null;

  let veterinarianName: string | undefined;
  if (row.veterinarianId) {
    const vet = await db.query.users.findFirst({
      where: eq(users.id, row.veterinarianId),
      columns: { name: true },
    });
    veterinarianName = vet?.name;
  }

  return {
    id: row.id,
    animalId: row.animalId,
    veterinarianId: row.veterinarianId ?? undefined,
    veterinarianName,
    examinationDate: toIso(row.examinationDate),
    generalCondition: row.generalCondition ?? undefined,
    medicalPriority: row.medicalPriority ?? undefined,
    treatmentSummary: row.treatmentSummary ?? undefined,
    restrictions: row.restrictions ?? undefined,
    followUpDate: toIso(row.followUpDate),
    clearanceStatus: row.clearanceStatus,
    veterinarianNotes: row.veterinarianNotes ?? undefined,
  };
}

export async function fetchAllMedicalClearances(): Promise<
  MedicalClearanceRecord[]
> {
  const db = getDb();
  const rows = await db.select().from(medicalClearances);
  if (rows.length === 0) return [];

  const vetIds = [
    ...new Set(rows.map((r) => r.veterinarianId).filter(Boolean)),
  ] as string[];
  const vetRows =
    vetIds.length > 0
      ? await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(inArray(users.id, vetIds))
      : [];
  const vetNameById = new Map(vetRows.map((v) => [v.id, v.name]));

  return rows.map((row) => ({
    id: row.id,
    animalId: row.animalId,
    veterinarianId: row.veterinarianId ?? undefined,
    veterinarianName: row.veterinarianId
      ? vetNameById.get(row.veterinarianId)
      : undefined,
    examinationDate: toIso(row.examinationDate),
    generalCondition: row.generalCondition ?? undefined,
    medicalPriority: row.medicalPriority ?? undefined,
    treatmentSummary: row.treatmentSummary ?? undefined,
    restrictions: row.restrictions ?? undefined,
    followUpDate: toIso(row.followUpDate),
    clearanceStatus: row.clearanceStatus,
    veterinarianNotes: row.veterinarianNotes ?? undefined,
  }));
}

export async function fetchNotesForAnimal(
  animalId: string,
): Promise<AnimalNoteRecord[]> {
  const db = getDb();
  const rows = await db
    .select({
      note: animalNotes,
      authorName: users.name,
    })
    .from(animalNotes)
    .leftJoin(users, eq(animalNotes.authorId, users.id))
    .where(eq(animalNotes.animalId, animalId))
    .orderBy(desc(animalNotes.createdAt));

  return rows.map(({ note, authorName }) => ({
    id: note.id,
    animalId: note.animalId,
    authorId: note.authorId ?? undefined,
    authorName: authorName ?? undefined,
    noteType: note.noteType,
    content: note.content,
    createdAt: toIso(note.createdAt)!,
  }));
}

export async function fetchShelters(): Promise<ShelterRecord[]> {
  const list = await loadShelterMaps();
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchShelterById(
  id: string,
): Promise<ShelterRecord | null> {
  const list = await loadShelterMaps();
  return list.find((s) => s.id === id) ?? null;
}

export async function fetchNotificationsForUser(
  userId: string,
): Promise<NotificationRecord[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    message: row.message,
    caseId: row.caseId ?? undefined,
    read: row.read,
    createdAt: toIso(row.createdAt)!,
  }));
}

export async function fetchRescuers(): Promise<AppUser[]> {
  const db = getDb();
  const rows = await db
    .select({
      user: users,
      role: userRoles.role,
    })
    .from(users)
    .innerJoin(userRoles, eq(users.id, userRoles.userId))
    .where(eq(userRoles.role, "rescuer"));

  const byId = new Map<string, AppUser>();
  for (const { user, role } of rows) {
    const existing = byId.get(user.id);
    if (existing) {
      existing.roles.push(role);
    } else {
      byId.set(user.id, {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone ?? undefined,
        roles: [role],
      });
    }
  }
  return [...byId.values()];
}

export async function fetchUserByEmail(
  email: string,
): Promise<AppUser | null> {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const user = await db.query.users.findFirst({
    where: eq(users.email, normalized),
    with: { roles: { columns: { role: true } } },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? undefined,
    roles: user.roles.map((r) => r.role),
  };
}

export async function fetchUserById(id: string): Promise<AppUser | null> {
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: { roles: { columns: { role: true } } },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? undefined,
    roles: user.roles.map((r) => r.role),
  };
}

export async function fetchUserProfilePrefs(
  userId: string,
): Promise<UserProfilePrefs> {
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { phone: true },
  });
  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });

  return {
    userId,
    phone: user?.phone ?? "",
    department: prefs?.department ?? "",
    notifyEmail: prefs?.notifyEmail ?? true,
    notifyUrgentCases: prefs?.notifyUrgentCases ?? true,
    notifyAssignments: prefs?.notifyAssignments ?? true,
    notifyWeeklyDigest: prefs?.notifyWeeklyDigest ?? false,
    timezone: prefs?.timezone ?? "Asia/Manila",
  };
}

export async function upsertUserProfilePrefs(
  userId: string,
  patch: Partial<Omit<UserProfilePrefs, "userId">>,
): Promise<UserProfilePrefs> {
  const db = getDb();
  const current = await fetchUserProfilePrefs(userId);
  const next = { ...current, ...patch, userId };

  if (patch.phone !== undefined) {
    await db
      .update(users)
      .set({ phone: patch.phone, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  await db
    .insert(userPreferences)
    .values({
      userId,
      department: next.department,
      notifyEmail: next.notifyEmail,
      notifyUrgentCases: next.notifyUrgentCases,
      notifyAssignments: next.notifyAssignments,
      notifyWeeklyDigest: next.notifyWeeklyDigest,
      timezone: next.timezone,
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        department: next.department,
        notifyEmail: next.notifyEmail,
        notifyUrgentCases: next.notifyUrgentCases,
        notifyAssignments: next.notifyAssignments,
        notifyWeeklyDigest: next.notifyWeeklyDigest,
        timezone: next.timezone,
      },
    });

  return next;
}

export async function insertReportBundle(input: {
  reporterId: string;
  species: string;
  injurySeverity: string;
  environmentalDanger: string;
  vulnerability: string;
  description: string;
  contactPreference: string;
  locationLabel?: string;
  locationNote?: string;
  latitude: number;
  longitude: number;
  approximateLatitude: number;
  approximateLongitude: number;
  caseNumber: string;
  photoUrl?: string;
}): Promise<RescueCaseRecord> {
  const db = getDb();

  const [report] = await db
    .insert(rescueReports)
    .values({
      reporterId: input.reporterId,
      species: input.species as typeof rescueReports.$inferInsert.species,
      injurySeverity:
        input.injurySeverity as typeof rescueReports.$inferInsert.injurySeverity,
      environmentalDanger:
        input.environmentalDanger as typeof rescueReports.$inferInsert.environmentalDanger,
      vulnerability:
        input.vulnerability as typeof rescueReports.$inferInsert.vulnerability,
      description: input.description,
      contactPreference:
        input.contactPreference as typeof rescueReports.$inferInsert.contactPreference,
      locationLabel: input.locationLabel ?? null,
      locationNote: input.locationNote ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      approximateLatitude: input.approximateLatitude,
      approximateLongitude: input.approximateLongitude,
    })
    .returning();

  const [rescueCase] = await db
    .insert(rescueCases)
    .values({
      reportId: report.id,
      caseNumber: input.caseNumber,
      status: "report_submitted",
      urgencyScore: 0,
      urgencyLevel: "low",
    })
    .returning();

  if (input.photoUrl) {
    await db.insert(casePhotos).values({
      caseId: rescueCase.id,
      url: input.photoUrl,
      uploadedById: input.reporterId,
      photoType: "report",
    });
  }

  const created = await fetchCaseById(rescueCase.id);
  if (!created) throw new Error("Failed to load created case");
  return created;
}

export async function updateRescueCase(
  caseId: string,
  patch: Partial<typeof rescueCases.$inferInsert>,
): Promise<void> {
  const db = getDb();
  await db
    .update(rescueCases)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(rescueCases.id, caseId));
}

export async function insertAssignment(input: {
  caseId: string;
  rescuerId: string;
  assignedById: string;
}): Promise<AssignmentRecord> {
  const db = getDb();
  const rescuer = await fetchUserById(input.rescuerId);
  const [row] = await db
    .insert(rescuerAssignments)
    .values({
      caseId: input.caseId,
      rescuerId: input.rescuerId,
      status: "pending",
      assignedById: input.assignedById,
    })
    .returning();

  return {
    id: row.id,
    caseId: row.caseId,
    rescuerId: row.rescuerId,
    rescuerName: rescuer?.name ?? "Rescuer",
    status: row.status,
    assignedById: row.assignedById ?? undefined,
    assignedAt: toIso(row.assignedAt)!,
  };
}

export async function updateAssignment(
  assignmentId: string,
  patch: Partial<typeof rescuerAssignments.$inferInsert>,
): Promise<void> {
  const db = getDb();
  await db
    .update(rescuerAssignments)
    .set(patch)
    .where(eq(rescuerAssignments.id, assignmentId));
}

export async function updateRecommendationStatuses(
  caseId: string,
  selectedShelterId: string,
  rejectionReason?: string,
): Promise<void> {
  const db = getDb();
  const recs = await fetchRecommendationsForCase(caseId);
  const topRec = recs.find((r) => r.rank === 1);

  for (const rec of recs) {
    let status = rec.status;
    let rejection = rec.rejectionReason;
    if (rec.shelterId === selectedShelterId) {
      status = "selected";
    } else if (rec.status === "selected") {
      status = "rejected";
    }
    if (topRec && topRec.shelterId !== selectedShelterId && rec.rank === 1) {
      status = "overridden";
      rejection = rejectionReason;
    }
    await db
      .update(shelterRecommendations)
      .set({ status: status as "recommended", rejectionReason: rejection })
      .where(eq(shelterRecommendations.id, rec.id));
  }
}

export async function insertHandoff(input: {
  caseId: string;
  shelterId: string;
  confirmedByRescuerId?: string;
  confirmedByStaffId: string;
  handoffNotes?: string;
}): Promise<HandoffRecord> {
  const db = getDb();
  const [row] = await db
    .insert(shelterHandoffs)
    .values({
      caseId: input.caseId,
      shelterId: input.shelterId,
      confirmedByRescuerId: input.confirmedByRescuerId,
      confirmedByStaffId: input.confirmedByStaffId,
      handoffNotes: input.handoffNotes,
      confirmedAt: new Date(),
    })
    .returning();

  return {
    id: row.id,
    caseId: row.caseId,
    shelterId: row.shelterId,
    confirmedByRescuerId: row.confirmedByRescuerId ?? undefined,
    confirmedByStaffId: row.confirmedByStaffId ?? undefined,
    handoffNotes: row.handoffNotes ?? undefined,
    confirmedAt: toIso(row.confirmedAt),
  };
}

export async function markHandoffIntakeComplete(handoffId: string): Promise<void> {
  const db = getDb();
  await db
    .update(shelterHandoffs)
    .set({ intakeCompletedAt: new Date() })
    .where(eq(shelterHandoffs.id, handoffId));
}

export async function insertAnimal(
  input: typeof animals.$inferInsert,
  clearanceStatus: string,
): Promise<AnimalRecord> {
  const db = getDb();
  const [animal] = await db.insert(animals).values(input).returning();
  await db.insert(medicalClearances).values({
    animalId: animal.id,
    clearanceStatus:
      clearanceStatus as typeof medicalClearances.$inferInsert.clearanceStatus,
  });
  return mapAnimalRow(animal, clearanceStatus);
}

export async function updateAnimalFields(
  animalId: string,
  patch: Partial<typeof animals.$inferInsert>,
): Promise<void> {
  const db = getDb();
  await db
    .update(animals)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(animals.id, animalId));
}

export async function fetchAdoptionReadyAnimals(): Promise<AnimalRecord[]> {
  const all = await fetchAnimals();
  const ready = all.filter(
    (a) =>
      a.pathwayStage === "ready_for_adoption" ||
      a.pathwayStage === "ready_for_foster",
  );
  ready.sort((a, b) => {
    const aCleared = a.clearanceStatus === "medically_cleared" ? 0 : 1;
    const bCleared = b.clearanceStatus === "medically_cleared" ? 0 : 1;
    if (aCleared !== bCleared) return aCleared - bCleared;
    return (a.name ?? a.temporaryId).localeCompare(b.name ?? b.temporaryId);
  });
  return ready;
}

export async function fetchAdoptionApplications(filters?: {
  status?: string;
  animalId?: string;
}): Promise<AdoptionApplicationRecord[]> {
  const db = getDb();
  const rows = await db
    .select({
      application: adoptionApplications,
      animal: animals,
      reviewerName: users.name,
    })
    .from(adoptionApplications)
    .leftJoin(animals, eq(adoptionApplications.animalId, animals.id))
    .leftJoin(users, eq(adoptionApplications.reviewedById, users.id))
    .orderBy(desc(adoptionApplications.submittedAt));

  let result = rows.map(({ application, animal, reviewerName }) =>
    mapAdoptionApplicationRow(application, animal, reviewerName ?? undefined),
  );

  if (filters?.status) {
    result = result.filter((a) => a.status === filters.status);
  }
  if (filters?.animalId) {
    result = result.filter((a) => a.animalId === filters.animalId);
  }

  return result;
}

export async function fetchAdoptionApplicationById(
  id: string,
): Promise<AdoptionApplicationRecord | null> {
  const db = getDb();
  const row = await db
    .select({
      application: adoptionApplications,
      animal: animals,
      reviewerName: users.name,
    })
    .from(adoptionApplications)
    .leftJoin(animals, eq(adoptionApplications.animalId, animals.id))
    .leftJoin(users, eq(adoptionApplications.reviewedById, users.id))
    .where(eq(adoptionApplications.id, id))
    .limit(1);

  const first = row[0];
  if (!first) return null;
  return mapAdoptionApplicationRow(
    first.application,
    first.animal,
    first.reviewerName ?? undefined,
  );
}

export async function insertAdoptionApplication(input: {
  animalId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  socialLink?: string;
  applicantCity?: string;
  homeType: string;
  hasYard?: boolean;
  hasOtherPets?: boolean;
  householdSize?: number;
  experienceNotes?: string;
  motivation: string;
}): Promise<AdoptionApplicationRecord> {
  const db = getDb();
  const [row] = await db
    .insert(adoptionApplications)
    .values({
      animalId: input.animalId,
      applicantName: input.applicantName,
      applicantEmail: input.applicantEmail,
      applicantPhone: input.applicantPhone,
      socialLink: input.socialLink,
      applicantCity: input.applicantCity,
      homeType: input.homeType,
      hasYard: input.hasYard ?? false,
      hasOtherPets: input.hasOtherPets ?? false,
      householdSize: input.householdSize ?? 1,
      experienceNotes: input.experienceNotes,
      motivation: input.motivation,
      status: "pending",
    })
    .returning();

  const animal = await db.query.animals.findFirst({
    where: eq(animals.id, row.animalId),
  });
  return mapAdoptionApplicationRow(row, animal);
}

export async function fetchAdoptionInterestAnimalIds(
  userId: string,
): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ animalId: adoptionInterests.animalId })
    .from(adoptionInterests)
    .where(eq(adoptionInterests.userId, userId));
  return rows.map((r) => r.animalId);
}

export async function fetchAdoptionInterestsForUser(
  userId: string,
): Promise<Array<{ animalId: string; decision: "pass" | "interested" }>> {
  const db = getDb();
  const rows = await db
    .select({
      animalId: adoptionInterests.animalId,
      decision: adoptionInterests.decision,
    })
    .from(adoptionInterests)
    .where(eq(adoptionInterests.userId, userId));
  return rows.map((r) => ({
    animalId: r.animalId,
    decision: r.decision as "pass" | "interested",
  }));
}

export async function deleteAdoptionInterestsForUser(
  userId: string,
  decision?: "pass" | "interested",
): Promise<number> {
  const db = getDb();
  const condition = decision
    ? and(
        eq(adoptionInterests.userId, userId),
        eq(adoptionInterests.decision, decision),
      )
    : eq(adoptionInterests.userId, userId);
  const removed = await db
    .delete(adoptionInterests)
    .where(condition)
    .returning({ id: adoptionInterests.id });
  return removed.length;
}

export async function deleteAdoptionInterestForAnimal(
  userId: string,
  animalId: string,
): Promise<boolean> {
  const db = getDb();
  const removed = await db
    .delete(adoptionInterests)
    .where(
      and(
        eq(adoptionInterests.userId, userId),
        eq(adoptionInterests.animalId, animalId),
      ),
    )
    .returning({ id: adoptionInterests.id });
  return removed.length > 0;
}

export async function upsertAdoptionInterest(input: {
  userId: string;
  animalId: string;
  decision: "pass" | "interested";
}): Promise<void> {
  const db = getDb();
  const existing = await db
    .select({ id: adoptionInterests.id })
    .from(adoptionInterests)
    .where(
      and(
        eq(adoptionInterests.userId, input.userId),
        eq(adoptionInterests.animalId, input.animalId),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(adoptionInterests)
      .set({ decision: input.decision })
      .where(eq(adoptionInterests.id, existing[0].id));
    return;
  }

  await db.insert(adoptionInterests).values({
    userId: input.userId,
    animalId: input.animalId,
    decision: input.decision,
  });
}

export async function updateAdoptionApplication(
  id: string,
  patch: Partial<typeof adoptionApplications.$inferInsert>,
): Promise<void> {
  const db = getDb();
  await db
    .update(adoptionApplications)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(adoptionApplications.id, id));
}

export async function deleteAnimalById(id: string): Promise<boolean> {
  const db = getDb();
  const deleted = await db
    .delete(animals)
    .where(eq(animals.id, id))
    .returning({ id: animals.id });
  return deleted.length > 0;
}

export async function deleteSeedAnimalsByTemporaryIdPrefix(
  prefix = "A-26-",
): Promise<number> {
  const db = getDb();
  const deleted = await db
    .delete(animals)
    .where(like(animals.temporaryId, `${prefix}%`))
    .returning({ id: animals.id });
  return deleted.length;
}

export async function upsertMedicalClearance(
  animalId: string,
  data: Partial<typeof medicalClearances.$inferInsert> & {
    clearanceStatus: string;
  },
): Promise<void> {
  const db = getDb();
  const existing = await db.query.medicalClearances.findFirst({
    where: eq(medicalClearances.animalId, animalId),
  });

  if (!existing) {
    await db.insert(medicalClearances).values({
      animalId,
      ...data,
      clearanceStatus:
        data.clearanceStatus as typeof medicalClearances.$inferInsert.clearanceStatus,
    });
    return;
  }

  await db
    .update(medicalClearances)
    .set({
      ...data,
      clearanceStatus:
        data.clearanceStatus as typeof medicalClearances.$inferInsert.clearanceStatus,
      updatedAt: new Date(),
    })
    .where(eq(medicalClearances.animalId, animalId));
}

export async function insertAnimalNote(input: {
  animalId: string;
  authorId?: string;
  noteType: string;
  content: string;
}): Promise<void> {
  const db = getDb();
  await db.insert(animalNotes).values({
    animalId: input.animalId,
    authorId: input.authorId,
    noteType: input.noteType as typeof animalNotes.$inferInsert.noteType,
    content: input.content,
  });
}

export async function insertNotification(input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  caseId?: string;
}): Promise<void> {
  const db = getDb();
  await db.insert(notifications).values({
    userId: input.userId,
    type: input.type as typeof notifications.$inferInsert.type,
    title: input.title,
    message: input.message,
    caseId: input.caseId,
    read: false,
  });
}

export async function markNotificationRead(
  id: string,
  userId: string,
): Promise<void> {
  const db = getDb();
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const db = getDb();
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.read, false)),
    );
}

export async function updateShelterCapacityRow(
  shelterId: string,
  totalCapacity: number,
  currentOccupancy: number,
): Promise<void> {
  const db = getDb();
  await db
    .update(shelterCapacity)
    .set({
      totalCapacity,
      currentOccupancy,
      updatedAt: new Date(),
    })
    .where(eq(shelterCapacity.shelterId, shelterId));
}

export async function replaceShelterCapabilities(
  shelterId: string,
  capabilities: string[],
): Promise<void> {
  const db = getDb();
  await db
    .delete(shelterCapabilities)
    .where(eq(shelterCapabilities.shelterId, shelterId));

  if (capabilities.length === 0) return;

  await db.insert(shelterCapabilities).values(
    capabilities.map((capability) => ({
      shelterId,
      capability,
    })),
  );
}

export async function fetchAnimalByRescueCaseId(
  caseId: string,
): Promise<AnimalRecord | null> {
  const db = getDb();
  const animal = await db.query.animals.findFirst({
    where: eq(animals.rescueCaseId, caseId),
  });
  if (!animal) return null;
  const clearance = await db.query.medicalClearances.findFirst({
    where: eq(medicalClearances.animalId, animal.id),
  });
  return mapAnimalRow(
    animal,
    clearance?.clearanceStatus ?? "awaiting_examination",
    undefined,
  );
}

export async function fetchStaffUsersByRole(
  role: "shelter_staff" | "veterinarian",
): Promise<AppUser[]> {
  const db = getDb();
  const rows = await db
    .select({ user: users })
    .from(users)
    .innerJoin(userRoles, eq(users.id, userRoles.userId))
    .where(eq(userRoles.role, role));
  return rows.map(({ user }) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? undefined,
    roles: [role],
  }));
}

export async function fetchAdministratorMobileCaseIds(): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ caseId: rescuerAssignments.caseId })
    .from(rescuerAssignments)
    .where(ne(rescuerAssignments.status, "declined"));
  return [...new Set(rows.map((r) => r.caseId))];
}

export async function fetchFirstPendingAssignmentId(): Promise<string | null> {
  const db = getDb();
  const row = await db.query.rescuerAssignments.findFirst({
    where: eq(rescuerAssignments.status, "pending"),
    columns: { id: true },
  });
  return row?.id ?? null;
}

export async function fetchAssignmentsForCases(
  caseIds: string[],
): Promise<Map<string, AssignmentRecord[]>> {
  const result = new Map<string, AssignmentRecord[]>();
  await Promise.all(
    caseIds.map(async (caseId) => {
      result.set(caseId, await fetchAssignmentsForCase(caseId));
    }),
  );
  return result;
}

export async function clearWorkflowDataForTests(): Promise<void> {
  const db = getDb();
  await db.delete(notifications);
  await db.delete(animalNotes);
  await db.delete(medicalClearances);
  await db.delete(animals);
  await db.delete(shelterHandoffs);
  await db.delete(shelterRecommendations);
  await db.delete(rescuerAssignments);
  await db.delete(caseStatusHistory);
  await db.delete(casePhotos);
  await db.delete(rescueCases);
  await db.delete(rescueReports);
}
