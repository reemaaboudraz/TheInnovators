export type Campus = "SGW" | "LOY";

export type Building = {
  id: string;
  campus: Campus;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  aliases: string[];

  // use it later for coloring
};
