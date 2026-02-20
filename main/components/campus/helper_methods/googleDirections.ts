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

export type DirectionStep = {
  instruction: string;
  distanceText: string;
  durationText: string;
  start: LatLng;
  end: LatLng;
};

export type DirectionRouteWithSteps = DirectionRoute & {
  steps: DirectionStep[];
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

//ADDED HELPER + FUNCTION DIRECTION WITH STEPS
function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchDirectionsWithSteps(params: {
  origin: LatLng;
  destination: LatLng;
  mode: TravelMode;
}): Promise<DirectionRouteWithSteps[]> {
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

  if (!res.ok) throw new Error(`Directions HTTP ${res.status}`);
  if (json.status !== "OK") {
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

      const stepsRaw = (leg?.steps ?? []) as any[];
      const steps: DirectionStep[] = stepsRaw
        .map((s) => {
          const start = s?.start_location;
          const end = s?.end_location;

          return {
            instruction: stripHtml(String(s?.html_instructions ?? "")),
            distanceText: String(s?.distance?.text ?? ""),
            durationText: String(s?.duration?.text ?? ""),
            start: {
              latitude: Number(start?.lat ?? 0),
              longitude: Number(start?.lng ?? 0),
            },
            end: {
              latitude: Number(end?.lat ?? 0),
              longitude: Number(end?.lng ?? 0),
            },
          };
        })
        .filter((st) => st.instruction.length > 0);

      return {
        summary: r.summary ?? "",
        polyline: r.overview_polyline?.points ?? "",
        durationSec: duration?.value ?? Number.MAX_SAFE_INTEGER,
        durationText: duration?.text ?? "",
        distanceMeters: distance?.value ?? 0,
        distanceText: distance?.text ?? "",
        steps,
      } as DirectionRouteWithSteps;
    })
    .filter((r) => !!r.polyline);
}
