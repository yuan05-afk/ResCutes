/** Species-appropriate demo imagery for consistent UI. */
export const SPECIES_DEMO_IMAGES: Record<string, string> = {
  dog: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop",
  cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop",
  bird: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&h=400&fit=crop",
  rabbit: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=400&fit=crop",
  other: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop",
};

/** Luna — medium brown dog near España Boulevard, Sampaloc, Manila (demo scenario). */
export const LUNA_DEMO_IMAGE =
  "https://images.unsplash.com/photo-1561037404-61cd46aa615e?w=600&h=400&fit=crop";

export function getSpeciesImage(species: string, fallback?: string): string {
  return SPECIES_DEMO_IMAGES[species] ?? fallback ?? SPECIES_DEMO_IMAGES.other;
}

export function getCasePhotoUrl(
  species: string,
  photoUrl?: string,
  caseId?: string,
): string {
  if (caseId === "case-luna" || photoUrl?.includes("1583511655857")) {
    return LUNA_DEMO_IMAGE;
  }
  if (photoUrl) return photoUrl;
  return getSpeciesImage(species);
}
