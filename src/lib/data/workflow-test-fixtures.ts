import { stableUuid, shelterIdForSlug } from "@/db/stable-ids";
import { calculateUrgencyScore } from "@/lib/urgency/scoring";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";
import {
  assignRescuer,
  selectShelter,
  updateCaseStatus,
  verifyCase,
} from "@/lib/data/service";
import { clearWorkflowDataForTests, fetchUserByEmail } from "@/lib/data/db/repository";
import { getDb } from "@/db";
import {
  animals,
  casePhotos,
  medicalClearances,
  rescuerAssignments,
  rescueCases,
  rescueReports,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export const TEST_IDS = {
  case004: stableUuid("test-case-004"),
  case008: stableUuid("test-case-008"),
  assignment004: stableUuid("test-assignment-004"),
  animal001: stableUuid("test-animal-001"),
  lunaCase: stableUuid("test-case-luna"),
  lunaAnimal: stableUuid("test-animal-luna"),
};

export async function testUsers() {
  const emails = {
    maria: "citizen@rescutes.demo",
    james: "rescuer@rescutes.demo",
    sarah: "staff@rescutes.demo",
    anita: "vet@rescutes.demo",
    alex: "admin@rescutes.demo",
    rescuer4: "rescuer4@rescutes.demo",
  } as const;

  const entries = await Promise.all(
    Object.entries(emails).map(async ([key, email]) => {
      const user = await fetchUserByEmail(email);
      if (!user) throw new Error(`Seed user missing: ${email}`);
      return [key, user.id] as const;
    }),
  );

  return Object.fromEntries(entries) as Record<keyof typeof emails, string>;
}

export const TEST_SHELTERS = {
  paws: shelterIdForSlug("verified-paws-parc"),
};

function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

export async function resetWorkflowTestData() {
  await clearWorkflowDataForTests();
}

export async function seedCase004Fixtures() {
  const users = await testUsers();
  const verifiedAt = hoursAgo(1);
  const db = getDb();

  const [camille] = await Promise.all([
    fetchUserByEmail("camille.villanueva@rescutes.demo").catch(() => null),
  ]);
  const reporterId = camille?.id ?? users.maria;

  const [report] = await db
    .insert(rescueReports)
    .values({
      id: stableUuid("test-report-004"),
      reporterId,
      species: "cat",
      injurySeverity: "none_visible",
      environmentalDanger: "none",
      vulnerability: "adult_healthy",
      description:
        "Adult cream-and-white cat found wandering a residential garden near San Rafael Street. No collar, appears lost but uninjured. Caller can keep watch until a rescuer arrives.",
      contactPreference: "email",
      latitude: 14.5794,
      longitude: 121.0359,
      approximateLatitude: 14.5799,
      approximateLongitude: 121.0364,
    })
    .returning();

  const urgency = calculateUrgencyScore({
    injurySeverity: "none_visible",
    environmentalDanger: "none",
    vulnerability: "adult_healthy",
    verifiedAt,
  });

  await db.insert(rescueCases).values({
    id: TEST_IDS.case004,
    reportId: report.id,
    caseNumber: "RC-26-109",
    status: "rescuer_assigned",
    urgencyScore: urgency.score,
    urgencyLevel: urgency.level,
    verifiedAt,
    verifiedById: users.sarah,
  });

  await db.insert(casePhotos).values({
    id: stableUuid("test-photo-004"),
    caseId: TEST_IDS.case004,
    url: "/rescue-cases/test-case-004-cat.png",
    uploadedById: reporterId,
    photoType: "report",
  });

  await db.insert(rescuerAssignments).values({
    id: TEST_IDS.assignment004,
    caseId: TEST_IDS.case004,
    rescuerId: users.james,
    status: "pending",
    assignedById: users.sarah,
  });
}

export async function seedCase008Fixtures() {
  const users = await testUsers();
  const db = getDb();
  const [report] = await db
    .insert(rescueReports)
    .values({
      id: stableUuid("test-report-008"),
      reporterId: users.maria,
      species: "dog",
      injurySeverity: "moderate",
      environmentalDanger: "traffic",
      vulnerability: "adult_healthy",
      description: "Dog near highway, limping.",
      contactPreference: "in_app",
      latitude: DEMO_GEO.luna.latitude,
      longitude: DEMO_GEO.luna.longitude,
      approximateLatitude: DEMO_GEO.luna.latitude + 0.001,
      approximateLongitude: DEMO_GEO.luna.longitude + 0.001,
    })
    .returning();

  await db.insert(rescueCases).values({
    id: TEST_IDS.case008,
    reportId: report.id,
    caseNumber: "RC-2026-1008",
    status: "awaiting_shelter",
    assignedShelterId: TEST_SHELTERS.paws,
    urgencyScore: 55,
    urgencyLevel: "medium",
    verifiedAt: hoursAgo(6),
    verifiedById: users.sarah,
  });

  await db.insert(rescuerAssignments).values({
    id: stableUuid("test-assignment-008"),
    caseId: TEST_IDS.case008,
    rescuerId: users.rescuer4,
    status: "accepted",
    assignedById: users.sarah,
  });
}

export async function seedCase004Verified() {
  await seedCase004Fixtures();
  const users = await testUsers();
  const db = getDb();
  await db
    .update(rescueCases)
    .set({ status: "verified" })
    .where(eq(rescueCases.id, TEST_IDS.case004));
  await db
    .delete(rescuerAssignments)
    .where(eq(rescuerAssignments.caseId, TEST_IDS.case004));
  void users;
}

export async function seedLunaMedicalFixture() {
  const users = await testUsers();
  const db = getDb();
  const [report] = await db
    .insert(rescueReports)
    .values({
      id: stableUuid("test-report-luna"),
      reporterId: users.maria,
      species: "dog",
      injurySeverity: "moderate",
      environmentalDanger: "none",
      vulnerability: "juvenile",
      description: "Luna - young aspin with leg injury.",
      contactPreference: "in_app",
      latitude: DEMO_GEO.luna.latitude,
      longitude: DEMO_GEO.luna.longitude,
      approximateLatitude: DEMO_GEO.luna.latitude,
      approximateLongitude: DEMO_GEO.luna.longitude,
    })
    .returning();

  await db.insert(rescueCases).values({
    id: TEST_IDS.lunaCase,
    reportId: report.id,
    caseNumber: "RC-2026-LUNA",
    status: "shelter_handoff",
    assignedShelterId: TEST_SHELTERS.paws,
    animalId: TEST_IDS.lunaAnimal,
    urgencyScore: 72,
    urgencyLevel: "high",
    verifiedAt: hoursAgo(24),
    verifiedById: users.sarah,
  });

  await db.insert(animals).values({
    id: TEST_IDS.lunaAnimal,
    temporaryId: "A-LUNA",
    species: "dog",
    rescueCaseId: TEST_IDS.lunaCase,
    shelterId: TEST_SHELTERS.paws,
    intakeDate: hoursAgo(12),
    pathwayStage: "medical_clearance",
    recommendedNextAction: "Schedule veterinary examination",
  });

  await db.insert(medicalClearances).values({
    id: stableUuid("test-clearance-luna"),
    animalId: TEST_IDS.lunaAnimal,
    clearanceStatus: "awaiting_examination",
  });
}

export async function seedClearedAnimalFixture() {
  const users = await testUsers();
  const db = getDb();
  const [report] = await db
    .insert(rescueReports)
    .values({
      id: stableUuid("test-report-001"),
      reporterId: users.maria,
      species: "cat",
      injurySeverity: "minor",
      environmentalDanger: "none",
      vulnerability: "adult_healthy",
      description: "Recovered cat.",
      contactPreference: "email",
      latitude: 14.55,
      longitude: 121.02,
      approximateLatitude: 14.551,
      approximateLongitude: 121.021,
    })
    .returning();

  await db.insert(rescueCases).values({
    id: stableUuid("test-case-001"),
    reportId: report.id,
    caseNumber: "RC-2026-0001",
    status: "shelter_handoff",
    animalId: TEST_IDS.animal001,
    assignedShelterId: TEST_SHELTERS.paws,
    urgencyScore: 20,
    urgencyLevel: "low",
    verifiedAt: hoursAgo(48),
    verifiedById: users.sarah,
  });

  await db.insert(animals).values({
    id: TEST_IDS.animal001,
    temporaryId: "A-0001",
    species: "cat",
    rescueCaseId: stableUuid("test-case-001"),
    shelterId: TEST_SHELTERS.paws,
    intakeDate: hoursAgo(36),
    pathwayStage: "behavior_assessment",
    recommendedNextAction: "Complete behavioral assessment",
  });

  await db.insert(medicalClearances).values({
    id: stableUuid("test-clearance-001"),
    animalId: TEST_IDS.animal001,
    clearanceStatus: "medically_cleared",
    veterinarianId: users.anita,
  });
}

export async function prepareCase004ForRouting() {
  const users = await testUsers();
  await seedCase004Fixtures();
  await verifyCase(TEST_IDS.case004, users.sarah);
  await assignRescuer(TEST_IDS.case004, users.james, users.sarah);
}

export async function prepareCase008ForHandoff() {
  const users = await testUsers();
  await seedCase008Fixtures();
  await selectShelter(TEST_IDS.case008, TEST_SHELTERS.paws, users.sarah);
  await updateCaseStatus(TEST_IDS.case008, "awaiting_shelter", users.rescuer4);
}
