import { describe, it, expect } from "@jest/globals";
import { searchLoyolaBuildings } from "@/components/Buildings/Loyola/LoyolaBuildings";

describe("searchLoyolaBuildings() scoring", () => {
  it("returns no results when nothing matches", () => {
    const searchResults = searchLoyolaBuildings("zzzz-not-a-real-match", 10);
    expect(searchResults).toEqual([]);
  });

  it("exact code match should rank first", () => {
    const searchResults = searchLoyolaBuildings("AD", 10);
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].code).toBe("AD");
  });

  it("is case-insensitive for search query", () => {
    const upper = searchLoyolaBuildings("AD", 10)[0]?.code;
    const lower = searchLoyolaBuildings("ad", 10)[0]?.code;
    expect(lower).toBe(upper);
  });

  it("name prefix match returns expected building somewhere in results", () => {
    const searchResults = searchLoyolaBuildings("admin", 10);
    expect(searchResults.some((b) => b.code === "AD")).toBe(true);
  });

  it("query with extra spaces still works", () => {
    const searchResults = searchLoyolaBuildings("   ad   ", 10);
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].code).toBe("AD");
  });
});
