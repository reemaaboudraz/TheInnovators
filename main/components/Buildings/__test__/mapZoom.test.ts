import { describe, it, expect } from "@jest/globals";
import { paddingForZoomCategory, regionFromPolygon } from "../mapZoom";

describe("mapZoom", () => {
    describe("paddingForZoomCategory", () => {
        it("returns 1.9 for category 1", () => {
            expect(paddingForZoomCategory(1)).toBe(1.9);
        });

        it("returns 1.35 for category 2", () => {
            expect(paddingForZoomCategory(2)).toBe(1.35);
        });

        it("returns 1.15 for category 3", () => {
            expect(paddingForZoomCategory(3)).toBe(1.15);
        });

        it("defaults to category 1 when no argument is provided", () => {
            expect(paddingForZoomCategory()).toBe(1.9);
        });
    });

    describe("regionFromPolygon", () => {
        it("computes center and deltas from polygon bounds (with padding)", () => {
            const poly = [
                { latitude: 10, longitude: 20 },
                { latitude: 12, longitude: 23 },
                { latitude: 11, longitude: 21 },
            ];

            const region = regionFromPolygon(poly, 2.0);

            // Center is avg of min/max
            expect(region.latitude).toBe((10 + 12) / 2); // 11
            expect(region.longitude).toBe((20 + 23) / 2); // 21.5

            // Delta = (range * paddingFactor), clamped by minDelta
            expect(region.latitudeDelta).toBe((12 - 10) * 2.0); // 4
            expect(region.longitudeDelta).toBe((23 - 20) * 2.0); // 6
        });

        it("clamps deltas to minDelta when polygon is extremely small", () => {
            const poly = [
                { latitude: 1, longitude: 1 },
                { latitude: 1.00001, longitude: 1.00001 },
            ];

            const region = regionFromPolygon(poly, 1.35, 0.0006);

            expect(region.latitudeDelta).toBeGreaterThanOrEqual(0.0006);
            expect(region.longitudeDelta).toBeGreaterThanOrEqual(0.0006);
        });

        it("uses default paddingFactor and minDelta when not provided", () => {
            const poly = [
                { latitude: 0, longitude: 0 },
                { latitude: 0.001, longitude: 0.002 },
            ];

            const region = regionFromPolygon(poly);

            // With default paddingFactor=1.35:
            // latDelta = 0.001 * 1.35 = 0.00135
            // lngDelta = 0.002 * 1.35 = 0.0027
            expect(region.latitude).toBe(0.0005);
            expect(region.longitude).toBe(0.001);
            expect(region.latitudeDelta).toBeCloseTo(0.00135, 8);
            expect(region.longitudeDelta).toBeCloseTo(0.0027, 8);
        });
    });
});
