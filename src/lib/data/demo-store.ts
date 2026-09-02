/**
 * In-memory demo data store used when DATABASE_URL is not configured,
 * and as the source for database seeding.
 */
import { calculateUrgencyScore } from "@/lib/urgency/scoring";
import { calculateShelterRecommendations } from "@/lib/routing/shelter-routing";
import { DEMO_GEO } from "@/lib/data/metro-manila-geo";
import type { Role } from "@/lib/auth/permissions";

// Fixed IDs for demo consistency
export const DEMO_IDS = {
  users: {
    maria: "user-maria-citizen",
    james: "user-james-rescuer",
    sarah: "user-sarah-staff",
    anita: "user-anita-vet",
    alex: "user-alex-admin",
    rescuer2: "user-rescuer-2",
    rescuer3: "user-rescuer-3",
    rescuer4: "user-rescuer-4",
    rescuer5: "user-rescuer-5",
  },
  shelters: {
    pawsHope: "shelter-paws-hope",
    greenValley: "shelter-green-valley",
    coastalRescue: "shelter-coastal-rescue",
  },
  luna: {
    report: "report-luna",
    case: "case-luna",
    animal: "animal-luna",
    assignment: "assignment-luna",
    clearance: "clearance-luna",
  },
};

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  password: string;
  roles: Role[];
}

export interface DemoShelter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  speciesAccepted: string[];
  capabilities: string[];
  totalCapacity: number;
  currentOccupancy: number;
  operationalWorkload: number;
}

export interface DemoCase {
  id: string;
  caseNumber: string;
  reportId: string;
  reporterId: string;
  reporterName: string;
  status: string;
  species: string;
  injurySeverity: string;
  environmentalDanger: string;
  vulnerability: string;
  description: string;
  contactPreference: string;
  latitude: number;
  longitude: number;
  approximateLatitude: number;
  approximateLongitude: number;
  urgencyScore: number;
  urgencyLevel: string;
  urgencyOverrideScore?: number;
  urgencyOverrideReason?: string;
  verifiedAt?: string;
  verifiedById?: string;
  rejectionReason?: string;
  assignedShelterId?: string;
  animalId?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DemoAssignment {
  id: string;
  caseId: string;
  rescuerId: string;
  rescuerName: string;
  status: string;
  assignedById?: string;
  declineReason?: string;
  assignedAt: string;
  respondedAt?: string;
}

export interface DemoRecommendation {
  id: string;
  caseId: string;
  shelterId: string;
  shelterName: string;
  matchScore: number;
  distanceKm: number | null;
  reasons: string[];
  warnings: string[];
  missingCapabilities: string[];
  rank: number;
  status: string;
  rejectionReason?: string;
}

export interface DemoAnimal {
  id: string;
  name?: string;
  temporaryId: string;
  species: string;
  estimatedAge?: string;
  breed?: string;
  color?: string;
  sex?: string;
  rescueCaseId?: string;
  shelterId?: string;
  intakeDate?: string;
  pathwayStage: string;
  recommendedNextAction?: string;
  photoUrl?: string;
  clearanceStatus: string;
  createdAt: string;
}

export interface DemoMedicalClearance {
  id: string;
  animalId: string;
  veterinarianId?: string;
  veterinarianName?: string;
  examinationDate?: string;
  generalCondition?: string;
  medicalPriority?: string;
  treatmentSummary?: string;
  restrictions?: string;
  followUpDate?: string;
  clearanceStatus: string;
  veterinarianNotes?: string;
}

export interface DemoStatusHistory {
  id: string;
  caseId: string;
  fromStatus?: string;
  toStatus: string;
  changedById?: string;
  note?: string;
  createdAt: string;
}

export interface DemoNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  caseId?: string;
  read: boolean;
  createdAt: string;
}

export interface DemoHandoff {
  id: string;
  caseId: string;
  shelterId: string;
  confirmedByRescuerId?: string;
  confirmedByStaffId?: string;
  handoffNotes?: string;
  confirmedAt?: string;
  intakeCompletedAt?: string;
}

export interface DemoAnimalNote {
  id: string;
  animalId: string;
  authorId?: string;
  authorName?: string;
  noteType: string;
  content: string;
  createdAt: string;
}

/** Persist mutable demo arrays across Next.js server action / RSC module re-evaluations. */
function bindGlobalMutable<T>(globalKey: string, seed: T): T {
  const store = globalThis as typeof globalThis & Record<string, T | undefined>;
  if (!store[globalKey]) {
    store[globalKey] = seed;
  }
  return store[globalKey]!;
}

// Metro Manila demo geography (fictional hackathon data)

