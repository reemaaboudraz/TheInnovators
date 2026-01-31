import { describe, it, expect } from "@jest/globals";
import {
  searchLoyolaBuildings,
  getLoyolaBuildingByCode,
} from "@/components/Buildings/Loyola/LoyolaBuildings";

describe("LoyolaBuildings scoring functions", () => {
  it("returns [] for empty query", () => {
    expect(searchLoyolaBuildings("")).toEqual([]);
    expect(searchLoyolaBuildings("   ")).toEqual([]);
  });

  it("exact code match returns building first (AD)", () => {
    const res = searchLoyolaBuildings("AD", 10);
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].code).toBe("AD");
  });

  it("name prefix match works (admin -> AD)", () => {
    const res = searchLoyolaBuildings("admin", 10);
    expect(res.some((b) => b.code === "AD")).toBe(true);
  });

  it("contains match works (hingston -> HA)", () => {
    const res = searchLoyolaBuildings("hingston", 10);
    const codes = res.map((b) => b.code);

    expect(codes.some((c) => ["HA"].includes(c))).toBe(true);
  });

  it("respects limit", () => {
    const res = searchLoyolaBuildings("a", 1);
    expect(res.length).toBe(1);
  });

  it("getLoyolaBuildingByCode works + undefined when missing", () => {
    expect(getLoyolaBuildingByCode("ad")?.code).toBe("AD");
    expect(getLoyolaBuildingByCode("NOTREAL")).toBeUndefined();
  });
});
