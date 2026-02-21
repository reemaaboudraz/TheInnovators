import { fetchDirectionsWithSteps } from "../helper_methods/googleDirections";

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

describe("fetchDirectionsWithSteps (Sonar coverage)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("parses routes, strips HTML, and normalizes data", async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        status: "OK",
        routes: [
          {
            summary: "Route A",
            overview_polyline: { points: "abc" },
            legs: [
              {
                duration: { value: 600, text: "10 mins" },
                distance: { value: 1200, text: "1.2 km" },
                steps: [
                  {
                    html_instructions: "Head <b>north</b>",
                    distance: { text: "0.2 km", value: 200 },
                    duration: { text: "1 min", value: 60 },
                    start_location: { lat: 45, lng: -73 },
                    end_location: { lat: 45.001, lng: -73.001 },
                  },
                ],
              },
            ],
          },
        ],
      }),
    })) as any;

    const result = await fetchDirectionsWithSteps({
      origin: { latitude: 45, longitude: -73 },
      destination: { latitude: 45.01, longitude: -73.01 },
      mode: "walking",
    });

    expect(result).toHaveLength(1);
    expect(result[0].summary).toBe("Route A");
    expect(result[0].polyline).toBe("abc");
    expect(result[0].durationSec).toBe(600);
    expect(result[0].distanceMeters).toBe(1200);

    // HTML should be stripped
    expect(result[0].steps[0].instruction).toBe("Head north");
  });
});
