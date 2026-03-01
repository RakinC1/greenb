// Geocode a text address → {lat, lng}
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const encoded = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&limit=1`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (!json.features?.length) return null;
    const [lng, lat] = json.features[0].center;
    return { lat, lng };
  } catch {
    return null;
  }
}

// Calculate distance in km between two coordinates (Haversine)
export function distanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Default map center (NYC — change to your city)
export const DEFAULT_CENTER: [number, number] = [-74.006, 40.7128];
export const DEFAULT_ZOOM = 12;
