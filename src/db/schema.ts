import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  doublePrecision,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "citizen",
  "rescuer",
  "shelter_staff",
  "veterinarian",
  "administrator",
]);

export const caseStatusEnum = pgEnum("case_status", [
  "report_submitted",
  "under_verification",
  "verified",
  "rescuer_assigned",
  "rescue_accepted",
  "rescue_in_progress",
  "animal_secured",
  "awaiting_shelter",
  "shelter_handoff",
  "completed",
  "rejected",
  "duplicate",
  "cancelled",
]);

export const speciesEnum = pgEnum("species", [
  "dog",
  "cat",
  "bird",
  "rabbit",
  "other",
]);

export const injurySeverityEnum = pgEnum("injury_severity", [
  "none_visible",
  "minor",
  "moderate",
  "severe",
  "critical",
]);

export const environmentalDangerEnum = pgEnum("environmental_danger", [
  "none",
  "traffic",
  "weather",
  "predators",
  "trapped",
  "other_danger",
]);

export const vulnerabilityEnum = pgEnum("vulnerability", [
  "adult_healthy",
  "juvenile",
  "elderly",
  "pregnant",
  "nursing",
  "disabled",
]);

export const urgencyLevelEnum = pgEnum("urgency_level", [
  "critical",
  "high",
  "medium",
  "low",
]);

export const contactPreferenceEnum = pgEnum("contact_preference", [
  "in_app",
  "phone",
  "email",
  "no_contact",
]);

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "pending",
  "accepted",
  "declined",
  "completed",
  "cancelled",
]);

export const recommendationStatusEnum = pgEnum("recommendation_status", [
  "recommended",
  "selected",
  "rejected",
  "overridden",
]);

export const clearanceStatusEnum = pgEnum("clearance_status", [
  "awaiting_examination",
  "under_examination",
  "under_treatment",
  "follow_up_required",
  "medically_cleared",
]);

export const medicalPriorityEnum = pgEnum("medical_priority", [
  "routine",
  "urgent",
  "emergency",
]);

export const pathwayStageEnum = pgEnum("pathway_stage", [
  "intake",
  "medical_clearance",
  "behavior_assessment",
  "ready_for_foster",
  "ready_for_adoption",
  "long_stay",
  "transferred",
]);

export const noteTypeEnum = pgEnum("note_type", [
  "staff",
  "behavior",
  "field",
  "rescue",
  "system",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "status_update",
  "assignment",
  "handoff",
  "medical_update",
  "system",
  "adoption",
]);

export const adoptionApplicationStatusEnum = pgEnum("adoption_application_status", [
  "pending",
  "under_review",
  "approved",
  "rejected",
  "withdrawn",
  "completed",
]);

export const adoptionInterestDecisionEnum = pgEnum("adoption_interest_decision", [
  "pass",
  "interested",
]);

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_roles_user_role_idx").on(table.userId, table.role),
    index("user_roles_user_id_idx").on(table.userId),
  ],
);

// Shelters
export const shelters = pgTable("shelters", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  phone: text("phone"),
  email: text("email"),
  speciesAccepted: text("species_accepted").array().notNull().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shelterCapabilities = pgTable(
  "shelter_capabilities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shelterId: uuid("shelter_id")
      .notNull()
      .references(() => shelters.id, { onDelete: "cascade" }),
    capability: text("capability").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("shelter_capabilities_shelter_id_idx").on(table.shelterId),
    uniqueIndex("shelter_capabilities_unique_idx").on(
      table.shelterId,
      table.capability,
    ),
  ],
);

export const shelterCapacity = pgTable(
  "shelter_capacity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shelterId: uuid("shelter_id")
      .notNull()
      .references(() => shelters.id, { onDelete: "cascade" }),
    totalCapacity: integer("total_capacity").notNull(),
    currentOccupancy: integer("current_occupancy").notNull().default(0),
    operationalWorkload: integer("operational_workload").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("shelter_capacity_shelter_id_idx").on(table.shelterId),
  ],
);

