import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import LoyolaCampus from "../LoyolaCampus";

const mockAnimateToRegion = jest.fn();

jest.mock("react-native-maps", () => {
  const ReactActual = jest.requireActual("react") as typeof React;
  const RN = jest.requireActual(
    "react-native",
  ) as typeof import("react-native");
  const { View } = RN;

  const MockMapView = ReactActual.forwardRef((props: any, ref: any) => {
    ReactActual.useImperativeHandle(ref, () => ({
      animateToRegion: mockAnimateToRegion,
    }));

    return ReactActual.createElement(View, {
      testID: props.testID || "loyola-mapView",
      ...props,
    });
  });

  (MockMapView as any).displayName = "MockMapView";

  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_GOOGLE: "google",
  };
});

describe("LoyolaCampus - initial region", () => {
  it("uses Loyola region as initialRegion", () => {
    const { getByTestId } = render(<LoyolaCampus />);

    const map = getByTestId("loyola-mapView");

    expect(map.props.initialRegion).toEqual({
      latitude: 45.457984,
      longitude: -73.639834,
      latitudeDelta: 0.006,
      longitudeDelta: 0.006,
    });
  });
});

describe("LoyolaCampus - search bar", () => {
  it("updates text when typing in search input", () => {
    const { getByTestId } = render(<LoyolaCampus />);

    const input = getByTestId("loyola-search-input");
    fireEvent.changeText(input, "admin");

    expect(input.props.value).toBe("admin");
  });

  it("shows clear button when search has text and clears input on press", () => {
    const { getByTestId } = render(<LoyolaCampus />);

    const input = getByTestId("loyola-search-input");
    fireEvent.changeText(input, "admin");

    const clearButton = getByTestId("clear-search-button");
    expect(clearButton).toBeTruthy();

    fireEvent.press(clearButton);
    expect(getByTestId("loyola-search-input").props.value).toBe("");
  });

  it("does not show clear button when search is empty", () => {
    const { queryByTestId } = render(<LoyolaCampus />);

    const clearButton = queryByTestId("clear-search-button");
    expect(clearButton).toBeNull();
  });
});

describe("LoyolaCampus - suggestions", () => {
  beforeEach(() => {
    mockAnimateToRegion.mockClear();
  });

  it("shows suggestions when typing a search query", async () => {
    const { getByTestId, findByTestId } = render(<LoyolaCampus />);

    const input = getByTestId("loyola-search-input");
    fireEvent.changeText(input, "admin");

    const suggestion = await findByTestId("suggestion-AD");
    expect(suggestion).toBeTruthy();
  });

  it("selecting a suggestion animates the map and updates the input", async () => {
    const { getByTestId, findByTestId } = render(<LoyolaCampus />);

    const input = getByTestId("loyola-search-input");
    fireEvent.changeText(input, "admin");

    const suggestion = await findByTestId("suggestion-AD");
    fireEvent.press(suggestion);

    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);
    expect(mockAnimateToRegion).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 45.457984,
        longitude: -73.639834,
        latitudeDelta: 0.0025,
        longitudeDelta: 0.0025,
      }),
      500,
    );

    expect(getByTestId("loyola-search-input").props.value).toMatch(
      /^AD - Administration Building/i,
    );
  });

  it("clears selected building when typing new text", async () => {
    const { getByTestId, findByTestId } = render(<LoyolaCampus />);

    const input = getByTestId("loyola-search-input");
    fireEvent.changeText(input, "admin");

    const suggestion = await findByTestId("suggestion-AD");
    fireEvent.press(suggestion);

    // Now type new text - should clear selected building and show new suggestions
    fireEvent.changeText(input, "VL");

    const vlSuggestion = await findByTestId("suggestion-VL");
    expect(vlSuggestion).toBeTruthy();
  });

  it("hides suggestions when search query is empty", () => {
    const { getByTestId, queryByTestId } = render(<LoyolaCampus />);

    const input = getByTestId("loyola-search-input");
    fireEvent.changeText(input, "admin");

    // Clear the input
    fireEvent.changeText(input, "");

    const suggestion = queryByTestId("suggestion-AD");
    expect(suggestion).toBeNull();
  });
});