export const DEMO_USERS: DemoUser[] = [
  {
    id: DEMO_IDS.users.maria,
    email: "citizen@rescutes.demo",
    name: "Maria Santos",
    phone: "+63 917 123 4567",
    password: "demo1234",
    roles: ["citizen"],
  },
  {
    id: DEMO_IDS.users.james,
    email: "rescuer@rescutes.demo",
    name: "James Chen",
    phone: "+63 917 234 5678",
    password: "demo1234",
    roles: ["rescuer"],
  },
  {
    id: DEMO_IDS.users.sarah,
    email: "staff@rescutes.demo",
    name: "Sarah Lim",
    phone: "+63 917 345 6789",
    password: "demo1234",
    roles: ["shelter_staff"],
  },
  {
    id: DEMO_IDS.users.anita,
    email: "vet@rescutes.demo",
    name: "Dr. Anita Rao",
    phone: "+63 917 456 7890",
    password: "demo1234",
    roles: ["veterinarian"],
  },
  {
    id: DEMO_IDS.users.alex,
    email: "admin@rescutes.demo",
    name: "Alex Wong",
    phone: "+63 917 567 8901",
    password: "demo1234",
    roles: ["administrator", "shelter_staff"],
  },
  {
    id: DEMO_IDS.users.rescuer2,
    email: "rescuer2@rescutes.demo",
    name: "Priya Nair",
    password: "demo1234",
    roles: ["rescuer"],
  },
  {
    id: DEMO_IDS.users.rescuer3,
    email: "rescuer3@rescutes.demo",
    name: "Tom Bradley",
    password: "demo1234",
    roles: ["rescuer"],
  },
  {
    id: DEMO_IDS.users.rescuer4,
    email: "rescuer4@rescutes.demo",
    name: "Lisa Koh",
    password: "demo1234",
    roles: ["rescuer"],
  },
  {
    id: DEMO_IDS.users.rescuer5,
    email: "rescuer5@rescutes.demo",
    name: "David Tan",
    password: "demo1234",
    roles: ["rescuer"],
  },
];

const SEED_SHELTERS: DemoShelter[] = [
  {
    id: DEMO_IDS.shelters.pawsHope,
    name: "Paws Hope Animal Shelter",
    address: DEMO_GEO.shelters.pawsHope.address,
    latitude: DEMO_GEO.shelters.pawsHope.latitude,
    longitude: DEMO_GEO.shelters.pawsHope.longitude,
    phone: DEMO_GEO.shelters.pawsHope.phone,
    speciesAccepted: ["dog", "cat"],
    capabilities: [
      "basic veterinary care",
      "orthopedic treatment",
      "emergency surgery",
      "wound care",
    ],
    totalCapacity: 80,
    currentOccupancy: 52,
    operationalWorkload: 35,
  },
  {
    id: DEMO_IDS.shelters.greenValley,
    name: "Green Valley Rescue Centre",
    address: DEMO_GEO.shelters.greenValley.address,
    latitude: DEMO_GEO.shelters.greenValley.latitude,
    longitude: DEMO_GEO.shelters.greenValley.longitude,
    phone: DEMO_GEO.shelters.greenValley.phone,
    speciesAccepted: ["dog", "cat", "rabbit", "bird"],
    capabilities: [
      "basic veterinary care",
      "wound care",
      "behavioral assessment",
    ],
    totalCapacity: 120,
    currentOccupancy: 78,
    operationalWorkload: 55,
  },
  {
    id: DEMO_IDS.shelters.coastalRescue,
    name: "Coastal Animal Rescue",
    address: DEMO_GEO.shelters.coastalRescue.address,
    latitude: DEMO_GEO.shelters.coastalRescue.latitude,
    longitude: DEMO_GEO.shelters.coastalRescue.longitude,
    phone: DEMO_GEO.shelters.coastalRescue.phone,
    speciesAccepted: ["dog", "cat", "bird"],
    capabilities: [
      "basic veterinary care",
      "emergency surgery",
      "orthopedic treatment",
      "intensive care",
    ],
    totalCapacity: 60,
    currentOccupancy: 38,
    operationalWorkload: 25,
  },
];

export const DEMO_SHELTERS = bindGlobalMutable(
  "__rescutes_shelters",
  SEED_SHELTERS,
);

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

// Luna demo case - under treatment
const lunaVerifiedAt = hoursAgo(18);
const lunaUrgency = calculateUrgencyScore({
  injurySeverity: "moderate",
  environmentalDanger: "traffic",
  vulnerability: "adult_healthy",
  verifiedAt: new Date(lunaVerifiedAt),
});

const case004VerifiedAt = hoursAgo(1);
const case004Urgency = calculateUrgencyScore({
  injurySeverity: "none_visible",
  environmentalDanger: "none",
  vulnerability: "adult_healthy",
  verifiedAt: new Date(case004VerifiedAt),
});

