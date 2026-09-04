/** Pixel size of case photo pins (matches CSS). */
export const CASE_PHOTO_MARKER_SIZE_PX = 48;

/**
 * Mapbox zoom at/above which case markers with photos switch to photo pins
 * together. Tuned to Metro Manila city framing (home default zoom is 11).
 */
export const CASE_MARKER_PHOTO_MIN_ZOOM = 11;

/**
 * Minimum center-to-center screen distance between visible pins when photos
 * are on. Overlapping losers are hidden (not demoted to dots) so one photo
 * never sits beside a pile of tiny pins.
 */
export const CASE_PHOTO_MIN_SEPARATION_PX = 64;

export type CaseMarkerLayoutMode = "photo" | "dot" | "hidden";

export type CasePhotoCandidate = {
  id: string;
  longitude: number;
  latitude: number;
  urgencyLevel?: string;
  selected?: boolean;
  hasPhoto: boolean;
};

function urgencyRank(level?: string): number {
  if (level === "critical") return 3;
  if (level === "high") return 2;
  if (level === "medium") return 1;
  return 0;
}

/**
 * Layout map pins.
 * - Below photo zoom: everyone is a legend dot (collision still hides stacks).
 * - At/above photo zoom: all photo-capable cases use photos together; losers
 *   that collide are hidden, not mixed back to dots.
 */
export function resolveCaseMarkerLayout(
  candidates: CasePhotoCandidate[],
  project: (longitude: number, latitude: number) => { x: number; y: number } | null,
  options?: {
    photosEnabled?: boolean;
    minSeparationPx?: number;
  },
): Map<string, CaseMarkerLayoutMode> {
  const photosEnabled = options?.photosEnabled ?? false;
  const minSeparationPx =
    options?.minSeparationPx ??
    (photosEnabled ? CASE_PHOTO_MIN_SEPARATION_PX : 16);
  const layout = new Map<string, CaseMarkerLayoutMode>();
  const placed: { id: string; x: number; y: number }[] = [];
  const minDistSq = minSeparationPx * minSeparationPx;

  const ranked = candidates
    .map((c) => {
      const point = project(c.longitude, c.latitude);
      if (!point) {
        layout.set(c.id, "hidden");
        return null;
      }
      return { ...c, x: point.x, y: point.y };
    })
    .filter(
      (c): c is CasePhotoCandidate & { x: number; y: number } => c !== null,
    )
    .sort((a, b) => {
      if (a.selected !== b.selected) return a.selected ? -1 : 1;
      if (photosEnabled && a.hasPhoto !== b.hasPhoto) {
        return a.hasPhoto ? -1 : 1;
      }
      const urgencyDelta =
        urgencyRank(b.urgencyLevel) - urgencyRank(a.urgencyLevel);
      if (urgencyDelta !== 0) return urgencyDelta;
      return a.id.localeCompare(b.id);
    });

  for (const candidate of ranked) {
    const collides = placed.some((other) => {
      const dx = candidate.x - other.x;
      const dy = candidate.y - other.y;
      return dx * dx + dy * dy < minDistSq;
    });

    if (collides) {
      layout.set(candidate.id, "hidden");
      continue;
    }

    placed.push({ id: candidate.id, x: candidate.x, y: candidate.y });
    const usePhoto = photosEnabled && candidate.hasPhoto;
    layout.set(candidate.id, usePhoto ? "photo" : "dot");
  }

  return layout;
}

/** @deprecated Use resolveCaseMarkerLayout */
export function resolveCasePhotoVisibility(
  candidates: CasePhotoCandidate[],
  project: (longitude: number, latitude: number) => { x: number; y: number } | null,
  minSeparationPx?: number,
): Set<string> {
  const layout = resolveCaseMarkerLayout(candidates, project, {
    photosEnabled: true,
    minSeparationPx,
  });
  const photos = new Set<string>();
  for (const [id, mode] of layout) {
    if (mode === "photo") photos.add(id);
  }
  return photos;
}
