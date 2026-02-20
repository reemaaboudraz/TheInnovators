import type { DirectionRoute } from "@/components/campus/helper_methods/googleDirections";

import {
  decodePolyline,
  fetchDirections,
  pickFastestRoute,
} from "@/components/campus/helper_methods/googleDirections";

// Default mock: expo-constants has a valid key
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        googleMapsApiKey: "test-key",
      },
    },
  },
}));

describe("googleDirections", () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("decodePolyline", () => {
    it("returns [] for empty string", () => {
      expect(decodePolyline("")).toEqual([]);
    });

    it("decodes a known Google polyline example correctly", () => {
      // Classic example polyline from Google docs
      const encoded = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
      const coords = decodePolyline(encoded);

      expect(coords).toHaveLength(3);

      // Use toBeCloseTo because of floating point
      expect(coords[0].latitude).toBeCloseTo(38.5, 5);
      expect(coords[0].longitude).toBeCloseTo(-120.2, 5);

      expect(coords[1].latitude).toBeCloseTo(40.7, 5);
      expect(coords[1].longitude).toBeCloseTo(-120.95, 5);

      expect(coords[2].latitude).toBeCloseTo(43.252, 5);
      expect(coords[2].longitude).toBeCloseTo(-126.453, 5);
    });
  });

  describe("pickFastestRoute", () => {
    it("returns null for empty list", () => {
      expect(pickFastestRoute([])).toBeNull();
    });

    it("returns the first route when routes are pre-sorted by durationSec", () => {
      const routes: DirectionRoute[] = [
        {
          summary: "B",
          polyline: "def",
          durationSec: 200,
          durationText: "3 mins",
          distanceMeters: 900,
          distanceText: "0.9 km",
        },
        {
          summary: "A",
          polyline: "abc",
          durationSec: 500,
          durationText: "8 mins",
          distanceMeters: 1200,
          distanceText: "1.2 km",
        },
      ];

      const fastest = pickFastestRoute(routes);
      expect(fastest?.summary).toBe("B");
      expect(fastest?.durationSec).toBe(200);
    });
  });

  describe("fetchDirections", () => {
    it("maps Google Directions routes into DirectionRoute[] and filters missing polylines", async () => {
      (global as any).fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: "OK",
          routes: [
            {
              summary: "Route A",
              overview_polyline: { points: "polyA" },
              legs: [
                {
                  duration: { value: 120, text: "2 mins" },
                  distance: { value: 300, text: "0.3 km" },
                },
              ],
            },
            {
              summary: "Route B",
              overview_polyline: { points: "" }, // should be filtered out
              legs: [
                {
                  duration: { value: 240, text: "4 mins" },
                  distance: { value: 800, text: "0.8 km" },
                },
              ],
            },
          ],
        }),
      });

      const res = await fetchDirections({
        origin: { latitude: 45.0, longitude: -73.0 },
        destination: { latitude: 45.1, longitude: -73.1 },
        mode: "walking",
      });

      // Only Route A remains
      expect(res).toHaveLength(1);
      expect(res[0]).toMatchObject({
        summary: "Route A",
        polyline: "polyA",
        durationSec: 120,
        durationText: "2 mins",
        distanceMeters: 300,
        distanceText: "0.3 km",
      });
      expect(res[0].transitLines).toBeUndefined();

      // Also confirm fetch was called with a URL containing key pieces
      const calledUrl = (global as any).fetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("mode=walking");
      expect(calledUrl).toContain("alternatives=true");
      expect(calledUrl).toContain("key=test-key");
    });

    it("extracts transitLines for transit mode (trims, prefers short_name, uses first agency, dedupes, skips missing line)", async () => {
      (global as any).fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: "OK",
          routes: [
            {
              summary: "Transit Route",
              overview_polyline: { points: "polyT" },
              legs: [
                {
                  duration: { value: 600, text: "10 mins" },
                  distance: { value: 2000, text: "2.0 km" },
                  steps: [
                    // Non-transit step should be ignored
                    { travel_mode: "WALKING" },

                    // Transit step with line.short_name (trimmed), headsign trimmed, agency trimmed
                    {
                      travel_mode: "TRANSIT",
                      transit_details: {
                        headsign: "  Ouest  ",
                        line: {
                          short_name: " 51 ",
                          name: "ShouldNotUseThis",
                          vehicle: { type: "BUS" },
                          agencies: [
                            { name: " Société de transport de Montréal " },
                          ],
                        },
                      },
                    },

                    // Duplicate of the same transit line should be deduped
                    {
                      travel_mode: "TRANSIT",
                      transit_details: {
                        headsign: "Ouest",
                        line: {
                          short_name: "51",
                          vehicle: { type: "BUS" },
                          agencies: [
                            { name: "Société de transport de Montréal" },
                          ],
                        },
                      },
                    },

                    // Transit step missing line should be skipped (no throw)
                    {
                      travel_mode: "TRANSIT",
                      transit_details: {
                        headsign: "Nord",
                        // line missing
                      },
                    },

                    // Different headsign => different key => should appear as another line
                    {
                      travel_mode: "TRANSIT",
                      transit_details: {
                        headsign: " Est ",
                        line: {
                          // no short_name => fallback to name
                          name: "  Orange Line  ",
                          vehicle: { type: "SUBWAY" },
                          agencies: [{ name: " STM " }, { name: "Other" }],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        }),
      });

      const res = await fetchDirections({
        origin: { latitude: 45.0, longitude: -73.0 },
        destination: { latitude: 45.1, longitude: -73.1 },
        mode: "transit",
      });

      expect(res).toHaveLength(1);

      // Core route fields still correct
      expect(res[0]).toMatchObject({
        summary: "Transit Route",
        polyline: "polyT",
        durationSec: 600,
        durationText: "10 mins",
        distanceMeters: 2000,
        distanceText: "2.0 km",
      });

      // Validate extracted transit lines
      expect(res[0].transitLines).toEqual([
        {
          name: "51",
          vehicleType: "BUS",
          headsign: "Ouest",
          agency: "Société de transport de Montréal",
        },
        {
          name: "Orange Line",
          vehicleType: "SUBWAY",
          headsign: "Est",
          agency: "STM", // only first agency
        },
      ]);
    });

    it("does not set transitLines when mode is not transit (even if response contains steps)", async () => {
      (global as any).fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: "OK",
          routes: [
            {
              summary: "Route A",
              overview_polyline: { points: "polyA" },
              legs: [
                {
                  duration: { value: 120, text: "2 mins" },
                  distance: { value: 300, text: "0.3 km" },
                  steps: [
                    {
                      travel_mode: "TRANSIT",
                      transit_details: {
                        headsign: "West",
                        line: {
                          short_name: "51",
                          vehicle: { type: "BUS" },
                          agencies: [{ name: "STM" }],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        }),
      });

      const res = await fetchDirections({
        origin: { latitude: 45.0, longitude: -73.0 },
        destination: { latitude: 45.1, longitude: -73.1 },
        mode: "walking",
      });

      expect(res[0].transitLines).toBeUndefined();
    });

    it("throws when HTTP response is not ok", async () => {
      (global as any).fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ status: "UNKNOWN_ERROR" }),
      });

      await expect(
        fetchDirections({
          origin: { latitude: 1, longitude: 2 },
          destination: { latitude: 3, longitude: 4 },
          mode: "driving",
        }),
      ).rejects.toThrow("Directions HTTP 500");
    });

    it("throws when API status is not OK", async () => {
      (global as any).fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: "ZERO_RESULTS",
          error_message: "No route found",
        }),
      });

      await expect(
        fetchDirections({
          origin: { latitude: 1, longitude: 2 },
          destination: { latitude: 3, longitude: 4 },
          mode: "transit",
        }),
      ).rejects.toThrow("Directions API status: ZERO_RESULTS No route found");
    });

    it("throws when googleMapsApiKey is missing in expo config", async () => {
      jest.resetModules();

      // Re-mock expo-constants for THIS isolated import
      jest.doMock("expo-constants", () => ({
        __esModule: true,
        default: { expoConfig: { extra: {} } },
      }));

      let fetchDirectionsFn: any;

      // Load the module fresh with the new mock
      jest.isolateModules(() => {
        const mod = require("@/components/campus/helper_methods/googleDirections");
        fetchDirectionsFn = mod.fetchDirections;
      });

      await expect(
        fetchDirectionsFn({
          origin: { latitude: 1, longitude: 2 },
          destination: { latitude: 3, longitude: 4 },
          mode: "walking",
        }),
      ).rejects.toThrow("Missing Google Maps API key");
    });
  });
});