const SEED_CASES: DemoCase[] = [
  {
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
      "Medium-sized brown dog near busy road on España Boulevard, Sampaloc. Possible leg injury, limping and staying close to curb. Seems scared but not aggressive.",
    contactPreference: "in_app",
    latitude: DEMO_GEO.luna.latitude,
    longitude: DEMO_GEO.luna.longitude,
    approximateLatitude: DEMO_GEO.luna.approximateLatitude,
    approximateLongitude: DEMO_GEO.luna.approximateLongitude,
    urgencyScore: lunaUrgency.score,
    urgencyLevel: lunaUrgency.level,
    verifiedAt: lunaVerifiedAt,
    verifiedById: DEMO_IDS.users.sarah,
    assignedShelterId: DEMO_IDS.shelters.pawsHope,
    animalId: DEMO_IDS.luna.animal,
    photoUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615e?w=400",
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(2),
  },
  {
    id: "case-001",
    caseNumber: "RC-2026-1001",
    reportId: "report-001",
    reporterId: DEMO_IDS.users.maria,
    reporterName: "Maria Santos",
    status: "completed",
    species: "cat",
    injurySeverity: "minor",
    environmentalDanger: "weather",
    vulnerability: "juvenile",
    description: "Kitten found under parked car during rain.",
    contactPreference: "phone",
    latitude: 14.5547,
    longitude: 121.0244,
    approximateLatitude: 14.5552,
    approximateLongitude: 121.0249,
    urgencyScore: 45,
    urgencyLevel: "medium",
    verifiedAt: daysAgo(5),
    verifiedById: DEMO_IDS.users.sarah,
    assignedShelterId: DEMO_IDS.shelters.greenValley,
    animalId: "animal-001",
    photoUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    createdAt: daysAgo(6),
    updatedAt: daysAgo(3),
  },
  {
    id: "case-002",
    caseNumber: "RC-2026-1002",
    reportId: "report-002",
    reporterId: "user-citizen-2",
    reporterName: "John Lee",
    status: "rescue_in_progress",
    species: "dog",
    injurySeverity: "severe",
    environmentalDanger: "trapped",
    vulnerability: "adult_healthy",
    description: "Dog trapped in construction site fencing.",
    contactPreference: "in_app",
    latitude: 14.5764,
    longitude: 121.0851,
    approximateLatitude: 14.5769,
    approximateLongitude: 121.0856,
    urgencyScore: 72,
    urgencyLevel: "high",
    verifiedAt: hoursAgo(3),
    verifiedById: DEMO_IDS.users.sarah,
    assignedShelterId: DEMO_IDS.shelters.coastalRescue,
    photoUrl: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d9?w=400",
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(1),
  },
  {
    id: "case-003",
    caseNumber: "RC-2026-1003",
    reportId: "report-003",
    reporterId: "user-citizen-3",
    reporterName: "Emily Tan",
    status: "verified",
    species: "bird",
    injurySeverity: "moderate",
    environmentalDanger: "predators",
    vulnerability: "juvenile",
    description: "Injured mynah on ground near park.",
    contactPreference: "no_contact",
    latitude: 14.65,
    longitude: 121.05,
    approximateLatitude: 14.6505,
    approximateLongitude: 121.0505,
    urgencyScore: 52,
    urgencyLevel: "medium",
    verifiedAt: hoursAgo(2),
    verifiedById: DEMO_IDS.users.sarah,
    photoUrl: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400",
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(2),
  },
  {
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
    urgencyScore: case004Urgency.score,
    urgencyLevel: case004Urgency.level,
    verifiedAt: case004VerifiedAt,
    verifiedById: DEMO_IDS.users.sarah,
    photoUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400",
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(1),
  },
  {
    id: "case-005",
    caseNumber: "RC-2026-1005",
    reportId: "report-005",
    reporterId: "user-citizen-4",
    reporterName: "Wei Zhang",
    status: "under_verification",
    species: "dog",
    injurySeverity: "critical",
    environmentalDanger: "traffic",
    vulnerability: "pregnant",
    description: "Pregnant dog lying on EDSA highway shoulder.",
    contactPreference: "phone",
    latitude: 14.598,
    longitude: 120.982,
    approximateLatitude: 14.5985,
    approximateLongitude: 120.9825,
    urgencyScore: 0,
    urgencyLevel: "low",
    photoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
  },
  {
    id: "case-006",
    caseNumber: "RC-2026-1006",
    reportId: "report-006",
    reporterId: "user-citizen-5",
    reporterName: "Priya Sharma",
    status: "rejected",
    species: "cat",
    injurySeverity: "none_visible",
    environmentalDanger: "none",
    vulnerability: "adult_healthy",
    description: "Cat sitting on porch, may be owned.",
    contactPreference: "no_contact",
    latitude: 14.4793,
    longitude: 121.0198,
    approximateLatitude: 14.4798,
    approximateLongitude: 121.0203,
    urgencyScore: 5,
    urgencyLevel: "low",
    rejectionReason: "Appears to be a owned pet with collar and tag.",
    photoUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "case-007",
    caseNumber: "RC-2026-1007",
    reportId: "report-007",
    reporterId: "user-citizen-6",
    reporterName: "Kevin Ong",
    status: "animal_secured",
    species: "dog",
    injurySeverity: "moderate",
    environmentalDanger: "weather",
    vulnerability: "elderly",
    description: "Senior dog wandering in heavy rain.",
    contactPreference: "in_app",
    latitude: 14.61,
    longitude: 121.01,
    approximateLatitude: 14.6105,
    approximateLongitude: 121.0105,
    urgencyScore: 58,
    urgencyLevel: "medium",
    verifiedAt: hoursAgo(6),
    verifiedById: DEMO_IDS.users.sarah,
    assignedShelterId: DEMO_IDS.shelters.greenValley,
    photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    createdAt: hoursAgo(8),
    updatedAt: hoursAgo(2),
  },
  {
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
    assignedShelterId: DEMO_IDS.shelters.pawsHope,
    photoUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400",
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(3),
  },
  {
    id: "case-009",
    caseNumber: "RC-2026-1009",
    reportId: "report-009",
    reporterId: "user-citizen-8",
    reporterName: "Raj Patel",
    status: "duplicate",
    species: "dog",
    injurySeverity: "minor",
    environmentalDanger: "traffic",
    vulnerability: "juvenile",
    description: "Puppy near road. Duplicate of case RC-2026-1002.",
    contactPreference: "in_app",
    latitude: 14.5768,
    longitude: 121.0855,
    approximateLatitude: 14.5773,
    approximateLongitude: 121.086,
    urgencyScore: 0,
    urgencyLevel: "low",
    photoUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(4),
  },
  {
    id: "case-010",
    caseNumber: "RC-2026-1010",
    reportId: "report-010",
    reporterId: "user-citizen-9",
    reporterName: "Grace Lim",
    status: "completed",
    species: "dog",
    injurySeverity: "minor",
    environmentalDanger: "none",
    vulnerability: "adult_healthy",
    description: "Stray dog in apartment building corridor.",
    contactPreference: "email",
    latitude: 14.648,
    longitude: 121.055,
    approximateLatitude: 14.6485,
    approximateLongitude: 121.0555,
    urgencyScore: 22,
    urgencyLevel: "low",
    verifiedAt: daysAgo(10),
    verifiedById: DEMO_IDS.users.sarah,
    assignedShelterId: DEMO_IDS.shelters.pawsHope,
    animalId: "animal-010",
    photoUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615e?w=400",
    createdAt: daysAgo(12),
    updatedAt: daysAgo(8),
  },
  {
    id: "case-011",
    caseNumber: "RC-2026-1011",
    reportId: "report-011",
    reporterId: "user-citizen-10",
    reporterName: "Hassan Ali",
    status: "rescue_accepted",
    species: "cat",
    injurySeverity: "moderate",
    environmentalDanger: "trapped",
    vulnerability: "disabled",
    description: "Cat with visible limp stuck in drain pipe.",
    contactPreference: "phone",
    latitude: 14.605,
    longitude: 120.985,
    approximateLatitude: 14.6055,
    approximateLongitude: 120.9855,
    urgencyScore: 65,
    urgencyLevel: "high",
    verifiedAt: hoursAgo(2),
    verifiedById: DEMO_IDS.users.sarah,
    photoUrl: "https://images.unsplash.com/photo-1495364720213-0fbb17e0280a?w=400",
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(1),
  },
  {
    id: "case-012",
    caseNumber: "RC-2026-1012",
    reportId: "report-012",
    reporterId: "user-citizen-11",
    reporterName: "Nora Ibrahim",
    status: "report_submitted",
    species: "bird",
    injurySeverity: "none_visible",
    environmentalDanger: "predators",
    vulnerability: "juvenile",
    description: "Baby bird on ground under tree.",
    contactPreference: "no_contact",
    latitude: 14.582,
    longitude: 121.04,
    approximateLatitude: 14.5825,
    approximateLongitude: 121.0405,
    urgencyScore: 0,
    urgencyLevel: "low",
    photoUrl: "https://images.unsplash.com/photo-1452570142745-3165880467eb?w=400",
    createdAt: hoursAgo(0.5),
    updatedAt: hoursAgo(0.5),
  },
];