// Rescue Reports & Cases
export const rescueReports = pgTable("rescue_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => users.id),
  species: speciesEnum("species").notNull(),
  injurySeverity: injurySeverityEnum("injury_severity").notNull(),
  environmentalDanger: environmentalDangerEnum("environmental_danger").notNull(),
  vulnerability: vulnerabilityEnum("vulnerability").notNull(),
  description: text("description").notNull(),
  contactPreference: contactPreferenceEnum("contact_preference").notNull(),
  /** Reverse-geocoded or reporter-supplied place label for maps / directions. */
  locationLabel: text("location_label"),
  /** Reporter landmark note (e.g. "behind the 7-Eleven"). */
  locationNote: text("location_note"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  approximateLatitude: doublePrecision("approximate_latitude").notNull(),
  approximateLongitude: doublePrecision("approximate_longitude").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rescueCases = pgTable(
  "rescue_cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reportId: uuid("report_id")
      .notNull()
      .references(() => rescueReports.id),
    caseNumber: text("case_number").notNull().unique(),
    status: caseStatusEnum("status").notNull().default("report_submitted"),
    urgencyScore: integer("urgency_score").default(0),
    urgencyLevel: urgencyLevelEnum("urgency_level").default("low"),
    urgencyOverrideScore: integer("urgency_override_score"),
    urgencyOverrideReason: text("urgency_override_reason"),
    verifiedAt: timestamp("verified_at"),
    verifiedById: uuid("verified_by_id").references(() => users.id),
    rejectionReason: text("rejection_reason"),
    duplicateOfCaseId: uuid("duplicate_of_case_id"),
    assignedShelterId: uuid("assigned_shelter_id").references(() => shelters.id),
    animalId: uuid("animal_id"),
    /** Staff instructions for the assigned rescuer (access, hazards, contact on site). */
    rescuerNote: text("rescuer_note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("rescue_cases_status_idx").on(table.status),
    index("rescue_cases_urgency_score_idx").on(table.urgencyScore),
    index("rescue_cases_report_id_idx").on(table.reportId),
  ],
);

export const casePhotos = pgTable(
  "case_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => rescueCases.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    uploadedById: uuid("uploaded_by_id").references(() => users.id),
    photoType: text("photo_type").notNull().default("report"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("case_photos_case_id_idx").on(table.caseId)],
);

export const caseStatusHistory = pgTable(
  "case_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => rescueCases.id, { onDelete: "cascade" }),
    fromStatus: caseStatusEnum("from_status"),
    toStatus: caseStatusEnum("to_status").notNull(),
    changedById: uuid("changed_by_id").references(() => users.id),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("case_status_history_case_id_idx").on(table.caseId)],
);

export const rescuerAssignments = pgTable(
  "rescuer_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => rescueCases.id, { onDelete: "cascade" }),
    rescuerId: uuid("rescuer_id")
      .notNull()
      .references(() => users.id),
    status: assignmentStatusEnum("status").notNull().default("pending"),
    assignedById: uuid("assigned_by_id").references(() => users.id),
    declineReason: text("decline_reason"),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    respondedAt: timestamp("responded_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("rescuer_assignments_case_id_idx").on(table.caseId),
    index("rescuer_assignments_rescuer_id_idx").on(table.rescuerId),
  ],
);

export const shelterRecommendations = pgTable(
  "shelter_recommendations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => rescueCases.id, { onDelete: "cascade" }),
    shelterId: uuid("shelter_id")
      .notNull()
      .references(() => shelters.id),
    matchScore: integer("match_score").notNull(),
    distanceKm: doublePrecision("distance_km"),
    reasons: text("reasons").array().notNull().default([]),
    warnings: text("warnings").array().notNull().default([]),
    missingCapabilities: text("missing_capabilities").array().notNull().default([]),
    rank: integer("rank").notNull(),
    status: recommendationStatusEnum("status").notNull().default("recommended"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("shelter_recommendations_case_id_idx").on(table.caseId)],
);

export const shelterHandoffs = pgTable(
  "shelter_handoffs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => rescueCases.id, { onDelete: "cascade" }),
    shelterId: uuid("shelter_id")
      .notNull()
      .references(() => shelters.id),
    confirmedByRescuerId: uuid("confirmed_by_rescuer_id").references(() => users.id),
    confirmedByStaffId: uuid("confirmed_by_staff_id").references(() => users.id),
    handoffNotes: text("handoff_notes"),
    confirmedAt: timestamp("confirmed_at"),
    intakeCompletedAt: timestamp("intake_completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("shelter_handoffs_case_id_idx").on(table.caseId)],
);

// Animals
export const animals = pgTable(
  "animals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name"),
    temporaryId: text("temporary_id").notNull().unique(),
    species: speciesEnum("species").notNull(),
    estimatedAge: text("estimated_age"),
    breed: text("breed"),
    color: text("color"),
    sex: text("sex"),
    bio: text("bio"),
    temperament: text("temperament"),
    rescueCaseId: uuid("rescue_case_id").references(() => rescueCases.id),
    shelterId: uuid("shelter_id").references(() => shelters.id),
    intakeDate: timestamp("intake_date"),
    pathwayStage: pathwayStageEnum("pathway_stage").default("intake"),
    recommendedNextAction: text("recommended_next_action"),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("animals_shelter_id_idx").on(table.shelterId),
    index("animals_rescue_case_id_idx").on(table.rescueCaseId),
    index("animals_pathway_stage_idx").on(table.pathwayStage),
  ],
);

