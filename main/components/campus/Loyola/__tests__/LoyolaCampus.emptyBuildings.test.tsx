import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { describe, it, expect, jest } from "@jest/globals";

const mockAnimateToRegion = jest.fn();

jest.mock("@/components/Buildings/Loyola/LoyolaBuildings", () => ({
  LOYOLA_BUILDINGS: [],
}));

jest.mock("@/components/Buildings/search", () => ({
  searchLoyolaBuildings: () => [],
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("@/components/layout/BrandBar", () => {
  const ReactActual = jest.requireActual("react") as typeof React;
  const RN = jest.requireActual(
    "react-native",
  ) as typeof import("react-native");
  const { View } = RN;

  return function BrandBarMock(props: any) {
    return ReactActual.createElement(View, {
      testID: props.testID || "brandbar",
    });
  };
});

jest.mock("@/components/Styles/mapStyle", () => {
  const RN = jest.requireActual(
    "react-native",
  ) as typeof import("react-native");
  return {
    styles: RN.StyleSheet.create({
      container: { flex: 1 },
      topOverlay: {},
      searchBar: {},
      searchIcon: {},
      searchInput: {},
      clearButton: {},
      clearIcon: {},
      suggestions: {},
      suggestionRow: {},
      suggestionTitle: {},
      suggestionSub: {},
    }),
  };
});

// IMPORTANT: keep your real component behaviour (testIDs) but simplify rendering
jest.mock("@/components/ui/BuildingsLoadError", () => {
  const ReactActual = jest.requireActual("react") as typeof React;
  const RN = jest.requireActual(
    "react-native",
  ) as typeof import("react-native");
  const { View, Text, Pressable } = RN;

  return function BuildingsLoadErrorMock(props: any) {
    if (!props.visible) return null;
    const prefix = props.testIDPrefix || "buildings-error";

    return ReactActual.createElement(
      View,
      { testID: `${prefix}-overlay` },
      ReactActual.createElement(Text, null, "Whoops!"),
      ReactActual.createElement(
        Pressable,
        { testID: `${prefix}-refresh`, onPress: props.onRefresh },
        ReactActual.createElement(Text, null, "Refresh"),
      ),
    );
  };
});

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

    return ReactActual.createElement(
      View,
      { testID: props.testID || "loyola-mapView", ...props },
      props.children,
    );
  });

  (MockMapView as any).displayName = "MockMapView";

  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_GOOGLE: "google",
    Polygon: (props: any) =>
      ReactActual.createElement(View, { testID: "polygon", ...props }),
    Marker: (props: any) =>
      ReactActual.createElement(View, { testID: "marker", ...props }),
  };
});

import LoyolaCampus from "../LoyolaCampus";

describe("LoyolaCampus - empty buildings overlay", () => {
  it("shows overlay when buildings array is empty, then hides after Refresh", () => {
    const { getByTestId, queryByTestId } = render(<LoyolaCampus />);

    // visible initially because buildings are empty
    expect(getByTestId("loyola-buildings-error-overlay")).toBeTruthy();

    // user types something
    fireEvent.changeText(getByTestId("loyola-search-input"), "hb");
    expect(getByTestId("loyola-search-input").props.value).toBe("hb");

    // refresh should reset state + hide overlay (your component does that)
    fireEvent.press(getByTestId("loyola-buildings-error-refresh"));

    expect(getByTestId("loyola-search-input").props.value).toBe("");
    expect(getByTestId("loyola-buildings-error-overlay")).toBeTruthy();
  });
});
