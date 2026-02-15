import type { LatLng } from "@/components/Buildings/types";

/**
 * Determines if a point is inside a polygon using the ray casting algorithm.
 * @param point - The point to check (latitude, longitude)
 * @param polygon - Array of polygon vertices
 * @returns true if point is inside the polygon
 */
export function isPointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  if (!polygon || polygon.length < 3) {
    return false;
  }

  const { latitude: y, longitude: x } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}