export const DEMO_CASES = bindGlobalMutable("__rescutes_cases", SEED_CASES);

const SEED_ASSIGNMENTS: DemoAssignment[] = [
  {
    id: DEMO_IDS.luna.assignment,
    caseId: DEMO_IDS.luna.case,
    rescuerId: DEMO_IDS.users.james,
    rescuerName: "James Chen",
    status: "completed",
    assignedById: DEMO_IDS.users.sarah,
    assignedAt: hoursAgo(16),
    respondedAt: hoursAgo(15),
  },
  {
    id: "assignment-002",
    caseId: "case-002",
    rescuerId: DEMO_IDS.users.rescuer3,
    rescuerName: "Tom Bradley",
    status: "accepted",
    assignedById: DEMO_IDS.users.sarah,
    assignedAt: hoursAgo(2),
    respondedAt: hoursAgo(2),
  },
  {
    id: "assignment-004",
    caseId: "case-004",
    rescuerId: DEMO_IDS.users.james,
    rescuerName: "James Chen",
    status: "pending",
    assignedById: DEMO_IDS.users.sarah,
    assignedAt: hoursAgo(1),
  },
  {
    id: "assignment-007",
    caseId: "case-007",
    rescuerId: DEMO_IDS.users.rescuer2,
    rescuerName: "Priya Nair",
    status: "accepted",
    assignedById: DEMO_IDS.users.sarah,
    assignedAt: hoursAgo(5),
    respondedAt: hoursAgo(5),
  },
  {
    id: "assignment-008",
    caseId: "case-008",
    rescuerId: DEMO_IDS.users.rescuer4,
    rescuerName: "Lisa Koh",
    status: "accepted",
    assignedById: DEMO_IDS.users.sarah,
    assignedAt: hoursAgo(3),
    respondedAt: hoursAgo(3),
  },
  {
    id: "assignment-011",
    caseId: "case-011",
    rescuerId: DEMO_IDS.users.rescuer5,
    rescuerName: "David Tan",
    status: "accepted",
    assignedById: DEMO_IDS.users.sarah,
    assignedAt: hoursAgo(2),
    respondedAt: hoursAgo(1),
  },
  {
    id: "assignment-declined",
    caseId: "case-003",
    rescuerId: DEMO_IDS.users.rescuer2,
    rescuerName: "Priya Nair",
    status: "declined",
    assignedById: DEMO_IDS.users.sarah,
    declineReason: "Currently handling another case in opposite direction.",
    assignedAt: hoursAgo(1),
    respondedAt: hoursAgo(1),
  },
];

