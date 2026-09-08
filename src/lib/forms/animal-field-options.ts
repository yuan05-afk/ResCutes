/**
 * Shared structured options for animal / shelter forms.
 * Prefer these over free-text so staff pick consistent values.
 */

export type FieldOption = { value: string; label: string };

export const OTHER_VALUE = "__other__";

export const ANIMAL_SEX_OPTIONS: FieldOption[] = [
  { value: "unknown", label: "Unknown" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "spayed_female", label: "Spayed female" },
  { value: "neutered_male", label: "Neutered male" },
  { value: OTHER_VALUE, label: "Other…" },
];

export const ANIMAL_AGE_OPTIONS: FieldOption[] = [
  { value: "unknown", label: "Unknown" },
  { value: "neonate", label: "Neonate (<8 wk)" },
  { value: "kitten", label: "Kitten / puppy" },
  { value: "juvenile", label: "Juvenile" },
  { value: "young_adult", label: "Young adult" },
  { value: "adult", label: "Adult" },
  { value: "senior", label: "Senior" },
  { value: OTHER_VALUE, label: "Other…" },
];

/** Common Philippine shelter dog breeds + mixes. */
export const DOG_BREED_OPTIONS: FieldOption[] = [
  { value: "Aspin", label: "Aspin" },
  { value: "Aspin mix", label: "Aspin mix" },
  { value: "Mix", label: "Mixed breed" },
  { value: "Shih-tzu mix", label: "Shih Tzu mix" },
  { value: "Labrador Retriever", label: "Labrador" },
  { value: "German Shepherd", label: "German Shepherd" },
  { value: "Poodle", label: "Poodle" },
  { value: "Beagle", label: "Beagle" },
  { value: "Chihuahua", label: "Chihuahua" },
  { value: "Husky", label: "Husky" },
  { value: "Belgian Malinois", label: "Malinois" },
  { value: "Rottweiler", label: "Rottweiler" },
  { value: OTHER_VALUE, label: "Other…" },
];

/** Common Philippine shelter cat types. */
export const CAT_BREED_OPTIONS: FieldOption[] = [
  { value: "Domestic shorthair", label: "Shorthair (Puspin)" },
  { value: "Domestic longhair", label: "Longhair" },
  { value: "Mix", label: "Mixed / unknown" },
  { value: "Siamese", label: "Siamese" },
  { value: "Persian", label: "Persian" },
  { value: "British Shorthair", label: "British SH" },
  { value: OTHER_VALUE, label: "Other…" },
];

export const GENERIC_BREED_OPTIONS: FieldOption[] = [
  { value: "Unknown", label: "Unknown" },
  { value: "Mix", label: "Mixed / unknown" },
  { value: OTHER_VALUE, label: "Other…" },
];

export const COAT_COLOR_OPTIONS: FieldOption[] = [
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "brown", label: "Brown" },
  { value: "tan", label: "Tan" },
  { value: "cream", label: "Cream" },
  { value: "beige", label: "Beige" },
  { value: "brindle", label: "Brindle" },
  { value: "gray", label: "Gray" },
  { value: "orange tabby", label: "Orange tabby" },
  { value: "gray tabby", label: "Gray tabby" },
  { value: "calico", label: "Calico" },
  { value: "tri-color", label: "Tri-color" },
  { value: "black with white chest", label: "Black & white" },
  { value: "white-brown", label: "White & brown" },
  { value: "golden brown", label: "Golden brown" },
  { value: OTHER_VALUE, label: "Other…" },
];

export const TEMPERAMENT_PILL_OPTIONS: FieldOption[] = [
  { value: "Gentle", label: "Gentle" },
  { value: "Shy", label: "Shy" },
  { value: "Energetic", label: "Energetic" },
  { value: "Playful", label: "Playful" },
  { value: "Independent", label: "Independent" },
  { value: "People-oriented", label: "People-oriented" },
  { value: "Soft with children", label: "Kids-friendly" },
  { value: "Good with dogs", label: "Good with dogs" },
  { value: "Good with cats", label: "Good with cats" },
  { value: "Anxious", label: "Anxious" },
  { value: "Food-motivated", label: "Food-motivated" },
  { value: "Reserved at first", label: "Reserved" },
  { value: OTHER_VALUE, label: "Other…" },
];

export const PATHWAY_STAGE_OPTIONS: FieldOption[] = [
  { value: "intake", label: "Intake" },
  { value: "medical_clearance", label: "Medical" },
  { value: "ready_for_foster", label: "Foster ready" },
  { value: "ready_for_adoption", label: "Adoption ready" },
  { value: "transferred", label: "Transferred" },
];

