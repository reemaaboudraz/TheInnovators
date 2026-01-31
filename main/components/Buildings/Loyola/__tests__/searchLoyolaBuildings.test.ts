import { describe, it, expect } from "@jest/globals";
import { searchLoyolaBuildings } from "@/components/Buildings/search";

describe("searchLoyolaBuildings()", () => {
  it("returns no results when the search input is empty or blank", () => {
    expect(searchLoyolaBuildings("")).toEqual([]);
    expect(searchLoyolaBuildings("   ")).toEqual([]);
  });

  it("limits the number of buildings returned based on the provided max value", () => {
    const searchResults = searchLoyolaBuildings("a", 2);
    expect(searchResults.length).toBeLessThanOrEqual(2);
  });

  it("ensures each returned building contains the search term in at least one searchable field", () => {
    const searchTerm = "a";
    const searchResults = searchLoyolaBuildings(searchTerm, 10);

    for (const building of searchResults) {
      const hasMatch =
        building.code.toLowerCase().includes(searchTerm) ||
        building.name.toLowerCase().includes(searchTerm) ||
        building.address.toLowerCase().includes(searchTerm) ||
        building.aliases.some((alias) =>
          alias.toLowerCase().includes(searchTerm),
        );

      expect(hasMatch).toBe(true);
    }
  });
});