export const DEMO_ASSIGNMENTS = bindGlobalMutable(
  "__rescutes_assignments",
  SEED_ASSIGNMENTS,
);

function buildLunaRecommendations(): DemoRecommendation[] {
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
      caseLatitude: DEMO_GEO.luna.latitude,
      caseLongitude: DEMO_GEO.luna.longitude,
      species: "dog",
      requiredCapabilities: ["orthopedic treatment", "wound care"],
    },
  );
  return recs.map((r, i) => ({
    id: `rec-luna-${i}`,
    caseId: DEMO_IDS.luna.case,
    shelterId: r.shelterId,
    shelterName: r.shelterName,
    matchScore: r.matchScore,
    distanceKm: r.distanceKm,
    reasons: r.reasons,
    warnings: r.warnings,
    missingCapabilities: r.missingCapabilities,
    rank: r.rank,
    status: r.rank === 1 ? "selected" : "recommended",
  }));
}

const SEED_RECOMMENDATIONS = buildLunaRecommendations();
export const DEMO_RECOMMENDATIONS = bindGlobalMutable(
  "__rescutes_recommendations",
  SEED_RECOMMENDATIONS,
);

const SEED_ANIMALS: DemoAnimal[] = [
  {
    id: DEMO_IDS.luna.animal,
    name: "Luna",
    temporaryId: "A-2026-1042",
    species: "dog",
    estimatedAge: "2-3 years",
    breed: "Mixed breed",
    color: "Brown",
    sex: "Female",
    rescueCaseId: DEMO_IDS.luna.case,
    shelterId: DEMO_IDS.shelters.pawsHope,
    intakeDate: hoursAgo(4),
    pathwayStage: "medical_clearance",
    recommendedNextAction: "Continue treatment and monitor leg recovery",
    photoUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615e?w=400",
    clearanceStatus: "under_treatment",
    createdAt: hoursAgo(4),
  },
  {
    id: "animal-001",
    name: "Mochi",
    temporaryId: "A-2026-1001",
    species: "cat",
    estimatedAge: "4 months",
    breed: "Domestic shorthair",
    color: "Grey tabby",
    sex: "Female",
    rescueCaseId: "case-001",
    shelterId: DEMO_IDS.shelters.greenValley,
    intakeDate: daysAgo(4),
    pathwayStage: "ready_for_foster",
    recommendedNextAction: "Place in foster care program",
    photoUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    clearanceStatus: "medically_cleared",
    createdAt: daysAgo(4),
  },
  {
    id: "animal-002",
    temporaryId: "A-2026-1002",
    species: "dog",
    estimatedAge: "5 years",
    breed: "Labrador mix",
    color: "Black",
    sex: "Male",
    rescueCaseId: "case-002",
    shelterId: DEMO_IDS.shelters.coastalRescue,
    intakeDate: hoursAgo(1),
    pathwayStage: "intake",
    recommendedNextAction: "Await rescue completion",
    photoUrl: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d9?w=400",
    clearanceStatus: "awaiting_examination",
    createdAt: hoursAgo(1),
  },
  {
    id: "animal-003",
    name: "Buddy",
    temporaryId: "A-2026-1010",
    species: "dog",
    estimatedAge: "3 years",
    breed: "Terrier mix",
    color: "White and brown",
    sex: "Male",
    rescueCaseId: "case-010",
    shelterId: DEMO_IDS.shelters.pawsHope,
    intakeDate: daysAgo(9),
    pathwayStage: "ready_for_adoption",
    recommendedNextAction: "List for adoption",
    photoUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615e?w=400",
    clearanceStatus: "medically_cleared",
    createdAt: daysAgo(9),
  },
  {
    id: "animal-004",
    name: "Whiskers",
    temporaryId: "A-2026-1007",
    species: "dog",
    estimatedAge: "10 years",
    breed: "Mixed breed",
    color: "Tan",
    sex: "Male",
    rescueCaseId: "case-007",
    shelterId: DEMO_IDS.shelters.greenValley,
    intakeDate: hoursAgo(2),
    pathwayStage: "medical_clearance",
    recommendedNextAction: "Complete senior health assessment",
    photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    clearanceStatus: "under_examination",
    createdAt: hoursAgo(2),
  },
  {
    id: "animal-006",
    name: "Pepper",
    temporaryId: "A-2026-1011",
    species: "cat",
    estimatedAge: "1 year",
    breed: "Domestic shorthair",
    color: "Black",
    sex: "Female",
    rescueCaseId: "case-011",
    shelterId: DEMO_IDS.shelters.greenValley,
    intakeDate: hoursAgo(1),
    pathwayStage: "intake",
    recommendedNextAction: "Orthopedic assessment needed",
    photoUrl: "https://images.unsplash.com/photo-1495364720213-0fbb17e0280a?w=400",
    clearanceStatus: "awaiting_examination",
    createdAt: hoursAgo(1),
  },
  {
    id: "animal-007",
    temporaryId: "A-2026-1012",
    species: "bird",
    estimatedAge: "Juvenile",
    breed: "Mynah",
    color: "Brown",
    sex: "Unknown",
    shelterId: DEMO_IDS.shelters.coastalRescue,
    intakeDate: daysAgo(7),
    pathwayStage: "behavior_assessment",
    recommendedNextAction: "Behavioral assessment before release",
    photoUrl: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400",
    clearanceStatus: "medically_cleared",
    createdAt: daysAgo(7),
  },
  {
    id: "animal-008",
    name: "Coco",
    temporaryId: "A-2026-1013",
    species: "rabbit",
    estimatedAge: "1 year",
    breed: "Domestic rabbit",
    color: "White",
    sex: "Female",
    shelterId: DEMO_IDS.shelters.greenValley,
    intakeDate: daysAgo(14),
    pathwayStage: "ready_for_adoption",
    recommendedNextAction: "List for adoption",
    photoUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400",
    clearanceStatus: "medically_cleared",
    createdAt: daysAgo(14),
  },
  {
    id: "animal-009",
    temporaryId: "A-2026-1014",
    species: "dog",
    estimatedAge: "6 years",
    breed: "Aspin mix",
    color: "Cream",
    sex: "Male",
    shelterId: DEMO_IDS.shelters.pawsHope,
    intakeDate: daysAgo(21),
    pathwayStage: "long_stay",
    recommendedNextAction: "Review long-stay pathway options",
    photoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
    clearanceStatus: "medically_cleared",
    createdAt: daysAgo(21),
  },
  {
    id: "animal-010",
    name: "Shadow",
    temporaryId: "A-2026-1015",
    species: "cat",
    estimatedAge: "3 years",
    breed: "Domestic shorthair",
    color: "Grey",
    sex: "Male",
    shelterId: DEMO_IDS.shelters.coastalRescue,
    intakeDate: daysAgo(5),
    pathwayStage: "ready_for_foster",
    recommendedNextAction: "Match with foster family",
    photoUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400",
    clearanceStatus: "medically_cleared",
    createdAt: daysAgo(5),
  },
];

