import React from "react";
import { render } from "@testing-library/react-native";
import { describe, it, expect, jest } from "@jest/globals";

const BUILDING_NO_POLYGON = {
  id: "np-1",
  code: "NP",
  name: "No Polygon Building",
  address: "Somewhere",
  latitude: 45.46001,
  longitude: -73.64001,
  polygon: [], // 👈 THIS triggers the : null branch
};

jest.mock("@/components/Buildings/Loyola/LoyolaBuildings", () => ({
  LOYOLA_BUILDINGS: [BUILDING_NO_POLYGON],
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

jest.mock("react-native-maps", () => {
  const ReactActual = jest.requireActual("react") as typeof React;
  const RN = jest.requireActual(
    "react-native",
  ) as typeof import("react-native");
  const { View } = RN;

  const MockMapView = (props: any) =>
    ReactActual.createElement(
      View,
      { testID: "loyola-mapView", ...props },
      props.children,
    );

  const MockPolygon = () =>
    ReactActual.createElement(View, { testID: "polygon" });

  const MockMarker = (props: any) => {
    const c = props.coordinate;
    return ReactActual.createElement(View, {
      testID: `marker-${c.latitude}-${c.longitude}`,
    });
  };

  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_GOOGLE: "google",
    Polygon: MockPolygon,
    Marker: MockMarker,
  };
});

import LoyolaCampus from "../LoyolaCampus";

describe("LoyolaCampus - building without polygon", () => {
  it("does not render Polygon when polygon array is empty, but still renders Marker", () => {
    const { queryByTestId, getByTestId } = render(<LoyolaCampus />);

    // Polygon should NOT render
    expect(queryByTestId("polygon")).toBeNull();

    // Marker should still render
    expect(getByTestId("marker-45.46001--73.64001")).toBeTruthy();
  });
});
