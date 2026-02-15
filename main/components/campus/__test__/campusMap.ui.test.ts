import { computeFloatingBottom } from "@/components/campus/helper_methods/campusMap.ui";

describe("campusMap.ui - computeFloatingBottom", () => {
  it("returns base when no selection exists", () => {
    expect(computeFloatingBottom(false, -1)).toBe(120);
    expect(computeFloatingBottom(false, 0)).toBe(120);
    expect(computeFloatingBottom(false, 1)).toBe(120);
  });

  it("returns base when popupIndex is -1 even if selected exists", () => {
    expect(computeFloatingBottom(true, -1)).toBe(120);
  });

  it("returns 280 when popupIndex is 0 and selection exists", () => {
    expect(computeFloatingBottom(true, 0)).toBe(280);
  });

  it("returns 440 when popupIndex is > 0 and selection exists", () => {
    expect(computeFloatingBottom(true, 1)).toBe(440);
    expect(computeFloatingBottom(true, 2)).toBe(440);
  });
});
