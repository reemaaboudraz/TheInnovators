import { describe, it, expect } from "@jest/globals";
import { LOYOLA_BUILDINGS } from "@/components/Buildings/Loyola/LoyolaBuildings";

describe("Loyola buildings dataset", () => {
  it("includes at least one valid Loyola campus building entry", () => {
    expect(LOYOLA_BUILDINGS.length).toBeGreaterThan(0);

    for (const building of LOYOLA_BUILDINGS) {
      expect(building.campus).toBe("LOY");
      expect(building.id).toBeTruthy();
      expect(building.code).toBeTruthy();
      expect(building.name).toBeTruthy();
      expect(building.address).toBeTruthy();
      expect(typeof building.latitude).toBe("number");
      expect(typeof building.longitude).toBe("number");
    }
  });

  it("ensures that all Loyola building codes are unique", () => {
    const buildingCodes = LOYOLA_BUILDINGS.map((building) => building.code);

    expect(new Set(buildingCodes).size).toBe(buildingCodes.length);
  });
});
