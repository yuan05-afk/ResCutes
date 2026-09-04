/** Shared great-circle distance helpers for map nearest-target UX. */

export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function sortByDistanceKm<
  T extends { latitude: number; longitude: number },
>(
  items: T[],
  from: { latitude: number; longitude: number },
): Array<T & { distanceKm: number }> {
  return items
    .map((item) => ({
      ...item,
      distanceKm: distanceKm(
        from.latitude,
        from.longitude,
        item.latitude,
        item.longitude,
      ),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
