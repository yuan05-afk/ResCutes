/**
 * In-memory demo data store used when DATABASE_URL is not configured,
 * and as the source for database seeding.
 */
import { buildOperationalDemoShelters } from "@/lib/data/operational-shelters";
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
    paws: "verified-paws-parc",
    cara: "verified-cara",
    helpMas: "verified-help-mas",
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

/** Bump when transactional seed data shape changes so dev HMR picks up empty stores. */
const TRANSACTIONAL_STORE_VERSION = 2;

const TRANSACTIONAL_STORE_KEYS = [
  "__rescutes_cases",
  "__rescutes_assignments",
  "__rescutes_recommendations",
  "__rescutes_animals",
  "__rescutes_medical_clearances",
  "__rescutes_status_history",
  "__rescutes_handoffs",
  "__rescutes_animal_notes",
  "__rescutes_notifications",
] as const;

function resetTransactionalStoresIfVersionChanged() {
  const store = globalThis as typeof globalThis &
    Record<string, unknown | undefined>;
  const versionKey = "__rescutes_transactional_version";
  if (store[versionKey] === TRANSACTIONAL_STORE_VERSION) return;

  for (const key of TRANSACTIONAL_STORE_KEYS) {
    delete store[key];
  }
  store[versionKey] = TRANSACTIONAL_STORE_VERSION;
}

resetTransactionalStoresIfVersionChanged();

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

const SEED_SHELTERS: DemoShelter[] = buildOperationalDemoShelters();

export const DEMO_SHELTERS = bindGlobalMutable(
  "__rescutes_shelters",
  SEED_SHELTERS,
);

const SEED_CASES: DemoCase[] = [];
export const DEMO_CASES = bindGlobalMutable("__rescutes_cases", SEED_CASES);

const SEED_ASSIGNMENTS: DemoAssignment[] = [];
export const DEMO_ASSIGNMENTS = bindGlobalMutable(
  "__rescutes_assignments",
  SEED_ASSIGNMENTS,
);

const SEED_RECOMMENDATIONS: DemoRecommendation[] = [];
export const DEMO_RECOMMENDATIONS = bindGlobalMutable(
  "__rescutes_recommendations",
  SEED_RECOMMENDATIONS,
);

const SEED_ANIMALS: DemoAnimal[] = [];
export const DEMO_ANIMALS = bindGlobalMutable("__rescutes_animals", SEED_ANIMALS);

const SEED_MEDICAL_CLEARANCES: DemoMedicalClearance[] = [];
export const DEMO_MEDICAL_CLEARANCES = bindGlobalMutable(
  "__rescutes_medical_clearances",
  SEED_MEDICAL_CLEARANCES,
);

const SEED_STATUS_HISTORY: DemoStatusHistory[] = [];
export const DEMO_STATUS_HISTORY = bindGlobalMutable(
  "__rescutes_status_history",
  SEED_STATUS_HISTORY,
);

const SEED_HANDOFFS: DemoHandoff[] = [];
export const DEMO_HANDOFFS = bindGlobalMutable("__rescutes_handoffs", SEED_HANDOFFS);

const SEED_ANIMAL_NOTES: DemoAnimalNote[] = [];
export const DEMO_ANIMAL_NOTES = bindGlobalMutable(
  "__rescutes_animal_notes",
  SEED_ANIMAL_NOTES,
);

const SEED_NOTIFICATIONS: DemoNotification[] = [];
export const DEMO_NOTIFICATIONS = bindGlobalMutable(
  "__rescutes_notifications",
  SEED_NOTIFICATIONS,
);

export const DEMO_DATA_LABEL =
  "No rescue cases yet. Reports from the mobile app appear here.";
