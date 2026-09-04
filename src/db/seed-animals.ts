import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

type SeedAnimal = {
  slug: string;
  name: string;
  species: "dog" | "cat";
  sex: string;
  estimatedAge: string;
  breed: string;
  color: string;
  bio: string;
  temperament: string;
  clearanceStatus:
    | "awaiting_examination"
    | "under_examination"
    | "under_treatment"
    | "follow_up_required"
    | "medically_cleared";
  pathwayStage:
    | "intake"
    | "medical_clearance"
    | "behavior_assessment"
    | "ready_for_foster"
    | "ready_for_adoption"
    | "long_stay"
    | "transferred";
  intakeDaysAgo: number;
  shelterSlug: string;
  recommendedNextAction: string;
  injurySeverity: "none_visible" | "minor" | "moderate" | "severe" | "critical";
  environmentalDanger:
    | "none"
    | "traffic"
    | "weather"
    | "predators"
    | "trapped"
    | "other_danger";
  vulnerability:
    | "adult_healthy"
    | "juvenile"
    | "elderly"
    | "pregnant"
    | "nursing"
    | "disabled";
  lat: number;
  lng: number;
  areaLabel: string;
};

/** Active field cases (not yet linked to intake animals) for dashboard/map. */
type ActiveCaseSeed = {
  slug: string;
  species: "dog" | "cat";
  injurySeverity: SeedAnimal["injurySeverity"];
  environmentalDanger: SeedAnimal["environmentalDanger"];
  vulnerability: SeedAnimal["vulnerability"];
  description: string;
  reporterEmail: string;
  status:
    | "report_submitted"
    | "verified"
    | "rescuer_assigned"
    | "animal_secured"
    | "shelter_handoff";
  daysAgo: number;
  lat: number;
  lng: number;
  locationLabel: string;
  locationNote?: string;
  rescuerNote?: string;
  shelterSlug?: string;
  assignRescuer?: boolean;
  /** When assignRescuer is true, defaults to pending unless accepted. */
  assignmentAccepted?: boolean;
};

const CITIZEN_REPORTER_EMAILS = [
  "citizen@rescutes.demo",
  "jose.delacruz@rescutes.demo",
  "ana.reyes@rescutes.demo",
  "miguel.torres@rescutes.demo",
  "camille.villanueva@rescutes.demo",
  "rafael.mendoza@rescutes.demo",
  "sofia.garcia@rescutes.demo",
  "enrico.ramos@rescutes.demo",
  "patricia.lim@rescutes.demo",
  "carlo.bautista@rescutes.demo",
  "jasmine.cruz@rescutes.demo",
  "mark.villanueva@rescutes.demo",
] as const;

function productionAnimalId(index: number) {
  return `A-26-${String(index).padStart(3, "0")}`;
}

function productionCaseNumber(index: number) {
  return `RC-26-${String(index).padStart(3, "0")}`;
}

