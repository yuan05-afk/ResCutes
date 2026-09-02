import mapboxgl from "mapbox-gl";

export const MAP_CAMERA_FLY_MS = 900;
export const MAP_CAMERA_EASE_MS = 280;

export function flyMapToCenter(
  map: mapboxgl.Map,
  center: { latitude: number; longitude: number },
  zoom?: number,
) {
  map.flyTo({
    center: [center.longitude, center.latitude],
    ...(zoom != null ? { zoom } : {}),
    duration: MAP_CAMERA_FLY_MS,
    essential: true,
  });
}

export function fitMapToMarkers(
  map: mapboxgl.Map,
  markers: { latitude: number; longitude: number }[],
  options?: { padding?: number; maxZoom?: number },
) {
  if (markers.length === 0) return;

  const padding = options?.padding ?? 56;
  const maxZoom = options?.maxZoom ?? 14;

  if (markers.length === 1) {
    flyMapToCenter(map, markers[0], Math.min(maxZoom, 13));
    return;
  }

  const bounds = new mapboxgl.LngLatBounds();
  for (const marker of markers) {
    bounds.extend([marker.longitude, marker.latitude]);
  }

  map.fitBounds(bounds, {
    padding,
    maxZoom,
    duration: MAP_CAMERA_FLY_MS,
    essential: true,
  });
}
