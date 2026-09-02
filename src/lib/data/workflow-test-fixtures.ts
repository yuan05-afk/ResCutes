/**
 * Workflow test fixtures. Production seed data stays empty; tests call these helpers.
 */
import { calculateUrgencyScore } from "@/lib/urgency/scoring";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";
import {
  DEMO_IDS,
  DEMO_CASES,
  DEMO_ASSIGNMENTS,
  DEMO_ANIMALS,
  DEMO_MEDICAL_CLEARANCES,
  DEMO_HANDOFFS,
  type DemoCase,
  type DemoAssignment,
  type DemoAnimal,
  type DemoMedicalClearance,
} from "@/lib/data/demo-store";

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function upsertCase(caseItem: DemoCase) {
  const idx = DEMO_CASES.findIndex((c) => c.id === caseItem.id);
  if (idx >= 0) DEMO_CASES[idx] = caseItem;
  else DEMO_CASES.push(caseItem);
}

function upsertAssignment(assignment: DemoAssignment) {
  const idx = DEMO_ASSIGNMENTS.findIndex((a) => a.id === assignment.id);
  if (idx >= 0) DEMO_ASSIGNMENTS[idx] = assignment;
  else DEMO_ASSIGNMENTS.push(assignment);
}

function upsertAnimal(animal: DemoAnimal) {
  const idx = DEMO_ANIMALS.findIndex((a) => a.id === animal.id);
  if (idx >= 0) DEMO_ANIMALS[idx] = animal;
  else DEMO_ANIMALS.push(animal);
}

function upsertClearance(clearance: DemoMedicalClearance) {
  const idx = DEMO_MEDICAL_CLEARANCES.findIndex((c) => c.id === clearance.id);
  if (idx >= 0) DEMO_MEDICAL_CLEARANCES[idx] = clearance;
  else DEMO_MEDICAL_CLEARANCES.push(clearance);
}

export function seedCase004Fixtures() {
  const verifiedAt = hoursAgo(1);
  const urgency = calculateUrgencyScore({
    injurySeverity: "none_visible",
    environmentalDanger: "none",
    vulnerability: "adult_healthy",
    verifiedAt: new Date(verifiedAt),
  });

  upsertCase({
    id: "case-004",
    caseNumber: "RC-2026-1004",
    reportId: "report-004",
    reporterId: DEMO_IDS.users.maria,
    reporterName: "Maria Santos",
    status: "rescuer_assigned",
    species: "rabbit",
    injurySeverity: "none_visible",
    environmentalDanger: "none",
    vulnerability: "adult_healthy",
    description: "Rabbit in residential garden, appears lost.",
    contactPreference: "email",
    latitude: 14.5794,
    longitude: 121.0359,
    approximateLatitude: 14.5799,
    approximateLongitude: 121.0364,
    urgencyScore: urgency.score,
    urgencyLevel: urgency.level,
    verifiedAt,
    verifiedById: DEMO_IDS.users.sarah,
    photoUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400",
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(1),
  });

  upsertAssignment({
    id: "assignment-004",
    caseId: "case-004",
    rescuerId: DEMO_IDS.users.james,
    rescuerName: "James Chen",
    status: "pending",
    assignedById: DEMO_IDS.users.sarah,
    assignedAt: hoursAgo(1),
  });
}

export function seedCase008Fixtures() {
  upsertCase({
    id: "case-008",
    caseNumber: "RC-2026-1008",
    reportId: "report-008",
    reporterId: "user-citizen-7",
    reporterName: "Siti Aminah",
    status: "awaiting_shelter",
    species: "cat",
    injurySeverity: "severe",
    environmentalDanger: "other_danger",
    vulnerability: "nursing",
    description: "Mother cat with kittens in drain.",
    contactPreference: "phone",
    latitude: 14.595,
    longitude: 120.995,
    approximateLatitude: 14.5955,
    approximateLongitude: 120.9955,
    urgencyScore: 78,
    urgencyLevel: "high",
    verifiedAt: hoursAgo(4),
    verifiedById: DEMO_IDS.users.sarah,
    assignedShelterId: DEMO_IDS.shelters.paws,
    photoUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400",
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(3),
  });

  upsertAssignment({
    id: "assignment-008",
    caseId: "case-008",
    rescuerId: DEMO_IDS.users.rescuer4,
    rescuerName: "Lisa Koh",
    status: "accepted",
    assignedById: DEMO_IDS.users.sarah,
    assignedAt: hoursAgo(3),
    respondedAt: hoursAgo(3),
  });

  const handoffIdx = DEMO_HANDOFFS.findIndex((h) => h.caseId === "case-008");
  if (handoffIdx >= 0) DEMO_HANDOFFS.splice(handoffIdx, 1);

  const animalIdx = DEMO_ANIMALS.findIndex((a) => a.rescueCaseId === "case-008");
  if (animalIdx >= 0) DEMO_ANIMALS.splice(animalIdx, 1);
}

