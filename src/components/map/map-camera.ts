import mapboxgl from "mapbox-gl";

export const MAP_CAMERA_FLY_MS = 900;
export const MAP_CAMERA_EASE_MS = 520;
export const MAP_CAMERA_SHORT_HOP_MS = 650;
export const MAP_SHELTER_FOCUS_ZOOM = 12;

function cameraDistanceDeg(
  map: mapboxgl.Map,
  center: { latitude: number; longitude: number },
) {
  const current = map.getCenter();
  const dLat = current.lat - center.latitude;
  const dLng = current.lng - center.longitude;
  return Math.hypot(dLat, dLng);
}

function isFiniteCenter(center: { latitude: number; longitude: number }) {
  return (
    Number.isFinite(center.latitude) && Number.isFinite(center.longitude)
  );
}

/**
 * Smooth camera move to a point. Always animates - including short hops -
 * so rapid shelter/case selection never looks like a no-op jump.
 *
 * Do not pass Mapbox `offset` here: an undefined/invalid offset makes
 * mapbox-gl throw `Cannot read properties of undefined (reading 'x')`.
 */
export function flyMapToCenter(
  map: mapboxgl.Map,
  center: { latitude: number; longitude: number },
  zoom?: number,
  options?: { padding?: mapboxgl.PaddingOptions },
) {
  if (!isFiniteCenter(center)) return;

  const currentZoom = map.getZoom();
  const targetZoom =
    typeof zoom === "number" && Number.isFinite(zoom) ? zoom : currentZoom;
  const zoomDelta = Math.abs(targetZoom - currentZoom);
  const distance = cameraDistanceDeg(map, center);
  const padding = options?.padding;

  // Cancel any in-progress fit/fly so the latest selection always wins.
  try {
    map.stop();
  } catch {
    // Map can be mid-destroy during route changes.
  }

  const target: [number, number] = [center.longitude, center.latitude];

  // Tiny nudge when already nearly on-target so Mapbox still plays a visible
  // transition (returning to a prior shelter after rapid switching).
  const needsNudge = distance < 0.0008 && zoomDelta < 0.05;
  const nudged: [number, number] = needsNudge
    ? [center.longitude + 0.00025, center.latitude + 0.00025]
    : target;

  const shortHop = distance < 0.45 && zoomDelta < 2.5;

  try {
    if (shortHop) {
      if (needsNudge) {
        map.jumpTo({ center: nudged, zoom: targetZoom });
      }
      const easeOpts: mapboxgl.EaseToOptions = {
        center: target,
        zoom: targetZoom,
        duration: Math.max(
          MAP_CAMERA_EASE_MS,
          Math.min(MAP_CAMERA_SHORT_HOP_MS, 420 + distance * 1400),
        ),
        essential: true,
        easing: (t) => 1 - Math.pow(1 - t, 2.4),
      };
      if (padding) easeOpts.padding = padding;
      map.easeTo(easeOpts);
      return;
    }

    const flyOpts: mapboxgl.FlyToOptions = {
      center: target,
      zoom: targetZoom,
      duration: MAP_CAMERA_FLY_MS,
      essential: true,
      curve: zoomDelta > 2 ? 1.35 : 1.15,
      speed: zoomDelta > 4 ? 0.85 : 1.05,
    };
    if (padding) flyOpts.padding = padding;
    map.flyTo(flyOpts);
  } catch {
    // Last resort: hard jump so selection never hard-crashes the page.
    map.jumpTo({ center: target, zoom: targetZoom });
  }
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
    if (!isFiniteCenter(marker)) continue;
    bounds.extend([marker.longitude, marker.latitude]);
  }

  if (bounds.isEmpty()) return;

  try {
    map.stop();
    map.fitBounds(bounds, {
      padding,
      maxZoom,
      duration: MAP_CAMERA_FLY_MS,
      essential: true,
    });
  } catch {
    const center = bounds.getCenter();
    map.jumpTo({ center, zoom: Math.min(maxZoom, 11) });
  }
}
