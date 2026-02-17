import Constants from "expo-constants";

export type TravelMode = "driving" | "walking" | "transit" | "bicycling";

export type LatLng = { latitude: number; longitude: number };

export type DirectionRoute = {
  summary: string;
  polyline: string;
  durationSec: number;
  durationText: string;
  distanceMeters: number;
  distanceText: string;
};

function getGoogleMapsKey(): string {
  const key = (Constants.expoConfig?.extra as any)?.googleMapsApiKey;
  if (!key)
    throw new Error(
      "Missing Google Maps API key in expoConfig.extra.googleMapsApiKey",
    );
  return key;
}

/**
 * Minimal polyline decoder (Google encoded polyline algorithm)
 */
export function decodePolyline(encoded: string): LatLng[] {
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;
  const coordinates: LatLng[] = [];

  while (index < len) {
    let b = 0;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
}

export async function fetchDirections(params: {
  origin: LatLng;
  destination: LatLng;
  mode: TravelMode;
}): Promise<DirectionRoute[]> {
  const key = getGoogleMapsKey();
  const { origin, destination, mode } = params;

  const url =
    "https://maps.googleapis.com/maps/api/directions/json" +
    `?origin=${origin.latitude},${origin.longitude}` +
    `&destination=${destination.latitude},${destination.longitude}` +
    `&mode=${mode}` +
    `&alternatives=true` +
    `&language=en` +
    `&region=ca` +
    `&key=${key}`;

  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(`Directions HTTP ${res.status}`);
  }

  if (json.status !== "OK") {
    // e.g. ZERO_RESULTS, REQUEST_DENIED
    throw new Error(
      `Directions API status: ${json.status} ${json.error_message ?? ""}`.trim(),
    );
  }

  const routes = (json.routes ?? []) as any[];

  return routes
    .map((r) => {
      const leg = r.legs?.[0];
      const duration = leg?.duration;
      const distance = leg?.distance;

      return {
        summary: r.summary ?? "",
        polyline: r.overview_polyline?.points ?? "",
        durationSec: duration?.value ?? Number.MAX_SAFE_INTEGER,
        durationText: duration?.text ?? "",
        distanceMeters: distance?.value ?? 0,
        distanceText: distance?.text ?? "",
      } as DirectionRoute;
    })
    .filter((r) => !!r.polyline);
}

/**
 * Returns the fastest route (shortest travel time) from a list.
 */
export function pickFastestRoute(
  routes: DirectionRoute[],
): DirectionRoute | null {
  if (!routes.length) return null;
  return routes[0];
}
