import mapboxgl from "mapbox-gl";

export const MAP_CAMERA_FLY_MS = 900;
export const MAP_CAMERA_EASE_MS = 280;
export const MAP_SHELTER_FOCUS_ZOOM = 12;

export function flyMapToCenter(
  map: mapboxgl.Map,
  center: { latitude: number; longitude: number },
  zoom?: number,
) {
  const currentZoom = map.getZoom();
  const targetZoom = zoom ?? currentZoom;
  const zoomDelta = Math.abs(targetZoom - currentZoom);

  // Cancel any in-progress fit/ease so selection focus always wins.
  map.stop();
  map.flyTo({
    center: [center.longitude, center.latitude],
    zoom: targetZoom,
    duration: MAP_CAMERA_FLY_MS,
    essential: true,
    curve: zoomDelta > 2 ? 1.35 : 1.1,
    speed: zoomDelta > 4 ? 0.85 : 1.1,
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
