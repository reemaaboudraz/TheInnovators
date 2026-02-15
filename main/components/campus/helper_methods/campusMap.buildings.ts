import type { Building } from "@/components/Buildings/types";
import { isPointInPolygon } from "@/components/campus/helper_methods/pointInPolygon";

export const buildAllBuildings = (sgw: Building[], loy: Building[]) => [
  ...sgw,
  ...loy,
];

export const getBuildingContainingPoint = (
  buildings: Building[],
  lat: number,
  lng: number,
): Building | undefined => {
  return buildings.find(
    (b) =>
      b.polygon?.length &&
      isPointInPolygon({ latitude: lat, longitude: lng }, b.polygon),
  );
};

export const getUserLocationBuildingId = (
  buildings: Building[],
  userLocation: { latitude: number; longitude: number } | null,
): string | null => {
  if (!userLocation) return null;

  const b = getBuildingContainingPoint(
    buildings,
    userLocation.latitude,
    userLocation.longitude,
  );

  return b?.id ?? null;
};

export const makeUserLocationBuilding = (
  lat: number,
  lng: number,
  campus: "SGW" | "LOY",
): Building => ({
  id: "USER_LOCATION",
  campus,
  code: "",
  name: "Your location",
  address: "",
  latitude: lat,
  longitude: lng,
  aliases: [],
  polygon: [],
  zoomCategory: 2,
});