export function seedAnimal001Fixtures() {
  upsertAnimal({
    id: "animal-001",
    name: "Mochi",
    temporaryId: "A-2026-1001",
    species: "cat",
    estimatedAge: "4 months",
    breed: "Domestic shorthair",
    color: "Grey tabby",
    sex: "Female",
    rescueCaseId: "case-001",
    shelterId: DEMO_IDS.shelters.cara,
    intakeDate: daysAgo(4),
    pathwayStage: "ready_for_foster",
    recommendedNextAction: "Place in foster care program",
    photoUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    clearanceStatus: "medically_cleared",
    createdAt: daysAgo(4),
  });

  upsertClearance({
    id: "clearance-001",
    animalId: "animal-001",
    veterinarianId: DEMO_IDS.users.anita,
    veterinarianName: "Dr. Anita Rao",
    examinationDate: daysAgo(4),
    generalCondition: "Good. Minor dehydration resolved",
    medicalPriority: "routine",
    treatmentSummary: "Fluids administered, deworming completed",
    clearanceStatus: "medically_cleared",
    veterinarianNotes: "Healthy kitten ready for foster placement.",
  });
}

export function seedLunaFixtures() {
  const lunaVerifiedAt = hoursAgo(18);
  const lunaUrgency = calculateUrgencyScore({
    injurySeverity: "moderate",
    environmentalDanger: "traffic",
    vulnerability: "adult_healthy",
    verifiedAt: new Date(lunaVerifiedAt),
  });

  upsertCase({
    id: DEMO_IDS.luna.case,
    caseNumber: "RC-2026-1042",
    reportId: DEMO_IDS.luna.report,
    reporterId: DEMO_IDS.users.maria,
    reporterName: "Maria Santos",
    status: "shelter_handoff",
    species: "dog",
    injurySeverity: "moderate",
    environmentalDanger: "traffic",
    vulnerability: "adult_healthy",
    description:
      "Medium-sized brown dog near busy road on España Boulevard, Sampaloc. Possible leg injury, limping and staying close to curb.",
    contactPreference: "in_app",
    latitude: DEMO_GEO.luna.latitude,
    longitude: DEMO_GEO.luna.longitude,
    approximateLatitude: DEMO_GEO.luna.approximateLatitude,
    approximateLongitude: DEMO_GEO.luna.approximateLongitude,
    urgencyScore: lunaUrgency.score,
    urgencyLevel: lunaUrgency.level,
    verifiedAt: lunaVerifiedAt,
    verifiedById: DEMO_IDS.users.sarah,
    assignedShelterId: DEMO_IDS.shelters.paws,
    animalId: DEMO_IDS.luna.animal,
    photoUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615e?w=400",
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(2),
  });

  upsertAnimal({
    id: DEMO_IDS.luna.animal,
    name: "Luna",
    temporaryId: "A-2026-1042",
    species: "dog",
    estimatedAge: "2-3 years",
    breed: "Mixed breed",
    color: "Brown",
    sex: "Female",
    rescueCaseId: DEMO_IDS.luna.case,
    shelterId: DEMO_IDS.shelters.paws,
    intakeDate: hoursAgo(4),
    pathwayStage: "medical_clearance",
    recommendedNextAction: "Continue treatment and monitor leg recovery",
    photoUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615e?w=400",
    clearanceStatus: "under_treatment",
    createdAt: hoursAgo(4),
  });

  upsertClearance({
    id: DEMO_IDS.luna.clearance,
    animalId: DEMO_IDS.luna.animal,
    veterinarianId: DEMO_IDS.users.anita,
    veterinarianName: "Dr. Anita Rao",
    examinationDate: hoursAgo(3),
    generalCondition:
      "Moderate. Leg injury with swelling, otherwise alert and responsive",
    medicalPriority: "urgent",
    treatmentSummary:
      "Radiograph shows hairline fracture in right hind leg. Splint applied. Pain management initiated.",
    restrictions: "Limited mobility. No outdoor exercise for 4-6 weeks",
    followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    clearanceStatus: "under_treatment",
    veterinarianNotes:
      "Luna is responding well to treatment. Fracture should heal with rest and splint.",
  });
}
