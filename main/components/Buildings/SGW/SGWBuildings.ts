import { Building } from "@/components/Buildings/types";
import rawSGWBuildings from "@/components/Buildings/data/SGW_data.json";

export const SGW_BUILDINGS = rawSGWBuildings as Building[];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD") // separate accent marks
    .replaceAll(/[\u0300-\u036f]/g, "") // remove accent marks (works on Hermes)
    .replaceAll(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Returns buildings whose code/name/address/aliases match the query (case-insensitive).
 * Example queries: "H", "hall", "john molson", "mb", "grey nuns"
 */
export function searchSGWBuildings(query: string, limit = 10): Building[] {
  const q = normalize(query);
  if (!q) return [];

  return SGW_BUILDINGS.map((b) => {
    const haystack = normalize(
      [b.code, b.name, b.address, ...b.aliases].join(" "),
    );
    // simple scoring: exact code > name prefix > contains
    let score = 0;
    if (normalize(b.code) === q) score += 100;
    if (normalize(b.name).startsWith(q)) score += 50;
    if (haystack.includes(q)) score += 10;
    return { b, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.b);
}

export function getSGWBuildingByCode(code: string): Building | undefined {
  const c = normalize(code);
  return SGW_BUILDINGS.find((b) => normalize(b.code) === c);
}