export const HOME_TYPE_OPTIONS: FieldOption[] = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "boarding_house", label: "Boarding" },
  { value: OTHER_VALUE, label: "Other…" },
];

export const DEPARTMENT_OPTIONS: FieldOption[] = [
  { value: "Intake", label: "Intake" },
  { value: "Medical", label: "Medical" },
  { value: "Veterinary", label: "Veterinary" },
  { value: "Operations", label: "Operations" },
  { value: "Adoption", label: "Adoption" },
  { value: "Field Rescue", label: "Field rescue" },
  { value: "Administration", label: "Admin" },
  { value: OTHER_VALUE, label: "Other…" },
];

export const GENERAL_CONDITION_OPTIONS: FieldOption[] = [
  { value: "Stable and fit for placement", label: "Stable / placeable" },
  { value: "Responding to treatment", label: "Responding" },
  { value: "Needs scheduled follow-up", label: "Needs follow-up" },
  { value: "Pending full assessment", label: "Pending assess" },
  { value: "Underweight", label: "Underweight" },
  { value: "Dehydrated", label: "Dehydrated" },
  { value: "Lethargic", label: "Lethargic" },
  { value: "Injured / wound present", label: "Injured / wound" },
  { value: "Lameness", label: "Lameness" },
  { value: "Skin condition", label: "Skin condition" },
  { value: OTHER_VALUE, label: "Other…" },
];

export const REPORT_SPECIES = [
  "dog",
  "cat",
  "bird",
  "rabbit",
  "other",
] as const;

export const REPORT_INJURY = [
  "none_visible",
  "minor",
  "moderate",
  "severe",
  "critical",
] as const;

export const REPORT_DANGER = [
  "none",
  "traffic",
  "weather",
  "predators",
  "trapped",
  "other_danger",
] as const;

export const REPORT_VULNERABILITY = [
  "adult_healthy",
  "juvenile",
  "elderly",
  "pregnant",
  "nursing",
  "disabled",
] as const;

export const REPORT_CONTACT = [
  "in_app",
  "phone",
  "email",
  "no_contact",
] as const;

export function breedOptionsForSpecies(species?: string | null): FieldOption[] {
  const s = (species ?? "").toLowerCase();
  if (s === "dog") return DOG_BREED_OPTIONS;
  if (s === "cat") return CAT_BREED_OPTIONS;
  return GENERIC_BREED_OPTIONS;
}

/** Split a stored value into select choice + optional Other text. */
export function splitSelectOther(
  value: string | null | undefined,
  options: FieldOption[],
): { choice: string; other: string } {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    const empty = options.find((o) => o.value === "" || o.value === "unknown");
    return { choice: empty?.value ?? "", other: "" };
  }
  const known = options.find(
    (o) =>
      o.value !== OTHER_VALUE &&
      o.value.toLowerCase() === trimmed.toLowerCase(),
  );
  if (known) return { choice: known.value, other: "" };
  return { choice: OTHER_VALUE, other: trimmed };
}

/** Resolve select choice + Other text into the value to persist. */
export function resolveSelectOther(
  choice: string,
  other: string,
  options?: FieldOption[],
): string | null {
  if (!choice || choice === "") return null;
  if (choice === OTHER_VALUE) {
    const custom = other.trim();
    return custom || null;
  }
  if (options) {
    const match = options.find((o) => o.value === choice);
    if (!match) return null;
  }
  return choice;
}

export function validateSelectOther(
  label: string,
  choice: string,
  other: string,
  opts?: { required?: boolean; maxOtherLen?: number },
): string | null {
  const required = opts?.required ?? false;
  const maxOtherLen = opts?.maxOtherLen ?? 80;
  if (choice === OTHER_VALUE) {
    const custom = other.trim();
    if (!custom) return `${label}: please describe “Other”.`;
    if (custom.length > maxOtherLen) {
      return `${label}: keep “Other” under ${maxOtherLen} characters.`;
    }
    if (!/^[\w\s.,'/()+&\-]+$/i.test(custom)) {
      return `${label}: use letters, numbers, and basic punctuation only.`;
    }
    return null;
  }
  if (required && !choice) return `${label} is required.`;
  return null;
}

export function validateOptionalText(
  label: string,
  value: string,
  opts?: { maxLen?: number; minLen?: number },
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const maxLen = opts?.maxLen ?? 2000;
  const minLen = opts?.minLen ?? 0;
  if (trimmed.length < minLen) {
    return `${label} must be at least ${minLen} characters.`;
  }
  if (trimmed.length > maxLen) {
    return `${label} must be under ${maxLen} characters.`;
  }
  return null;
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function validatePhoneOptional(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length < 7 || trimmed.length > 20) {
    return "Phone should be 7–20 characters.";
  }
  if (!/^[+\d][\d\s()-]*$/.test(trimmed)) {
    return "Phone may only include digits, spaces, +, (, ), and -.";
  }
  return null;
}

/** Phone is required so shelter staff can reach the adopter before approval. */
export function validatePhoneRequired(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Phone number is required.";
  return validatePhoneOptional(trimmed);
}

/**
 * Optional social profile URL (Facebook, Instagram, etc.) for staff contact.
 * Accepts full URLs or common profile handles starting with @.
 */
export function validateSocialLinkOptional(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 200) {
    return "Social link must be under 200 characters.";
  }
  if (trimmed.startsWith("@")) {
    if (!/^@[\w.]{2,80}$/i.test(trimmed)) {
      return "Enter a valid @handle or a full profile URL.";
    }
    return null;
  }
  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
    if (!["http:", "https:"].includes(url.protocol)) {
      return "Social link must be a web URL.";
    }
    return null;
  } catch {
    return "Enter a valid profile URL or @handle.";
  }
}

