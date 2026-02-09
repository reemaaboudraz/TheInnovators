export type Campus = "SGW" | "LOY";

export type LatLng = {
  latitude: number;
  longitude: number;
};

// Data-driven popup content (kept in the campus JSON files).
export type BuildingDetailIconKey =
  | "accessibleEntrance"
  | "accessibleElevator"
  | "metro"
  | "connectedBuildings"
  | "entry"
  | "printer"
  | "shuttle";

export type BuildingDetailIconItem = {
  icon: BuildingDetailIconKey;
  title: string;
  description: string;
};

export type BuildingDetails = {
  accessibility?: BuildingDetailIconItem[];
  metro?: { title: string; description: string };
  connectivity?: { title: string; description: string };
  entries: { title: string; description: string }[];
  otherServices?: BuildingDetailIconItem[];
  overview: string[];
  venues?: string[];
  departments?: string[];
  services?: string[];
};

export type Building = {
  id: string;
  campus: Campus;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  aliases: string[];
  polygon: LatLng[];

  // extended building info shown in the popup.
  details: BuildingDetails;
  zoomCategory: 1 | 2 | 3; // 1=big, 2=medium, 3=small
};
