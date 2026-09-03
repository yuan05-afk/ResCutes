import type { Role } from "@/lib/auth/permissions";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  roles: Role[];
}

export interface ShelterRecord {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  website?: string;
  /** Directory id used by the Philippines shelter map (`verified-*` / `osm-*`). */
  directoryId?: string;
  speciesAccepted: string[];
  capabilities: string[];
  totalCapacity: number;
  currentOccupancy: number;
  operationalWorkload: number;
}

export interface RescueCaseRecord {
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
  /** Active rescuer assignment (for client filters). */
  activeRescuerId?: string;
}

export interface AssignmentRecord {
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

export interface RecommendationRecord {
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

export interface AnimalRecord {
  id: string;
  name?: string;
  temporaryId: string;
  species: string;
  estimatedAge?: string;
  breed?: string;
  color?: string;
  sex?: string;
  bio?: string;
  temperament?: string;
  rescueCaseId?: string;
  caseNumber?: string;
  shelterId?: string;
  intakeDate?: string;
  pathwayStage: string;
  recommendedNextAction?: string;
  photoUrl?: string;
  clearanceStatus: string;
  createdAt: string;
}

export interface AdoptionApplicationRecord {
  id: string;
  animalId: string;
  animalName?: string;
  animalTemporaryId?: string;
  animalSpecies?: string;
  animalPhotoUrl?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  homeType: string;
  hasYard: boolean;
  hasOtherPets: boolean;
  householdSize: number;
  experienceNotes?: string;
  motivation: string;
  status: string;
  reviewedById?: string;
  reviewerName?: string;
  reviewNotes?: string;
  submittedAt: string;
  decidedAt?: string;
  createdAt: string;
}

export const CLEARANCE_STATUSES = [
  "awaiting_examination",
  "under_examination",
  "under_treatment",
  "follow_up_required",
  "medically_cleared",
] as const;

export type ClearanceStatus = (typeof CLEARANCE_STATUSES)[number];

export interface MedicalClearanceRecord {
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

export interface StatusHistoryRecord {
  id: string;
  caseId: string;
  fromStatus?: string;
  toStatus: string;
  changedById?: string;
  note?: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  caseId?: string;
  read: boolean;
  createdAt: string;
}

export interface HandoffRecord {
  id: string;
  caseId: string;
  shelterId: string;
  confirmedByRescuerId?: string;
  confirmedByStaffId?: string;
  handoffNotes?: string;
  confirmedAt?: string;
  intakeCompletedAt?: string;
}

export interface AnimalNoteRecord {
  id: string;
  animalId: string;
  authorId?: string;
  authorName?: string;
  noteType: string;
  content: string;
  createdAt: string;
}

export interface UserProfilePrefs {
  userId: string;
  phone: string;
  department: string;
  notifyEmail: boolean;
  notifyUrgentCases: boolean;
  notifyAssignments: boolean;
  notifyWeeklyDigest: boolean;
  timezone: string;
}

/** @deprecated Use RescueCaseRecord */
export type DemoCase = RescueCaseRecord;
/** @deprecated Use AnimalRecord */
export type DemoAnimal = AnimalRecord;
/** @deprecated Use AppUser */
export type DemoUser = AppUser;
