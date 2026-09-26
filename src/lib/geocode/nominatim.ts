interface NominatimResult {
  display_name: string;
  address: {
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state_district?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

// Simple in-memory cache for geocoding results
const geocodeCache = new Map<string, NominatimResult>();

// Rate limiting: max 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // 1.1 seconds to be safe

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed)
    );
  }
  lastRequestTime = Date.now();
}

/**
 * Reverse geocode GPS coordinates to an address using Nominatim.
 * Respects usage policy: rate limited, cached, with proper User-Agent.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ address: string; region: string } | null> {
  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;

  if (geocodeCache.has(cacheKey)) {
    const cached = geocodeCache.get(cacheKey)!;
    return {
      address: cached.display_name,
      region: cached.address.state || cached.address.country || "",
    };
  }

  try {
    await waitForRateLimit();

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "ImpactLens/1.0 (hackathon project; contact@impactlens.dev)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`[Geocode] Nominatim returned ${response.status}`);
      return null;
    }

    const data: NominatimResult = await response.json();
    geocodeCache.set(cacheKey, data);

    return {
      address: data.display_name,
      region:
        data.address.state ||
        data.address.state_district ||
        data.address.country ||
        "",
    };
  } catch (error) {
    console.warn("[Geocode] Reverse geocoding failed:", error);
    return null;
  }
}

/**
 * Coarsen GPS coordinates for privacy in public reports.
 * Rounds to 2 decimal places (~1.1km precision).
 */
export function coarsenGps(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: Math.round(lat * 100) / 100,
    lng: Math.round(lng * 100) / 100,
  };
}
