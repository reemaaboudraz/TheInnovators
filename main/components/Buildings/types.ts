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


    // use it later for coloring
};
