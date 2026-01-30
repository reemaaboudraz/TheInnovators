import { describe, it, expect } from "@jest/globals";
import { SGW_BUILDINGS } from "@/components/Buildings/SGWBuildings";

describe("SGW_BUILDINGS data", () => {
  it("contains valid SGW buildings", () => {
    expect(SGW_BUILDINGS.length).toBeGreaterThan(0);

    for (const b of SGW_BUILDINGS) {
      expect(b.campus).toBe("SGW");
      expect(b.id).toBeTruthy();
      expect(b.code).toBeTruthy();
      expect(b.name).toBeTruthy();
      expect(b.address).toBeTruthy();
      expect(typeof b.latitude).toBe("number");
      expect(typeof b.longitude).toBe("number");
    }
  });

  it("has unique building codes", () => {
    const codes = SGW_BUILDINGS.map((b) => b.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
