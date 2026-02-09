export type Campus = "SGW" | "LOY";

export type LatLng = {
  latitude: number;
  longitude: number;
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
  zoomCategory: 1 | 2 | 3; // 1=big, 2=medium, 3=small
};