const SEED_ANIMALS: SeedAnimal[] = [
  {
    slug: "luna",
    name: "Luna",
    species: "dog",
    sex: "female",
    estimatedAge: "juvenile",
    breed: "Aspin",
    color: "tan",
    bio: "Found limping near a school gate after being hit lightly by a bike. Friendly with kids once she settles, and already walking more confidently after rest.",
    temperament: "Gentle, people-oriented, soft with children",
    clearanceStatus: "medically_cleared",
    pathwayStage: "ready_for_adoption",
    intakeDaysAgo: 42,
    shelterSlug: "verified-paws-parc",
    recommendedNextAction: "Schedule meet-and-greet with approved applicants",
    injurySeverity: "minor",
    environmentalDanger: "traffic",
    vulnerability: "juvenile",
    lat: 14.6014,
    lng: 120.9892,
    areaLabel: "España Boulevard, Sampaloc, Manila",
  },
  {
    slug: "milo",
    name: "Milo",
    species: "dog",
    sex: "male",
    estimatedAge: "adult",
    breed: "Mix",
    color: "black",
    bio: "Brought in with a scarred ear and minor wounds from street fighting. Still under treatment for infection control but eating well and improving daily.",
    temperament: "Reserved at first, loyal once trust builds",
    clearanceStatus: "under_treatment",
    pathwayStage: "medical_clearance",
    intakeDaysAgo: 18,
    shelterSlug: "verified-pawssion-sjdm",
    recommendedNextAction: "Continue wound care and recheck in one week",
    injurySeverity: "moderate",
    environmentalDanger: "other_danger",
    vulnerability: "adult_healthy",
    lat: 14.676,
    lng: 121.0437,
    areaLabel: "Commonwealth Avenue, Quezon City",
  },
  {
    slug: "bella",
    name: "Bella",
    species: "cat",
    sex: "female",
    estimatedAge: "adult",
    breed: "Domestic longhair",
    color: "cream",
    bio: "Surrendered when her owner relocated. Soft cream longhair who enjoys lap time and quiet rooms. Fully cleared and ready for a calm home.",
    temperament: "Affectionate, calm, prefers quiet households",
    clearanceStatus: "medically_cleared",
    pathwayStage: "ready_for_adoption",
    intakeDaysAgo: 35,
    shelterSlug: "verified-paws-parc",
    recommendedNextAction: "Match with apartment-friendly adopters",
    injurySeverity: "none_visible",
    environmentalDanger: "none",
    vulnerability: "adult_healthy",
    lat: 14.5547,
    lng: 121.0244,
    areaLabel: "Makati CBD residential strip",
  },
  {
    slug: "bruno",
    name: "Bruno",
    species: "dog",
    sex: "male",
    estimatedAge: "senior",
    breed: "Aspin",
    color: "brindle",
    bio: "Senior brindle aspin with arthritis follow-up needs. Sweet and steady, does best with short walks and a soft bed.",
    temperament: "Mellow, patient, low-energy companion",
    clearanceStatus: "follow_up_required",
    pathwayStage: "medical_clearance",
    intakeDaysAgo: 56,
    shelterSlug: "verified-pawssion-bacolod",
    recommendedNextAction: "Book arthritis follow-up and mobility check",
    injurySeverity: "minor",
    environmentalDanger: "none",
    vulnerability: "elderly",
    lat: 14.5995,
    lng: 120.9842,
    areaLabel: "Quiapo riverside walkway, Manila",
  },
  {
    slug: "mochi",
    name: "Mochi",
    species: "cat",
    sex: "male",
    estimatedAge: "kitten",
    breed: "Domestic shorthair",
    color: "orange tabby",
    bio: "Tiny orange tabby kitten found near a market stall. Awaiting full intake examination before pathway planning.",
    temperament: "Playful, curious, vocal for attention",
    clearanceStatus: "awaiting_examination",
    pathwayStage: "medical_clearance",
    intakeDaysAgo: 3,
    shelterSlug: "verified-paws-parc",
    recommendedNextAction: "Complete intake exam and vaccination plan",
    injurySeverity: "none_visible",
    environmentalDanger: "weather",
    vulnerability: "juvenile",
    lat: 14.6091,
    lng: 121.0223,
    areaLabel: "Farmer's Market, Cubao, Quezon City",
  },
  {
    slug: "kira",
    name: "Kira",
    species: "dog",
    sex: "female",
    estimatedAge: "adult",
    breed: "Aspin mix",
    color: "white-brown",
    bio: "White-and-brown adult dog rescued from a busy roadside. Energetic and cleared for adoption; thrives with daily walks and training games.",
    temperament: "Bright, active, food-motivated",
    clearanceStatus: "medically_cleared",
    pathwayStage: "ready_for_adoption",
    intakeDaysAgo: 28,
    shelterSlug: "verified-pawssion-sjdm",
    recommendedNextAction: "Promote to active adopters seeking a hiking buddy",
    injurySeverity: "minor",
    environmentalDanger: "traffic",
    vulnerability: "adult_healthy",
    lat: 14.6349,
    lng: 121.0332,
    areaLabel: "Katipunan Avenue roadside, Quezon City",
  },
  {
    slug: "pepper",
    name: "Pepper",
    species: "cat",
    sex: "female",
    estimatedAge: "adult",
    breed: "Domestic shorthair",
    color: "black with white chest",
    bio: "Black cat with a white chest marking. Medically cleared and currently in behavior assessment for multi-cat homes.",
    temperament: "Independent, watchful, gentle with familiar handlers",
    clearanceStatus: "medically_cleared",
    pathwayStage: "behavior_assessment",
    intakeDaysAgo: 21,
    shelterSlug: "verified-paws-parc",
    recommendedNextAction: "Finish behavior notes and socialization sessions",
    injurySeverity: "none_visible",
    environmentalDanger: "none",
    vulnerability: "adult_healthy",
    lat: 14.5764,
    lng: 121.0851,
    areaLabel: "Pasig riverbank park area",
  },
  {
    slug: "toby",
    name: "Toby",
    species: "dog",
    sex: "male",
    estimatedAge: "adult",
    breed: "Shih-tzu mix",
    color: "beige",
    bio: "Beige shih-tzu mix currently under examination after being found wandering near a barangay hall. Needs full workup before pathway update.",
    temperament: "Friendly, clingy, enjoys being carried",
    clearanceStatus: "under_examination",
    pathwayStage: "medical_clearance",
    intakeDaysAgo: 7,
    shelterSlug: "verified-pawssion-bacolod",
    recommendedNextAction: "Finish diagnostics and update clearance status",
    injurySeverity: "none_visible",
    environmentalDanger: "none",
    vulnerability: "adult_healthy",
    lat: 14.6507,
    lng: 121.0497,
    areaLabel: "Barangay hall plaza, Fairview",
  },
  {
    slug: "nala",
    name: "Nala",
    species: "cat",
    sex: "female",
    estimatedAge: "adult",
    breed: "Domestic shorthair",
    color: "gray tabby",
    bio: "Gray tabby who loves window seats and slow blinks. Cleared and ready for adoption into a stable indoor home.",
    temperament: "Curious, affectionate, good with patient adults",
    clearanceStatus: "medically_cleared",
    pathwayStage: "ready_for_adoption",
    intakeDaysAgo: 31,
    shelterSlug: "verified-pawssion-sjdm",
    recommendedNextAction: "List on adoption board and book visits",
    injurySeverity: "none_visible",
    environmentalDanger: "none",
    vulnerability: "adult_healthy",
    lat: 14.5176,
    lng: 121.0509,
    areaLabel: "BGC high-rise alley, Taguig",
  },
  {
    slug: "max",
    name: "Max",
    species: "dog",
    sex: "male",
    estimatedAge: "juvenile",
    breed: "Aspin mix",
    color: "golden brown",
    bio: "Golden-brown juvenile dog who needs a foster while finishing basic manners. Cleared medically and thriving with structure.",
    temperament: "Goofy, energetic, learns quickly with praise",
    clearanceStatus: "medically_cleared",
    pathwayStage: "ready_for_foster",
    intakeDaysAgo: 14,
    shelterSlug: "verified-paws-parc",
    recommendedNextAction: "Match with short-term foster household",
    injurySeverity: "minor",
    environmentalDanger: "traffic",
    vulnerability: "juvenile",
    lat: 14.6042,
    lng: 121.0124,
    areaLabel: "Welcome Rotonda underpass, Quezon City",
  },
  {
    slug: "coco",
    name: "Coco",
    species: "cat",
    sex: "female",
    estimatedAge: "adult",
    breed: "Calico",
    color: "calico",
    bio: "Calico adult under treatment for skin irritation. Improving with medicated baths and isolation from allergens.",
    temperament: "Sweet, talkative, prefers soft handling",
    clearanceStatus: "under_treatment",
    pathwayStage: "medical_clearance",
    intakeDaysAgo: 12,
    shelterSlug: "verified-pawssion-bacolod",
    recommendedNextAction: "Continue dermatology protocol and reassess",
    injurySeverity: "moderate",
    environmentalDanger: "weather",
    vulnerability: "adult_healthy",
    lat: 14.5837,
    lng: 121.0494,
    areaLabel: "Mandaluyong residential street",
  },
  {
    slug: "rocky",
    name: "Rocky",
    species: "dog",
    sex: "male",
    estimatedAge: "adult",
    breed: "Aspin",
    color: "gray",
    bio: "Gray aspin still limping after a pavement injury. Follow-up imaging is required before clearance can advance.",
    temperament: "Brave, food-driven, mild with other dogs",
    clearanceStatus: "follow_up_required",
    pathwayStage: "medical_clearance",
    intakeDaysAgo: 24,
    shelterSlug: "verified-paws-parc",
    recommendedNextAction: "Schedule limp follow-up and pain management review",
    injurySeverity: "moderate",
    environmentalDanger: "traffic",
    vulnerability: "adult_healthy",
    lat: 14.6297,
    lng: 121.0655,
    areaLabel: "Marikina River park path",
  },
];

