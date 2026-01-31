import { describe, it, expect } from "@jest/globals";
import { getLoyolaBuildingByCode } from "@/components/Buildings/Loyola/LoyolaBuildings";

describe("getLoyolaBuildingByCode()", () => {
  it("finds a building by code regardless of case", () => {
    expect(getLoyolaBuildingByCode("ad")?.code).toBe("AD");
    expect(getLoyolaBuildingByCode("AD")?.code).toBe("AD");
  });

  it("handles extra whitespace around the code", () => {
    expect(getLoyolaBuildingByCode("  ad  ")?.code).toBe("AD");
  });

  it("returns undefined when no building exists for the code", () => {
    expect(getLoyolaBuildingByCode("NOPE123")).toBeUndefined();
  });
});