export const DEMO_ANIMALS = bindGlobalMutable("__rescutes_animals", SEED_ANIMALS);

const SEED_MEDICAL_CLEARANCES: DemoMedicalClearance[] = [
  {
    id: DEMO_IDS.luna.clearance,
    animalId: DEMO_IDS.luna.animal,
    veterinarianId: DEMO_IDS.users.anita,
    veterinarianName: "Dr. Anita Rao",
    examinationDate: hoursAgo(3),
    generalCondition: "Moderate. Leg injury with swelling, otherwise alert and responsive",
    medicalPriority: "urgent",
    treatmentSummary:
      "Radiograph shows hairline fracture in right hind leg. Splint applied. Pain management initiated.",
    restrictions: "Limited mobility. No outdoor exercise for 4-6 weeks",
    followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    clearanceStatus: "under_treatment",
    veterinarianNotes:
      "Luna is responding well to treatment. Fracture should heal with rest and splint. Monitor for infection at splint site.",
  },
  {
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
  },
  {
    id: "clearance-003",
    animalId: "animal-003",
    veterinarianId: DEMO_IDS.users.anita,
    veterinarianName: "Dr. Anita Rao",
    examinationDate: daysAgo(8),
    generalCondition: "Excellent",
    medicalPriority: "routine",
    treatmentSummary: "Vaccinations updated, neutering completed",
    clearanceStatus: "medically_cleared",
    veterinarianNotes: "Ready for adoption.",
  },
  {
    id: "clearance-004",
    animalId: "animal-004",
    veterinarianId: DEMO_IDS.users.anita,
    veterinarianName: "Dr. Anita Rao",
    examinationDate: hoursAgo(1),
    generalCondition: "Fair. Age-related joint stiffness",
    medicalPriority: "routine",
    treatmentSummary: "Senior health panel ordered",
    clearanceStatus: "under_examination",
    veterinarianNotes: "Awaiting blood work results.",
  },
];