const ACTIVE_CASES: ActiveCaseSeed[] = [
  {
    slug: "active-aspin-edsa",
    species: "dog",
    injurySeverity: "severe",
    environmentalDanger: "traffic",
    vulnerability: "adult_healthy",
    description:
      "Large tan aspin limping hard on the EDSA Cubao service road after a motorcycle hit. Right hind leg will not bear weight. Animal is conscious, panting, and staying near the curb while traffic passes.",
    reporterEmail: "jose.delacruz@rescutes.demo",
    status: "rescuer_assigned",
    daysAgo: 0,
    lat: 14.622,
    lng: 121.053,
    locationLabel: "EDSA Cubao service road, Quezon City",
    locationNote: "Near the curb by the southbound bus stop",
    rescuerNote:
      "Heavy traffic. Approach from Aurora underpass service lane. Wear hi-vis vest.",
    shelterSlug: "verified-paws-parc",
    assignRescuer: true,
    assignmentAccepted: true,
  },
  {
    slug: "active-kittens-drain",
    species: "cat",
    injurySeverity: "minor",
    environmentalDanger: "trapped",
    vulnerability: "juvenile",
    description:
      "Two dirty kittens trapped inside an open storm drain beside a barangay basketball court in Makati. One is vocal and reachable near the grate; the second is farther back and needs a catch pole or flashlight team.",
    reporterEmail: "ana.reyes@rescutes.demo",
    status: "rescuer_assigned",
    daysAgo: 0,
    lat: 14.568,
    lng: 121.032,
    locationLabel: "Barangay basketball court, Makati",
    locationNote: "Storm drain grate beside the court fence",
    rescuerNote:
      "Bring catch pole and flashlight. Barangay gate is open until 8 PM.",
    assignRescuer: true,
  },
  {
    slug: "active-dog-flood",
    species: "dog",
    injurySeverity: "moderate",
    environmentalDanger: "weather",
    vulnerability: "elderly",
    description:
      "Senior brown mixed dog stranded on a raised concrete ledge after overnight flooding in a low-lying Sampaloc alley. Coat is soaked, animal looks weak but still lifts its head when called.",
    reporterEmail: "miguel.torres@rescutes.demo",
    status: "verified",
    daysAgo: 1,
    lat: 14.595,
    lng: 120.994,
    locationLabel: "Low-lying alley, Sampaloc, Manila",
    locationNote: "Raised concrete ledge after overnight flooding",
  },
  {
    slug: "active-cat-rooftop",
    species: "cat",
    injurySeverity: "none_visible",
    environmentalDanger: "trapped",
    vulnerability: "adult_healthy",
    description:
      "Gray street cat stuck on a corrugated rooftop in Quezon City for about two days. Neighbors can hear it calling at night. Needs a ladder team - roof edge is steep and unsafe for untrained climbers.",
    reporterEmail: "camille.villanueva@rescutes.demo",
    status: "report_submitted",
    daysAgo: 0,
    lat: 14.641,
    lng: 121.021,
    locationLabel: "Corrugated rooftop, Quezon City",
    locationNote: "Steep roof edge - ladder team required",
  },
  {
    slug: "active-puppies-market",
    species: "dog",
    injurySeverity: "minor",
    environmentalDanger: "other_danger",
    vulnerability: "juvenile",
    description:
      "Three abandoned mixed puppies huddled under a wet-market stall near Divisoria. Vendor says the mother has not returned since yesterday morning. Puppies are thin, flea-covered, and approachable.",
    reporterEmail: "rafael.mendoza@rescutes.demo",
    status: "animal_secured",
    daysAgo: 1,
    lat: 14.612,
    lng: 120.998,
    locationLabel: "Divisoria wet market, Manila",
    locationNote: "Under stall row 14 near the loading bay",
    rescuerNote: "Vendor will hold puppies until 7 PM. Ask for Mang Tony.",
    shelterSlug: "verified-paws-parc",
    assignRescuer: true,
    assignmentAccepted: true,
  },
  {
    slug: "active-dog-highway",
    species: "dog",
    injurySeverity: "critical",
    environmentalDanger: "traffic",
    vulnerability: "adult_healthy",
    description:
      "Medium black-and-tan dog collapsed beside the C5 exit ramp with active bleeding on a front leg. Multiple callers within 10 minutes. Needs immediate roadside pickup and trauma intake.",
    reporterEmail: "sofia.garcia@rescutes.demo",
    status: "rescuer_assigned",
    daysAgo: 0,
    lat: 14.548,
    lng: 121.05,
    locationLabel: "C5 exit ramp, Taguig",
    locationNote: "Collapsed beside the guardrail - active bleeding",
    rescuerNote:
      "Coordinate with traffic marshals on scene. Trauma kit and stretcher recommended.",
    assignRescuer: true,
    assignmentAccepted: true,
  },
  {
    slug: "active-cat-construction",
    species: "cat",
    injurySeverity: "moderate",
    environmentalDanger: "other_danger",
    vulnerability: "adult_healthy",
    description:
      "Injured orange tabby found among rebar piles inside an unfinished Makati construction site. Visible scrape along the flank. Foreman will keep the gate open for rescuers until 6:00 PM.",
    reporterEmail: "enrico.ramos@rescutes.demo",
    status: "animal_secured",
    daysAgo: 1,
    lat: 14.557,
    lng: 121.018,
    locationLabel: "Unfinished construction site, Makati",
    locationNote: "Foreman will keep gate open until 6:00 PM",
    rescuerNote: "Hard hat required on site. Contact foreman Enrique at the guard booth.",
    shelterSlug: "verified-pawssion-sjdm",
    assignRescuer: true,
    assignmentAccepted: true,
  },
  {
    slug: "active-dog-park",
    species: "dog",
    injurySeverity: "none_visible",
    environmentalDanger: "none",
    vulnerability: "adult_healthy",
    description:
      "Friendly cream aspin with no collar roaming a Marikina riverside park path. Approaches people for food but bolts toward the road when startled. Needs secure catch and ID check.",
    reporterEmail: "patricia.lim@rescutes.demo",
    status: "report_submitted",
    daysAgo: 0,
    lat: 14.586,
    lng: 121.043,
    locationLabel: "Marikina riverside park path",
    locationNote: "Friendly cream aspin near the lamp post",
  },
];

