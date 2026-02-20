import { bearingDegrees, distanceMeters } from "@/components/campus/helper_methods/geo";
import type { LatLng } from "@/components/campus/helper_methods/googleDirections";

describe("geo.ts", () => {
  const p = (latitude: number, longitude: number): LatLng =>
    ({ latitude, longitude }) as LatLng;

  describe("distanceMeters (Haversine)", () => {
    it("returns 0 for identical points", () => {
      const a = p(45.0, -73.0);
      const d = distanceMeters(a, a);
      expect(d).toBeCloseTo(0, 6);
    });

    it("is symmetric: d(a,b) == d(b,a)", () => {
      const a = p(45.0, -73.0);
      const b = p(45.0005, -73.0005);

      const dab = distanceMeters(a, b);
      const dba = distanceMeters(b, a);

      expect(dab).toBeGreaterThan(0);
      expect(dab).toBeCloseTo(dba, 10);
    });

    it("returns a small distance for nearby points", () => {
      const a = p(45.0, -73.0);
      const b = p(45.0001, -73.0001);

      const d = distanceMeters(a, b);

      expect(d).toBeGreaterThan(0);
      expect(d).toBeLessThan(30_000); // definitely not huge; keeps test robust
    });

    it("returns a large distance for far points (Montreal -> Toronto)", () => {
      const montreal = p(45.5017, -73.5673);
      const toronto = p(43.6532, -79.3832);

      const d = distanceMeters(montreal, toronto);

      // Real value is roughly ~500 km; keep bounds loose to avoid flakiness
      expect(d).toBeGreaterThan(350_000);
      expect(d).toBeLessThan(700_000);
    });
  });

  describe("bearingDegrees", () => {
    it("returns 0 when going due north", () => {
      const a = p(0, 0);
      const b = p(1, 0);

      const brng = bearingDegrees(a, b);

      expect(brng).toBeCloseTo(0, 6);
    });

    it("returns ~90 when going due east", () => {
      const a = p(0, 0);
      const b = p(0, 1);

      const brng = bearingDegrees(a, b);

      expect(brng).toBeCloseTo(90, 6);
    });

    it("returns ~180 when going due south", () => {
      const a = p(1, 0);
      const b = p(0, 0);

      const brng = bearingDegrees(a, b);

      expect(brng).toBeCloseTo(180, 6);
    });

    it("returns a value in [0, 360)", () => {
      const a = p(45.0, -73.0);
      const b = p(44.9, -73.2);

      const brng = bearingDegrees(a, b);

      expect(brng).toBeGreaterThanOrEqual(0);
      expect(brng).toBeLessThan(360);
    });
  });
});
