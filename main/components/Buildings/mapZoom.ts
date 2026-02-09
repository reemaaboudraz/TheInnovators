import type { Region } from "react-native-maps";
import type { LatLng } from "@/components/Buildings/types";

// Computes a map region that fits a building polygon, applying padding for a smooth zoom-in effect
export function regionFromPolygon(
  poly: LatLng[],
  paddingFactor = 1.35,
  minDelta = 0.0006,
): Region {
  let minLat = poly[0].latitude;
  let maxLat = poly[0].latitude;
  let minLng = poly[0].longitude;
  let maxLng = poly[0].longitude;

  for (const p of poly) {
    minLat = Math.min(minLat, p.latitude);
    maxLat = Math.max(maxLat, p.latitude);
    minLng = Math.min(minLng, p.longitude);
    maxLng = Math.max(maxLng, p.longitude);
  }

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;

  const latitudeDelta = Math.max((maxLat - minLat) * paddingFactor, minDelta);
  const longitudeDelta = Math.max((maxLng - minLng) * paddingFactor, minDelta);

  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

// Returns a padding factor based on building size to control how much the map zooms in
export function paddingForZoomCategory(cat: 1 | 2 | 3 = 1): number {
  switch (cat) {
    case 1:
      return 1.9;
    case 2:
      return 1.35;
    case 3:
      return 1.15;
  }
}