async function seedDemo() {
  const { and, eq, like } = await import("drizzle-orm");
  const { getDb } = await import("@/db");
  const {
    adoptionApplications,
    animals,
    casePhotos,
    medicalClearances,
    notifications,
    rescueCases,
    rescueReports,
    rescuerAssignments,
    users,
  } = await import("@/db/schema");
  const { shelterIdForSlug, stableUuid } = await import("@/db/stable-ids");
  const { calculateUrgencyScore } = await import("@/lib/urgency/scoring");

  const db = getDb();
  const now = Date.now();

  async function userByEmail(email: string) {
    const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return row ?? null;
  }

  const citizen = await userByEmail("citizen@rescutes.demo");
  const staff = await userByEmail("staff@rescutes.demo");
  const admin = await userByEmail("admin@rescutes.demo");
  const rescuer = await userByEmail("rescuer@rescutes.demo");
  if (!citizen || !staff || !admin) {
    throw new Error("Demo users missing. Run npm run db:seed first.");
  }

  const reporters = new Map<string, string>();
  for (const email of CITIZEN_REPORTER_EMAILS) {
    const row = await userByEmail(email);
    if (row) reporters.set(email, row.id);
  }
  if (reporters.size < 8) {
    throw new Error(
      `Expected at least 8 citizen reporters after db:seed, found ${reporters.size}.`,
    );
  }

  const verifierId = staff.id;

  // Cleanup previous seed animals/cases (stable ids + patterned ids)
  const seedAnimalIds = SEED_ANIMALS.map((a) =>
    stableUuid(`seed-animal-${a.slug}`),
  );
  const seedCaseIds = [
    ...SEED_ANIMALS.map((a) => stableUuid(`seed-case-${a.slug}`)),
    ...ACTIVE_CASES.map((c) => stableUuid(`seed-case-${c.slug}`)),
  ];
  const seedReportIds = [
    ...SEED_ANIMALS.map((a) => stableUuid(`seed-report-${a.slug}`)),
    ...ACTIVE_CASES.map((c) => stableUuid(`seed-report-${c.slug}`)),
  ];

  for (const animalId of seedAnimalIds) {
    await db.delete(medicalClearances).where(eq(medicalClearances.animalId, animalId));
    await db.delete(adoptionApplications).where(eq(adoptionApplications.animalId, animalId));
  }

  // Unlink animals from cases before delete
  for (const caseId of seedCaseIds) {
    await db
      .update(animals)
      .set({ rescueCaseId: null })
      .where(eq(animals.rescueCaseId, caseId));
    await db
      .update(rescueCases)
      .set({ animalId: null })
      .where(eq(rescueCases.id, caseId));
    await db.delete(notifications).where(eq(notifications.caseId, caseId));
    await db.delete(rescuerAssignments).where(eq(rescuerAssignments.caseId, caseId));
    await db.delete(casePhotos).where(eq(casePhotos.caseId, caseId));
  }

  await db.delete(animals).where(like(animals.temporaryId, "A-SEED-%"));
  await db.delete(animals).where(like(animals.temporaryId, "A-26-%"));
  for (const id of seedAnimalIds) {
    await db.delete(animals).where(eq(animals.id, id));
  }

  for (const id of seedCaseIds) {
    await db.delete(rescueCases).where(eq(rescueCases.id, id));
  }
  // Also clear leftover patterned seed cases
  await db.delete(rescueCases).where(like(rescueCases.caseNumber, "RC-SEED-%"));
  await db.delete(rescueCases).where(like(rescueCases.caseNumber, "RC-26-%"));

  for (const id of seedReportIds) {
    await db.delete(rescueReports).where(eq(rescueReports.id, id));
  }

  console.log("Cleared previous demo animals/cases");

  const animalIdsBySlug = new Map<string, string>();

  for (let i = 0; i < SEED_ANIMALS.length; i++) {
    const animal = SEED_ANIMALS[i];
    const animalId = stableUuid(`seed-animal-${animal.slug}`);
    const caseId = stableUuid(`seed-case-${animal.slug}`);
    const reportId = stableUuid(`seed-report-${animal.slug}`);
    const temporaryId = productionAnimalId(i + 1);
    const caseNumber = productionCaseNumber(i + 1);
    const reporterEmail =
      CITIZEN_REPORTER_EMAILS[i % CITIZEN_REPORTER_EMAILS.length];
    const reporterId = reporters.get(reporterEmail) ?? citizen.id;
    const intakeDate = new Date(now - animal.intakeDaysAgo * 24 * 60 * 60 * 1000);
    const reportCreated = new Date(intakeDate.getTime() - 6 * 60 * 60 * 1000);
    const verifiedAt = new Date(intakeDate.getTime() - 4 * 60 * 60 * 1000);

    const urgency = calculateUrgencyScore({
      injurySeverity: animal.injurySeverity,
      environmentalDanger: animal.environmentalDanger,
      vulnerability: animal.vulnerability,
      verifiedAt,
    });

    await db.insert(rescueReports).values({
      id: reportId,
      reporterId,
      species: animal.species,
      injurySeverity: animal.injurySeverity,
      environmentalDanger: animal.environmentalDanger,
      vulnerability: animal.vulnerability,
      description: `${animal.bio} Reported near ${animal.areaLabel}.`,
      contactPreference: "phone",
      locationLabel: animal.areaLabel,
      latitude: animal.lat,
      longitude: animal.lng,
      approximateLatitude: animal.lat + 0.0006,
      approximateLongitude: animal.lng + 0.0006,
      createdAt: reportCreated,
    });

    await db.insert(rescueCases).values({
      id: caseId,
      reportId,
      caseNumber,
      status: "completed",
      urgencyScore: urgency.score,
      urgencyLevel: urgency.level,
      verifiedAt,
      verifiedById: verifierId,
      assignedShelterId: shelterIdForSlug(animal.shelterSlug),
      animalId,
      createdAt: reportCreated,
      updatedAt: intakeDate,
    });

    await db.insert(casePhotos).values({
      id: stableUuid(`seed-photo-${animal.slug}`),
      caseId,
      url: `/animals/${animal.slug}.png`,
      uploadedById: reporterId,
      photoType: "report",
      createdAt: reportCreated,
    });

    await db.insert(animals).values({
      id: animalId,
      name: animal.name,
      temporaryId,
      species: animal.species,
      estimatedAge: animal.estimatedAge,
      breed: animal.breed,
      color: animal.color,
      sex: animal.sex,
      bio: animal.bio,
      temperament: animal.temperament,
      rescueCaseId: caseId,
      shelterId: shelterIdForSlug(animal.shelterSlug),
      intakeDate,
      pathwayStage: animal.pathwayStage,
      recommendedNextAction: animal.recommendedNextAction,
      photoUrl: `/animals/${animal.slug}.png`,
    });

    await db.insert(medicalClearances).values({
      animalId,
      clearanceStatus: animal.clearanceStatus,
      examinationDate:
        animal.clearanceStatus === "awaiting_examination"
          ? null
          : new Date(intakeDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      generalCondition:
        animal.clearanceStatus === "medically_cleared"
          ? "Stable and fit for placement"
          : animal.clearanceStatus === "under_treatment"
            ? "Responding to treatment"
            : animal.clearanceStatus === "follow_up_required"
              ? "Needs scheduled follow-up"
              : "Pending full assessment",
      medicalPriority:
        animal.clearanceStatus === "under_treatment" ||
        animal.clearanceStatus === "follow_up_required"
          ? "urgent"
          : "routine",
    });

    animalIdsBySlug.set(animal.slug, animalId);
    console.log(`Linked ${caseNumber} ↔ ${temporaryId} ${animal.name} (reporter ${reporterEmail})`);
  }

  // Active field cases for dashboard / live map
  for (let i = 0; i < ACTIVE_CASES.length; i++) {
    const item = ACTIVE_CASES[i];
    const caseId = stableUuid(`seed-case-${item.slug}`);
    const reportId = stableUuid(`seed-report-${item.slug}`);
    const caseNumber = productionCaseNumber(100 + i + 1);
    const reporterId =
      reporters.get(item.reporterEmail) ?? citizen.id;
    const createdAt = new Date(now - item.daysAgo * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000);
    const verifiedAt =
      item.status === "report_submitted"
        ? null
        : new Date(createdAt.getTime() + 45 * 60 * 1000);

    const urgency = calculateUrgencyScore({
      injurySeverity: item.injurySeverity,
      environmentalDanger: item.environmentalDanger,
      vulnerability: item.vulnerability,
      verifiedAt,
    });

    await db.insert(rescueReports).values({
      id: reportId,
      reporterId,
      species: item.species,
      injurySeverity: item.injurySeverity,
      environmentalDanger: item.environmentalDanger,
      vulnerability: item.vulnerability,
      description: item.description,
      contactPreference: "phone",
      locationLabel: item.locationLabel,
      locationNote: item.locationNote ?? null,
      latitude: item.lat,
      longitude: item.lng,
      approximateLatitude: item.lat + 0.0005,
      approximateLongitude: item.lng + 0.0005,
      createdAt,
    });

    await db.insert(rescueCases).values({
      id: caseId,
      reportId,
      caseNumber,
      status: item.status,
      urgencyScore: urgency.score,
      urgencyLevel: urgency.level,
      verifiedAt,
      verifiedById: verifiedAt ? verifierId : null,
      assignedShelterId: item.shelterSlug
        ? shelterIdForSlug(item.shelterSlug)
        : null,
      rescuerNote: item.rescuerNote ?? null,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + 60 * 60 * 1000),
    });

    await db.insert(casePhotos).values({
      id: stableUuid(`seed-photo-${item.slug}`),
      caseId,
      url: `/rescue-cases/${item.slug}.png`,
      uploadedById: reporterId,
      photoType: "report",
      createdAt,
    });

    if (item.assignRescuer && rescuer) {
      await db.insert(rescuerAssignments).values({
        id: stableUuid(`seed-assign-${item.slug}`),
        caseId,
        rescuerId: rescuer.id,
        status:
          item.assignmentAccepted || item.status === "animal_secured"
            ? "accepted"
            : "pending",
        assignedById: verifierId,
        assignedAt: verifiedAt ?? createdAt,
      });
    }

    console.log(
      `Active case ${caseNumber} (${item.status}) photo=/rescue-cases/${item.slug}.png reporter=${item.reporterEmail}`,
    );
  }

  // Notifications
  await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.userId, admin.id),
        eq(notifications.type, "adoption"),
      ),
    );

  const readyAnimals = SEED_ANIMALS.filter(
    (a) => a.pathwayStage === "ready_for_adoption",
  ).slice(0, 2);

  await db.insert(notifications).values([
    ...readyAnimals.map((animal) => ({
      userId: admin.id,
      type: "adoption" as const,
      title: "Animal ready for adoption",
      message: `${animal.name} is medically cleared and listed as ready for adoption.`,
      caseId: stableUuid(`seed-case-${animal.slug}`),
      read: false,
    })),
    {
      userId: admin.id,
      type: "assignment" as const,
      title: "Critical rescue on C5",
      message: "A collapsed dog near the C5 exit ramp needs trauma intake.",
      caseId: stableUuid("seed-case-active-dog-highway"),
      read: false,
    },
  ]);

  const lunaId = animalIdsBySlug.get("luna");
  const bellaId = animalIdsBySlug.get("bella");
  if (lunaId && bellaId) {
    await db.delete(adoptionApplications).where(eq(adoptionApplications.animalId, lunaId));
    await db.delete(adoptionApplications).where(eq(adoptionApplications.animalId, bellaId));
    await db.insert(adoptionApplications).values([
      {
        id: stableUuid("seed-adoption-luna"),
        animalId: lunaId,
        applicantName: "Helena Cruz",
        applicantEmail: "helena.cruz@example.com",
        applicantPhone: "+63 917 555 0101",
        homeType: "house",
        hasYard: true,
        hasOtherPets: false,
        householdSize: 3,
        experienceNotes: "Previously cared for a family aspin for 8 years.",
        motivation:
          "Looking for a gentle dog for our kids after seeing Luna near the school rescue story.",
        status: "pending",
      },
      {
        id: stableUuid("seed-adoption-bella"),
        animalId: bellaId,
        applicantName: "Jonah Reyes",
        applicantEmail: "jonah.reyes@example.com",
        applicantPhone: "+63 918 555 0202",
        homeType: "apartment",
        hasYard: false,
        hasOtherPets: true,
        householdSize: 2,
        experienceNotes: "Currently has one calm adult cat.",
        motivation:
          "Want a quiet companion cat for our condo; Bella seems like a great match.",
        status: "pending",
      },
    ]);
  }

  console.log(
    `Demo seed complete: ${SEED_ANIMALS.length} animals linked to cases, ${ACTIVE_CASES.length} active field cases.`,
  );
}

seedDemo().catch((error) => {
  console.error(error);
  process.exit(1);
});
