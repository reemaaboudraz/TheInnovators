// components/campus/__test__/campusMap.labels.test.ts
import type { Region } from "react-native-maps";
import type { Building } from "@/components/Buildings/types";
import { shouldShowBuildingLabel } from "@/components/campus/helper_methods/campusMap.labels";

function makeRegion(latitudeDelta: number, longitudeDelta: number): Region {
  return {
    latitude: 45.5,
    longitude: -73.6,
    latitudeDelta,
    longitudeDelta,
  };
}

function makeBuilding(zoomCategory: 1 | 2 | 3): Building {
  return {
    id: `b-${zoomCategory}`,
    code: `C${zoomCategory}`,
    name: `Building ${zoomCategory}`,
    address: "Test address",
    latitude: 45.5,
    longitude: -73.6,
    campus: "SGW",
    zoomCategory,
    aliases: [],
    polygon: [],
  } as Building;
}

describe("shouldShowBuildingLabel", () => {
  it("returns true when region is null", () => {
    const b = makeBuilding(3);
    expect(shouldShowBuildingLabel(b, null)).toBe(true);
  });

  it("hides everything when maxDelta >= 0.06 (far zoom out)", () => {
    const r = makeRegion(0.06, 0.01);
    expect(shouldShowBuildingLabel(makeBuilding(1), r)).toBe(false);
    expect(shouldShowBuildingLabel(makeBuilding(2), r)).toBe(false);
    expect(shouldShowBuildingLabel(makeBuilding(3), r)).toBe(false);
  });

  it("uses the max of latitudeDelta/longitudeDelta as the zoom indicator", () => {
    const b1 = makeBuilding(1);

    // maxDelta = 0.055 => not far-zoom-out cutoff, but fails z=1 threshold (<= 0.05)
    const r = makeRegion(0.01, 0.055);
    expect(shouldShowBuildingLabel(b1, r)).toBe(false);
  });

  it("shows big buildings (z=1) when maxDelta <= 0.05", () => {
    expect(
      shouldShowBuildingLabel(makeBuilding(1), makeRegion(0.05, 0.01)),
    ).toBe(true);
    expect(
      shouldShowBuildingLabel(makeBuilding(1), makeRegion(0.051, 0.01)),
    ).toBe(false);
  });

  it("shows medium buildings (z=2) when maxDelta <= 0.02", () => {
    expect(
      shouldShowBuildingLabel(makeBuilding(2), makeRegion(0.02, 0.01)),
    ).toBe(true);
    expect(
      shouldShowBuildingLabel(makeBuilding(2), makeRegion(0.021, 0.01)),
    ).toBe(false);
  });

  it("shows small buildings (z=3) when maxDelta <= 0.003", () => {
    expect(
      shouldShowBuildingLabel(makeBuilding(3), makeRegion(0.003, 0.001)),
    ).toBe(true);

    expect(
      shouldShowBuildingLabel(makeBuilding(3), makeRegion(0.004, 0.001)),
    ).toBe(false);
  });

  it("defaults zoomCategory to 2 when missing", () => {
    const b = makeBuilding(2) as any;
    delete b.zoomCategory;

    expect(shouldShowBuildingLabel(b as Building, makeRegion(0.02, 0.01))).toBe(
      true,
    );
    expect(shouldShowBuildingLabel(b as Building, makeRegion(0.03, 0.01))).toBe(
      false,
    );
  });
});
