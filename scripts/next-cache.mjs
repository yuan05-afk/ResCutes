import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const NEXT_DIR = ".next";

/** Manifests that should exist once the dev server has compiled at least once. */
const HEALTH_MARKERS = [
  "routes-manifest.json",
  join("server", "middleware-manifest.json"),
];

/**
 * Returns true when `.next` looks half-deleted or mixed (build + dev race, or
 * deleting `.next` while `next dev` is still running).
 */
export function isNextCacheCorrupt() {
  if (!existsSync(NEXT_DIR)) return false;

  let entries = [];
  try {
    entries = readdirSync(NEXT_DIR);
  } catch {
    return true;
  }

  // Empty or nearly empty folder left after a failed clean.
  if (entries.length === 0) return true;

  const cacheDir = join(NEXT_DIR, "cache");
  const hasCache = existsSync(cacheDir);
  const missingMarkers = HEALTH_MARKERS.filter(
    (marker) => !existsSync(join(NEXT_DIR, marker)),
  );

  // Cache/webpack output without route manifests = broken state.
  if (hasCache && missingMarkers.length > 0) return true;

  // BUILD_ID without dev artifacts usually means production build output
  // while dev is expected (or vice versa after interrupted build).
  const hasBuildId = existsSync(join(NEXT_DIR, "BUILD_ID"));
  const hasDevManifest = existsSync(join(NEXT_DIR, "build-manifest.json"));
  if (hasBuildId && !hasDevManifest && missingMarkers.length > 0) return true;

  return false;
}

export function cleanNextCache(reason) {
  if (!existsSync(NEXT_DIR)) return false;
  console.log(reason);
  rmSync(NEXT_DIR, { recursive: true, force: true });
  return true;
}