export const DEMO_MEDICAL_CLEARANCES = bindGlobalMutable(
  "__rescutes_medical_clearances",
  SEED_MEDICAL_CLEARANCES,
);

const SEED_STATUS_HISTORY: DemoStatusHistory[] = [
  {
    id: "hist-004-1",
    caseId: "case-004",
    toStatus: "report_submitted",
    createdAt: hoursAgo(3),
  },
  {
    id: "hist-004-2",
    caseId: "case-004",
    fromStatus: "report_submitted",
    toStatus: "under_verification",
    changedById: DEMO_IDS.users.sarah,
    createdAt: hoursAgo(2.5),
  },
  {
    id: "hist-004-3",
    caseId: "case-004",
    fromStatus: "under_verification",
    toStatus: "verified",
    changedById: DEMO_IDS.users.sarah,
    createdAt: hoursAgo(2),
  },
  {
    id: "hist-004-4",
    caseId: "case-004",
    fromStatus: "verified",
    toStatus: "rescuer_assigned",
    changedById: DEMO_IDS.users.sarah,
    note: "Assigned James Chen",
    createdAt: hoursAgo(1),
  },
  {
    id: "hist-luna-1",
    caseId: DEMO_IDS.luna.case,
    toStatus: "report_submitted",
    createdAt: hoursAgo(20),
  },
  {
    id: "hist-luna-2",
    caseId: DEMO_IDS.luna.case,
    fromStatus: "report_submitted",
    toStatus: "under_verification",
    changedById: DEMO_IDS.users.sarah,
    createdAt: hoursAgo(19),
  },
  {
    id: "hist-luna-3",
    caseId: DEMO_IDS.luna.case,
    fromStatus: "under_verification",
    toStatus: "verified",
    changedById: DEMO_IDS.users.sarah,
    note: "Confirmed dog near busy road with leg injury",
    createdAt: hoursAgo(18),
  },
  {
    id: "hist-luna-4",
    caseId: DEMO_IDS.luna.case,
    fromStatus: "verified",
    toStatus: "rescuer_assigned",
    changedById: DEMO_IDS.users.sarah,
    note: "Assigned James Chen",
    createdAt: hoursAgo(16),
  },
  {
    id: "hist-luna-5",
    caseId: DEMO_IDS.luna.case,
    fromStatus: "rescuer_assigned",
    toStatus: "rescue_accepted",
    changedById: DEMO_IDS.users.james,
    createdAt: hoursAgo(15),
  },
  {
    id: "hist-luna-6",
    caseId: DEMO_IDS.luna.case,
    fromStatus: "rescue_accepted",
    toStatus: "rescue_in_progress",
    changedById: DEMO_IDS.users.james,
    createdAt: hoursAgo(14),
  },
  {
    id: "hist-luna-7",
    caseId: DEMO_IDS.luna.case,
    fromStatus: "rescue_in_progress",
    toStatus: "animal_secured",
    changedById: DEMO_IDS.users.james,
    note: "Luna secured safely with transport crate",
    createdAt: hoursAgo(8),
  },
  {
    id: "hist-luna-8",
    caseId: DEMO_IDS.luna.case,
    fromStatus: "animal_secured",
    toStatus: "awaiting_shelter",
    changedById: DEMO_IDS.users.james,
    createdAt: hoursAgo(7),
  },
  {
    id: "hist-luna-9",
    caseId: DEMO_IDS.luna.case,
    fromStatus: "awaiting_shelter",
    toStatus: "shelter_handoff",
    changedById: DEMO_IDS.users.sarah,
    note: "Handoff confirmed at Paws Hope",
    createdAt: hoursAgo(4),
  },
];

