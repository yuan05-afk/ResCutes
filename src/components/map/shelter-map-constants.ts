import type { MapLegendItem } from "@/components/map/map-constants";
import type { ShelterSpeciesProfile } from "@/lib/data/philippines-shelters-directory";
import { SHELTER_SPECIES_PROFILE_LABELS } from "@/lib/data/philippines-shelters-directory";

export const SHELTER_MARKER_COLORS: Record<ShelterSpeciesProfile, string> = {
  dog_only: "#183C35",
  cat_only: "#4A7C6F",
  dog_cat: "#2D6A4F",
  mixed: "#C9912F",
  wildlife: "#6B5B7A",
  unknown: "#6B7872",
};

export function shelterMarkerColor(profile: ShelterSpeciesProfile): string {
  return SHELTER_MARKER_COLORS[profile];
}

export const SHELTER_MAP_LEGEND: MapLegendItem[] = (
  ["dog_cat", "dog_only", "cat_only", "mixed", "wildlife"] as ShelterSpeciesProfile[]
).map((id) => ({
  id,
  label: SHELTER_SPECIES_PROFILE_LABELS[id],
  description: SHELTER_SPECIES_PROFILE_LABELS[id],
  color: SHELTER_MARKER_COLORS[id],
}));
