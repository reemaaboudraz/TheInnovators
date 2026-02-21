import { toDirectionsErrorMessage } from "@/components/campus/helper_methods/directionErrors";

describe("toDirectionsErrorMessage", () => {
  it("handles Missing Google Maps API key", () => {
    expect(
      toDirectionsErrorMessage(new Error("Missing Google Maps API key")),
    ).toBe("Google Maps API is missing. Please contact the team.");
  });

  it("handles Directions HTTP errors", () => {
    expect(toDirectionsErrorMessage(new Error("Directions HTTP 500"))).toBe(
      "Direction service error. Please try again.",
    );
  });

  it("handles ZERO_RESULTS", () => {
    expect(toDirectionsErrorMessage(new Error("ZERO_RESULTS"))).toBe(
      "No results found for this search. Please try another route or mode.",
    );
  });

  it("handles NOT_FOUND", () => {
    expect(toDirectionsErrorMessage(new Error("NOT_FOUND"))).toBe(
      "Start or destination could not be found. Try selecting again",
    );
  });

  it("handles UNKNOWN_ERROR", () => {
    expect(toDirectionsErrorMessage(new Error("UNKNOWN_ERROR"))).toBe(
      "Direction service is currently unavailable. Please retry.",
    );
  });

  it("handles REQUEST_DENIED / OVER_QUERY_LIMIT / INVALID_REQUEST (grouped)", () => {
    expect(toDirectionsErrorMessage(new Error("REQUEST_DENIED"))).toBe(
      "Directions request was rejected. Please try again later.",
    );
    expect(toDirectionsErrorMessage(new Error("OVER_QUERY_LIMIT"))).toBe(
      "Directions request was rejected. Please try again later.",
    );
    expect(toDirectionsErrorMessage(new Error("INVALID_REQUEST"))).toBe(
      "Directions request was rejected. Please try again later.",
    );
  });

  it("handles network/failed to fetch (case-insensitive)", () => {
    expect(toDirectionsErrorMessage(new Error("Network request failed"))).toBe(
      "Network error. Check your connection and try again.",
    );
    expect(toDirectionsErrorMessage("Failed to fetch")).toBe(
      "Network error. Check your connection and try again.",
    );
  });

  it("falls back to default message", () => {
    expect(toDirectionsErrorMessage(new Error("Some random error"))).toBe(
      "Unable to load directions. Please try again.",
    );
  });

  it("works with non-Error inputs", () => {
    expect(toDirectionsErrorMessage(123)).toBe(
      "Unable to load directions. Please try again.",
    );
  });
});