export const adoptionApplications = pgTable(
  "adoption_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animals.id, { onDelete: "cascade" }),
    applicantName: text("applicant_name").notNull(),
    applicantEmail: text("applicant_email").notNull(),
    applicantPhone: text("applicant_phone"),
    /** Optional Facebook / Instagram / other profile for staff follow-up. */
    socialLink: text("social_link"),
    /** City / area for staff contact and matching (minimal address). */
    applicantCity: text("applicant_city"),
    homeType: text("home_type").notNull(),
    hasYard: boolean("has_yard").default(false).notNull(),
    hasOtherPets: boolean("has_other_pets").default(false).notNull(),
    householdSize: integer("household_size").default(1).notNull(),
    experienceNotes: text("experience_notes"),
    motivation: text("motivation").notNull(),
    status: adoptionApplicationStatusEnum("status")
      .notNull()
      .default("pending"),
    reviewedById: uuid("reviewed_by_id").references(() => users.id),
    reviewNotes: text("review_notes"),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    decidedAt: timestamp("decided_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("adoption_applications_animal_id_idx").on(table.animalId),
    index("adoption_applications_status_idx").on(table.status),
  ],
);

export const adoptionInterests = pgTable(
  "adoption_interests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animals.id, { onDelete: "cascade" }),
    decision: adoptionInterestDecisionEnum("decision").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("adoption_interests_user_animal_uidx").on(
      table.userId,
      table.animalId,
    ),
    index("adoption_interests_user_id_idx").on(table.userId),
    index("adoption_interests_animal_id_idx").on(table.animalId),
  ],
);

export const medicalClearances = pgTable(
  "medical_clearances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animals.id, { onDelete: "cascade" }),
    veterinarianId: uuid("veterinarian_id").references(() => users.id),
    examinationDate: timestamp("examination_date"),
    generalCondition: text("general_condition"),
    medicalPriority: medicalPriorityEnum("medical_priority").default("routine"),
    treatmentSummary: text("treatment_summary"),
    restrictions: text("restrictions"),
    followUpDate: timestamp("follow_up_date"),
    clearanceStatus: clearanceStatusEnum("clearance_status")
      .notNull()
      .default("awaiting_examination"),
    veterinarianNotes: text("veterinarian_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("medical_clearances_animal_id_idx").on(table.animalId)],
);

export const animalNotes = pgTable(
  "animal_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animals.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => users.id),
    noteType: noteTypeEnum("note_type").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("animal_notes_animal_id_idx").on(table.animalId)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    caseId: uuid("case_id").references(() => rescueCases.id),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_read_idx").on(table.read),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    details: text("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_user_id_idx").on(table.userId),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  ],
);

// Relations
export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  department: text("department").notNull().default(""),
  notifyEmail: boolean("notify_email").notNull().default(true),
  notifyUrgentCases: boolean("notify_urgent_cases").notNull().default(true),
  notifyAssignments: boolean("notify_assignments").notNull().default(true),
  notifyWeeklyDigest: boolean("notify_weekly_digest").notNull().default(false),
  timezone: text("timezone").notNull().default("Asia/Manila"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  roles: many(userRoles),
  reports: many(rescueReports),
  assignments: many(rescuerAssignments),
  notifications: many(notifications),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
}));

