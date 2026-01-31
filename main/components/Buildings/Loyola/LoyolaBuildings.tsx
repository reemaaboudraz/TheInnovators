import { Building } from "@/components/Buildings/types";
import rawLoyolaBuildingData from "@/components/Buildings/data/Loyola_data.json";

export const LOYOLA_BUILDINGS = rawLoyolaBuildingData as Building[];

export const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD") // separate accent marks
    .replaceAll(/[\u0300-\u036f]/g, "") // remove accent marks (Hermes-safe)
    .replaceAll(/[^a-z0-9]+/g, " ")
    .trim();

export function searchLoyolaBuildings(
  searchQuery: string,
  resultLimit = 10,
): Building[] {
  const normalizedQuery = normalizeText(searchQuery);
  if (!normalizedQuery) return [];

  return LOYOLA_BUILDINGS.map((building) => {
    const searchableText = normalizeText(
      [
        building.code,
        building.name,
        building.address,
        ...building.aliases,
      ].join(" "),
    );

    // scoring priority: exact code > name prefix > contains
    let matchScore = 0;

    if (normalizeText(building.code) === normalizedQuery) matchScore += 100;
    if (normalizeText(building.name).startsWith(normalizedQuery))
      matchScore += 50;
    if (searchableText.includes(normalizedQuery)) matchScore += 10;

    return { building, matchScore };
  })
    .filter((result) => result.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, resultLimit)
    .map((result) => result.building);
}

export function getLoyolaBuildingByCode(code: string): Building | undefined {
  const normalizedCode = normalizeText(code);

  return LOYOLA_BUILDINGS.find(
    (building) => normalizeText(building.code) === normalizedCode,
  );
}