export function pathwayValues(): string[] {
  return PATHWAY_STAGE_OPTIONS.map((o) => o.value);
}

export function isPathwayStage(value: string): boolean {
  return pathwayValues().includes(value);
}

/** True if value is a known option label/value, or a valid custom “Other” string. */
export function isAllowedCatalogOrOther(
  value: string | null | undefined,
  options: FieldOption[],
  opts?: { allowEmpty?: boolean; maxLen?: number },
): boolean {
  const allowEmpty = opts?.allowEmpty ?? true;
  const maxLen = opts?.maxLen ?? 80;
  if (value == null || !value.trim()) return allowEmpty;
  const trimmed = value.trim();
  const known = options.some(
    (o) =>
      o.value !== OTHER_VALUE &&
      o.value.toLowerCase() === trimmed.toLowerCase(),
  );
  if (known) return true;
  const allowsOther = options.some((o) => o.value === OTHER_VALUE);
  if (!allowsOther) return false;
  if (trimmed.length > maxLen) return false;
  return /^[\w\s.,'/()+&\-]+$/i.test(trimmed);
}

export function validateRequiredAnimalName(name: string | null | undefined): string | null {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "Name is required.";
  return validateOptionalText("Name", trimmed, { minLen: 1, maxLen: 80 });
}

export function validateAnimalProfilePayload(fields: {
  name?: string | null;
  bio?: string | null;
  temperament?: string | null;
  pathwayStage?: string;
  sex?: string | null;
  estimatedAge?: string | null;
  breed?: string | null;
  color?: string | null;
  species?: string | null;
  /** When true, name must be present even if omitted from fields. */
  requireName?: boolean;
}): string | null {
  if (fields.pathwayStage !== undefined && !isPathwayStage(fields.pathwayStage)) {
    return "Invalid pathway stage.";
  }
  if (fields.requireName || fields.name !== undefined) {
    const nameErr = validateRequiredAnimalName(fields.name);
    if (nameErr) return nameErr;
  }
  if (fields.bio != null) {
    const err = validateOptionalText("Bio", fields.bio, { maxLen: 2000 });
    if (err) return err;
  }
  if (fields.temperament != null) {
    const err = validateOptionalText("Temperament", fields.temperament, {
      maxLen: 500,
    });
    if (err) return err;
  }
  if (
    fields.sex !== undefined &&
    !isAllowedCatalogOrOther(fields.sex, ANIMAL_SEX_OPTIONS)
  ) {
    return "Invalid sex value.";
  }
  if (
    fields.estimatedAge !== undefined &&
    !isAllowedCatalogOrOther(fields.estimatedAge, ANIMAL_AGE_OPTIONS)
  ) {
    return "Invalid age value.";
  }
  if (fields.breed !== undefined && !isAllowedBreed(fields.breed)) {
    return "Invalid breed value.";
  }
  if (
    fields.color !== undefined &&
    !isAllowedCatalogOrOther(fields.color, COAT_COLOR_OPTIONS)
  ) {
    return "Invalid color value.";
  }
  return null;
}

export function isAllowedBreed(value: string | null | undefined): boolean {
  if (value == null || !value.trim()) return true;
  return (
    isAllowedCatalogOrOther(value, DOG_BREED_OPTIONS) ||
    isAllowedCatalogOrOther(value, CAT_BREED_OPTIONS) ||
    isAllowedCatalogOrOther(value, GENERIC_BREED_OPTIONS)
  );
}

export const MEDICAL_PRIORITY_VALUES = [
  "routine",
  "urgent",
  "emergency",
] as const;

export function isMedicalPriority(value: string): boolean {
  return (MEDICAL_PRIORITY_VALUES as readonly string[]).includes(value);
}
