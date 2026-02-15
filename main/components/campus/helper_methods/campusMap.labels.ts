import type { Region } from "react-native-maps";
import type { Building } from "@/components/Buildings/types";

function getMaxDelta(region: Region): number {
  return Math.max(region.latitudeDelta ?? 0, region.longitudeDelta ?? 0);
}

export function shouldShowBuildingLabel(
  building: Building,
  region: Region | null,
): boolean {
  if (!region) return true;

  const z = building.zoomCategory ?? 2;
  const maxDelta = getMaxDelta(region);

  // FAR ZOOM OUT: hide everything (prevents “cluster blob”)
  // (This is around: city-scale view)
  if (maxDelta >= 0.06) return false;

  // BIG buildings (category 1): visible at most zooms, but not when extremely zoomed out.
  if (z === 1) return maxDelta <= 0.05;

  // MED buildings (category 2): require moderate zoom-in.
  if (z === 2) return maxDelta <= 0.02;

  // SMALL buildings (category 3): require closer zoom-in than before (was 0.008).
  return maxDelta <= 0.003;
}
