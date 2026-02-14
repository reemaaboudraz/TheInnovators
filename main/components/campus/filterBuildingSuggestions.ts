import type { Building } from "@/components/Buildings/types";

export function filterBuildingSuggestions(
  query: string,
  buildings: Building[],
  limit = 6,
): Building[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return buildings
    .filter((b) => {
      const code = b.code?.toLowerCase() ?? "";
      const name = b.name?.toLowerCase() ?? "";
      const address = b.address?.toLowerCase() ?? "";
      const aliases = b.aliases ?? [];
      return (
        code.includes(q) ||
        name.includes(q) ||
        address.includes(q) ||
        aliases.some((a) => a.toLowerCase().includes(q))
      );
    })
    .slice(0, limit);
}
