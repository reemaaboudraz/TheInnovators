import { SGW_BUILDINGS } from "./SGW/SGWBuildings";
import { Loyola_BUILDINGS } from "./Loyola/LoyolaBuildings";
import type { Building } from "./types";

function searchBuildings(
  buildings: Building[],
  query: string,
  limit: number,
): Building[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();

  return buildings
    .filter(
      (b) =>
        b.code.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.aliases.some((a) => a.toLowerCase().includes(q)),
    )
    .slice(0, limit);
}

export function searchSGWBuildings(query: string, limit = 6): Building[] {
  return searchBuildings(SGW_BUILDINGS, query, limit);
}

export function searchLoyolaBuildings(query: string, limit = 6): Building[] {
  return searchBuildings(Loyola_BUILDINGS, query, limit);
}
