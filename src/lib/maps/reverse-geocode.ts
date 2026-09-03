/**
 * Reverse geocode coordinates to a short place label via Mapbox.
 */

function pickPlaceLabel(feature: {
  place_name?: string;
  text?: string;
}): string | null {
  const name = (feature.place_name ?? feature.text ?? "").trim();
  if (!name) return null;
  // Keep labels concise for cards (street + locality is enough).
  const parts = name.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 3) return parts.join(", ");
  return parts.slice(0, 3).join(", ");
}

export async function reverseGeocodeLabel(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  try {
    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
    );
    url.searchParams.set("types", "address,poi,place,locality,neighborhood");
    url.searchParams.set("limit", "1");
    url.searchParams.set("country", "ph");
    url.searchParams.set("access_token", token);

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      features?: { place_name?: string; text?: string }[];
    };
    const feature = data.features?.[0];
    if (!feature) return null;
    return pickPlaceLabel(feature);
  } catch {
    return null;
  }
}
