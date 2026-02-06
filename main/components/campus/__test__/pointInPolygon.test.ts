import { isPointInPolygon } from "../pointInPolygon";
import type { LatLng } from "@/components/Buildings/types";

describe("isPointInPolygon", () => {
  // Simple square polygon for testing
  const squarePolygon: LatLng[] = [
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 10 },
    { latitude: 10, longitude: 10 },
    { latitude: 10, longitude: 0 },
  ];

  it("returns true when point is inside the polygon", () => {
    const point: LatLng = { latitude: 5, longitude: 5 };
    expect(isPointInPolygon(point, squarePolygon)).toBe(true);
  });

  it("returns true when point is near the center", () => {
    const point: LatLng = { latitude: 3, longitude: 7 };
    expect(isPointInPolygon(point, squarePolygon)).toBe(true);
  });

  it("returns false when point is outside the polygon", () => {
    const point: LatLng = { latitude: 15, longitude: 15 };
    expect(isPointInPolygon(point, squarePolygon)).toBe(false);
  });

  it("returns false when point is to the left of the polygon", () => {
    const point: LatLng = { latitude: 5, longitude: -5 };
    expect(isPointInPolygon(point, squarePolygon)).toBe(false);
  });

  it("returns false when point is above the polygon", () => {
    const point: LatLng = { latitude: 15, longitude: 5 };
    expect(isPointInPolygon(point, squarePolygon)).toBe(false);
  });

  it("returns false for null polygon", () => {
    const point: LatLng = { latitude: 5, longitude: 5 };
    expect(isPointInPolygon(point, null as unknown as LatLng[])).toBe(false);
  });

  it("returns false for undefined polygon", () => {
    const point: LatLng = { latitude: 5, longitude: 5 };
    expect(isPointInPolygon(point, undefined as unknown as LatLng[])).toBe(
      false,
    );
  });

  it("returns false for polygon with less than 3 vertices", () => {
    const point: LatLng = { latitude: 5, longitude: 5 };
    const twoPointPolygon: LatLng[] = [
      { latitude: 0, longitude: 0 },
      { latitude: 10, longitude: 10 },
    ];
    expect(isPointInPolygon(point, twoPointPolygon)).toBe(false);
  });

  it("returns false for empty polygon", () => {
    const point: LatLng = { latitude: 5, longitude: 5 };
    expect(isPointInPolygon(point, [])).toBe(false);
  });

  describe("with complex polygon shapes", () => {
    // L-shaped polygon
    const lShapedPolygon: LatLng[] = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 5 },
      { latitude: 5, longitude: 5 },
      { latitude: 5, longitude: 10 },
      { latitude: 10, longitude: 10 },
      { latitude: 10, longitude: 0 },
    ];

    it("returns true for point inside L-shaped polygon", () => {
      const point: LatLng = { latitude: 2, longitude: 2 };
      expect(isPointInPolygon(point, lShapedPolygon)).toBe(true);
    });

    it("returns true for point in the bottom arm of L", () => {
      const point: LatLng = { latitude: 7, longitude: 7 };
      expect(isPointInPolygon(point, lShapedPolygon)).toBe(true);
    });

    it("returns false for point in the notch of L-shaped polygon", () => {
      const point: LatLng = { latitude: 2, longitude: 7 };
      expect(isPointInPolygon(point, lShapedPolygon)).toBe(false);
    });
  });

  describe("with real building coordinates", () => {
    // Approximate Hall Building polygon (SGW campus)
    const hallBuildingPolygon: LatLng[] = [
      { latitude: 45.4972, longitude: -73.5791 },
      { latitude: 45.4972, longitude: -73.5785 },
      { latitude: 45.4968, longitude: -73.5785 },
      { latitude: 45.4968, longitude: -73.5791 },
    ];

    it("returns true for point inside Hall Building", () => {
      const point: LatLng = { latitude: 45.497, longitude: -73.5788 };
      expect(isPointInPolygon(point, hallBuildingPolygon)).toBe(true);
    });

    it("returns false for point outside Hall Building", () => {
      const point: LatLng = { latitude: 45.498, longitude: -73.58 };
      expect(isPointInPolygon(point, hallBuildingPolygon)).toBe(false);
    });
  });
});
