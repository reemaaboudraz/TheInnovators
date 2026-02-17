import {
  SGW_REGION,
  LOY_REGION,
  INITIAL_REGION,
} from "@/components/campus/helper_methods/campusMap.constants";

describe("campusMap.constants", () => {
  it("SGW_REGION has correct coordinates", () => {
    expect(SGW_REGION).toEqual({
      latitude: 45.4973,
      longitude: -73.5794,
      latitudeDelta: 0.006,
      longitudeDelta: 0.006,
    });
  });

  it("LOY_REGION has correct coordinates", () => {
    expect(LOY_REGION).toEqual({
      latitude: 45.457984,
      longitude: -73.639834,
      latitudeDelta: 0.006,
      longitudeDelta: 0.006,
    });
  });

  it("INITIAL_REGION references SGW_REGION", () => {
    expect(INITIAL_REGION).toBe(SGW_REGION);
  });
});