export const sheltersRelations = relations(shelters, ({ many, one }) => ({
  capabilities: many(shelterCapabilities),
  capacity: one(shelterCapacity),
  animals: many(animals),
}));

export const shelterCapabilitiesRelations = relations(
  shelterCapabilities,
  ({ one }) => ({
    shelter: one(shelters, {
      fields: [shelterCapabilities.shelterId],
      references: [shelters.id],
    }),
  }),
);

export const shelterCapacityRelations = relations(shelterCapacity, ({ one }) => ({
  shelter: one(shelters, {
    fields: [shelterCapacity.shelterId],
    references: [shelters.id],
  }),
}));

export const rescueReportsRelations = relations(rescueReports, ({ one }) => ({
  reporter: one(users, {
    fields: [rescueReports.reporterId],
    references: [users.id],
  }),
  case: one(rescueCases, {
    fields: [rescueReports.id],
    references: [rescueCases.reportId],
  }),
}));

export const rescueCasesRelations = relations(rescueCases, ({ one, many }) => ({
  report: one(rescueReports, {
    fields: [rescueCases.reportId],
    references: [rescueReports.id],
  }),
  photos: many(casePhotos),
  statusHistory: many(caseStatusHistory),
  assignments: many(rescuerAssignments),
  recommendations: many(shelterRecommendations),
  handoff: one(shelterHandoffs),
  assignedShelter: one(shelters, {
    fields: [rescueCases.assignedShelterId],
    references: [shelters.id],
  }),
  animal: one(animals, {
    fields: [rescueCases.animalId],
    references: [animals.id],
  }),
}));

export const animalsRelations = relations(animals, ({ one, many }) => ({
  shelter: one(shelters, {
    fields: [animals.shelterId],
    references: [shelters.id],
  }),
  rescueCase: one(rescueCases, {
    fields: [animals.rescueCaseId],
    references: [rescueCases.id],
  }),
  medicalClearance: one(medicalClearances),
  notes: many(animalNotes),
  adoptionApplications: many(adoptionApplications),
  adoptionInterests: many(adoptionInterests),
}));

export const adoptionInterestsRelations = relations(
  adoptionInterests,
  ({ one }) => ({
    user: one(users, {
      fields: [adoptionInterests.userId],
      references: [users.id],
    }),
    animal: one(animals, {
      fields: [adoptionInterests.animalId],
      references: [animals.id],
    }),
  }),
);

export const adoptionApplicationsRelations = relations(
  adoptionApplications,
  ({ one }) => ({
    animal: one(animals, {
      fields: [adoptionApplications.animalId],
      references: [animals.id],
    }),
    reviewer: one(users, {
      fields: [adoptionApplications.reviewedById],
      references: [users.id],
    }),
  }),
);

export const medicalClearancesRelations = relations(
  medicalClearances,
  ({ one }) => ({
    animal: one(animals, {
      fields: [medicalClearances.animalId],
      references: [animals.id],
    }),
    veterinarian: one(users, {
      fields: [medicalClearances.veterinarianId],
      references: [users.id],
    }),
  }),
);

// Type exports
export type User = typeof users.$inferSelect;
export type RescueCase = typeof rescueCases.$inferSelect;
export type Animal = typeof animals.$inferSelect;
export type Shelter = typeof shelters.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
