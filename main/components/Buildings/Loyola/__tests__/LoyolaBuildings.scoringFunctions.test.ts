import { describe, it, expect } from "@jest/globals";
import {
  searchLoyolaBuildings,
  getLoyolaBuildingByCode,
} from "@/components/Buildings/Loyola/LoyolaBuildings";

describe("Loyola building search scoring", () => {
  it("returns an empty list when the query is empty or only spaces", () => {
    expect(searchLoyolaBuildings("")).toEqual([]);
    expect(searchLoyolaBuildings("   ")).toEqual([]);
  });

  it("prioritizes an exact building code match (expects AD at index 0)", () => {
    const searchResults = searchLoyolaBuildings("AD", 10);
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].code).toBe("AD");
  });

  it("supports prefix matching on the building name (admin should include AD)", () => {
    const searchResults = searchLoyolaBuildings("admin", 10);
    const containsAdminBuilding = searchResults.some(
      (building) => building.code === "AD",
    );

    expect(containsAdminBuilding).toBe(true);
  });

  it("supports substring matching across searchable fields (hingston should include HA)", () => {
    const searchResults = searchLoyolaBuildings("hingston", 10);
    const returnedCodes = searchResults.map((building) => building.code);

    const includesHingstonHall = returnedCodes.some(
      (buildingCode) => buildingCode === "HA",
    );

    expect(includesHingstonHall).toBe(true);
  });

  it("enforces the maximum number of returned results", () => {
    const searchResults = searchLoyolaBuildings("a", 1);
    expect(searchResults.length).toBe(1);
  });

  it("finds a building by code (case-insensitive) and returns undefined if absent", () => {
    expect(getLoyolaBuildingByCode("ad")?.code).toBe("AD");
    expect(getLoyolaBuildingByCode("NOTREAL")).toBeUndefined();
  });
});
