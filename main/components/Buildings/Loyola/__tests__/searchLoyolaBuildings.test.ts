import { describe, it, expect } from "@jest/globals";
import { searchLoyolaBuildings } from "@/components/Buildings/search";

describe("searchLoyolaBuildings()", () => {
  it("returns empty for empty/whitespace query", () => {
    expect(searchLoyolaBuildings("")).toEqual([]);
    expect(searchLoyolaBuildings("   ")).toEqual([]);
  });

  it("respects the limit", () => {
    const res = searchLoyolaBuildings("a", 2);
    expect(res.length).toBeLessThanOrEqual(2);
  });

  it("all returned results actually match the query in code/name/address/aliases", () => {
    const q = "a";
    const res = searchLoyolaBuildings(q, 10);

    for (const b of res) {
      const matches =
        b.code.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.aliases.some((a) => a.toLowerCase().includes(q));

      expect(matches).toBe(true);
    }
  });
});
