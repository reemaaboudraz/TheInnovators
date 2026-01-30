import { SGW_BUILDINGS } from "./SGWBuildings";
import type { Building } from "./types";

export function searchSGWBuildings(query: string, limit = 6): Building[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();

  return SGW_BUILDINGS.filter(
    (b) =>
      b.code.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q) ||
      b.aliases.some((a) => a.toLowerCase().includes(q)),
  ).slice(0, limit);
}
