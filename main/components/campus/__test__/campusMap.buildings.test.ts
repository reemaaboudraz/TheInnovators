/* eslint-disable import/first */
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockIsPointInPolygon = jest.fn();

jest.mock("@/components/campus/helper_methods/pointInPolygon", () => ({
  isPointInPolygon: (...args: any[]) => mockIsPointInPolygon(...args),
}));

import {
  buildAllBuildings,
  getBuildingContainingPoint,
  getUserLocationBuildingId,
  makeUserLocationBuilding,
} from "@/components/campus/helper_methods/campusMap.buildings";

describe("campusMap.buildings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const B1: any = {
    id: "H",
    campus: "SGW",
    code: "H",
    name: "Hall",
    polygon: [{ latitude: 1, longitude: 1 }],
  };

  const B2: any = {
    id: "MB",
    campus: "SGW",
    code: "MB",
    name: "Molson",
    polygon: [{ latitude: 2, longitude: 2 }],
  };

  it("buildAllBuildings merges SGW + LOY arrays", () => {
    const sgw = [B1];
    const loy = [B2];
    expect(buildAllBuildings(sgw, loy)).toEqual([B1, B2]);
  });

  it("getBuildingContainingPoint returns first building whose polygon contains the point", () => {
    // @ts-ignore
    mockIsPointInPolygon.mockImplementation((_pt: any, polygon: any[]) => {
      return polygon === B2.polygon;
    });

    const res = getBuildingContainingPoint([B1, B2], 10, 20);
    expect(res).toBe(B2);

    expect(mockIsPointInPolygon).toHaveBeenCalled();
  });

  it("getBuildingContainingPoint skips buildings without polygon length", () => {
    const noPoly: any = { id: "X", polygon: [] };
    mockIsPointInPolygon.mockReturnValue(true);

    const res = getBuildingContainingPoint([noPoly, B1], 10, 20);
    expect(res).toBe(B1);

    // should only be called for B1 (since noPoly.polygon is empty)
    expect(mockIsPointInPolygon).toHaveBeenCalledTimes(1);
  });

  it("getBuildingContainingPoint returns undefined if no building matches", () => {
    mockIsPointInPolygon.mockReturnValue(false);
    expect(getBuildingContainingPoint([B1, B2], 10, 20)).toBeUndefined();
  });

  it("getUserLocationBuildingId returns null when userLocation is null", () => {
    expect(getUserLocationBuildingId([B1], null)).toBeNull();
  });

  it("getUserLocationBuildingId returns building id when user is inside a building", () => {
    mockIsPointInPolygon.mockReturnValue(true);
    expect(getUserLocationBuildingId([B1], { latitude: 1, longitude: 2 })).toBe(
      "H",
    );
  });

  it("getUserLocationBuildingId returns null when user is not inside any building", () => {
    mockIsPointInPolygon.mockReturnValue(false);
    expect(
      getUserLocationBuildingId([B1], { latitude: 1, longitude: 2 }),
    ).toBeNull();
  });

  it("makeUserLocationBuilding returns a Building-like object", () => {
    const b: any = makeUserLocationBuilding(45.5, -73.6, "SGW");

    expect(b).toMatchObject({
      id: "USER_LOCATION",
      campus: "SGW",
      name: "Your location",
      latitude: 45.5,
      longitude: -73.6,
      polygon: [],
      zoomCategory: 2,
    });
  });
});
