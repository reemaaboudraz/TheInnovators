import { describe, it, expect } from "@jest/globals";
import {
  searchSGWBuildings,
  getSGWBuildingByCode,
} from "@/components/Buildings/SGW/SGWBuildings";

describe("SGWBuildings scoring functions", () => {
  it("returns [] for empty query", () => {
    expect(searchSGWBuildings("")).toEqual([]);
    expect(searchSGWBuildings("   ")).toEqual([]);
  });

  it("exact code match returns building first (H)", () => {
    const res = searchSGWBuildings("H", 10);
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].code).toBe("H");
  });

  it("name prefix match works (john -> MB)", () => {
    const res = searchSGWBuildings("john", 10);
    expect(res.some((b) => b.code === "MB")).toBe(true);
  });

  it("contains match works (grey nuns -> GA/GN)", () => {
    const res = searchSGWBuildings("grey nuns", 10);
    const codes = res.map((b) => b.code);
    expect(codes).toEqual(expect.arrayContaining(["GA", "GN"]));
  });

  it("respects limit", () => {
    const res = searchSGWBuildings("a", 1);
    expect(res.length).toBe(1);
  });

  it("getSGWBuildingByCode works + undefined when missing", () => {
    expect(getSGWBuildingByCode("h")?.code).toBe("H");
    expect(getSGWBuildingByCode("NOTREAL")).toBeUndefined();
  });
});