export const DEMO_STATUS_HISTORY = bindGlobalMutable(
  "__rescutes_status_history",
  SEED_STATUS_HISTORY,
);

const SEED_HANDOFFS: DemoHandoff[] = [
  {
    id: "handoff-luna",
    caseId: DEMO_IDS.luna.case,
    shelterId: DEMO_IDS.shelters.pawsHope,
    confirmedByRescuerId: DEMO_IDS.users.james,
    confirmedByStaffId: DEMO_IDS.users.sarah,
    handoffNotes: "Luna transported safely. Leg injury noted. Calm temperament.",
    confirmedAt: hoursAgo(4),
  },
];

export const DEMO_HANDOFFS = bindGlobalMutable(
  "__rescutes_handoffs",
  SEED_HANDOFFS,
);

const SEED_ANIMAL_NOTES: DemoAnimalNote[] = [
  {
    id: "note-luna-1",
    animalId: DEMO_IDS.luna.animal,
    authorId: DEMO_IDS.users.sarah,
    authorName: "Sarah Lim",
    noteType: "staff",
    content: "Intake completed. Luna is calm and friendly despite injury.",
    createdAt: hoursAgo(4),
  },
  {
    id: "note-luna-2",
    animalId: DEMO_IDS.luna.animal,
    authorId: DEMO_IDS.users.james,
    authorName: "James Chen",
    noteType: "field",
    content: "Found Luna limping near España Boulevard bus stop. Used treats to approach.",
    createdAt: hoursAgo(8),
  },
  {
    id: "note-luna-3",
    animalId: DEMO_IDS.luna.animal,
    authorId: DEMO_IDS.users.sarah,
    authorName: "Sarah Lim",
    noteType: "behavior",
    content: "Gentle with handlers. Shows mild anxiety in new environments.",
    createdAt: hoursAgo(3),
  },
];

export const DEMO_ANIMAL_NOTES = bindGlobalMutable(
  "__rescutes_animal_notes",
  SEED_ANIMAL_NOTES,
);

const SEED_NOTIFICATIONS: DemoNotification[] = [
  {
    id: "notif-1",
    userId: DEMO_IDS.users.maria,
    type: "status_update",
    title: "Luna is safe at shelter",
    message:
      "Your report for Luna has been updated. Luna has been safely handed off to Paws Hope Animal Shelter and is receiving care.",
    caseId: DEMO_IDS.luna.case,
    read: false,
    createdAt: hoursAgo(4),
  },
  {
    id: "notif-2",
    userId: DEMO_IDS.users.maria,
    type: "status_update",
    title: "Luna secured",
    message: "Rescuer James Chen has secured Luna safely.",
    caseId: DEMO_IDS.luna.case,
    read: true,
    createdAt: hoursAgo(8),
  },
  {
    id: "notif-3",
    userId: DEMO_IDS.users.james,
    type: "assignment",
    title: "New assignment",
    message: "You have been assigned to case RC-2026-1004.",
    caseId: "case-004",
    read: false,
    createdAt: hoursAgo(1),
  },
  {
    id: "notif-4",
    userId: DEMO_IDS.users.sarah,
    type: "system",
    title: "New report submitted",
    message: "Critical urgency report RC-2026-1005 needs verification.",
    caseId: "case-005",
    read: false,
    createdAt: hoursAgo(1),
  },
];

export const DEMO_NOTIFICATIONS = bindGlobalMutable(
  "__rescutes_notifications",
  SEED_NOTIFICATIONS,
);

export const DEMO_DATA_LABEL =
  "Simulated demo data for ResCutes hackathon presentation";
