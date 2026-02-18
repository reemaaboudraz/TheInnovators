export function toDirectionsErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (lower.includes("missing google maps api key")) {
    return "Google Maps API is missing. Please contact the team.";
  }

  if (
    lower.includes("request_denied") ||
    lower.includes("over_query_limit") ||
    lower.includes("invalid_request")
  ) {
    return "Directions request was rejected. Please try again later.";
  }

  if (lower.includes("directions http")) {
    return "Direction service error. Please try again.";
  }

  if (lower.includes("zero_results")) {
    return "No results found for this search. Please try another route or mode.";
  }

  if (lower.includes("not_found")) {
    return "Start or destination could not be found. Try selecting again";
  }

  if (lower.includes("unknown_error")) {
    return "Direction service is currently unavailable. Please retry.";
  }

  if (lower.includes("network") || lower.includes("failed to fetch")) {
    return "Network error. Check your connection and try again.";
  }

  return "Unable to load directions. Please try again.";
}
