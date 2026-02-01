import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAnimateToRegion = jest.fn();

// Keep test data small + predictable so we can assert Marker/Polygon props.
// Only the fields used by LoyolaCampus are required.
const BUILDING_AD = {
  id: "ad-1",
  code: "AD",
  name: "Administration Building",
  address: "7141 Sherbrooke St W, Montreal, QC",
  latitude: 45.458,
  longitude: -73.64,
  polygon: [
    { latitude: 45.4581, longitude: -73.6401 },
    { latitude: 45.4582, longitude: -73.6402 },
    { latitude: 45.4583, longitude: -73.6403 },
  ],
};

// Another building to ensure we don't accidentally select everything.
const BUILDING_HB = {
  id: "hb-1",
  code: "HB",
  name: "Hingston Hall, wing HB",
  address: "7141 Sherbrooke St W, Montreal, QC",
  latitude: 45.459,
  longitude: -73.639,
  polygon: [
    { latitude: 45.4591, longitude: -73.6391 },
    { latitude: 45.4592, longitude: -73.6392 },
    { latitude: 45.4593, longitude: -73.6393 },
  ],
};

// Mock the building data + search helper so suggestions are predictable.
jest.mock("@/components/Buildings/Loyola/LoyolaBuildings", () => ({
  LOYOLA_BUILDINGS: [BUILDING_AD, BUILDING_HB],
}));

jest.mock("@/components/Buildings/search", () => ({
  searchLoyolaBuildings: (query: string, limit: number) => {
    const q = query.toLowerCase();
    const results = [] as any[];
    if (q.includes("admin") || q.includes("ad")) results.push(BUILDING_AD);
    if (q.includes("hing") || q.includes("hb")) results.push(BUILDING_HB);
    return results.slice(0, limit);
  },
}));

// Keep UI deps lightweight for tests.
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

  const MockPolygon = (props: any) => {
    const first = props.coordinates?.[0];
    const tid = first
      ? `polygon-${first.latitude}-${first.longitude}`
      : "polygon";

    return ReactActual.createElement(
      View,
      { testID: props.testID || tid, ...props },
      props.children,
    );
  };

  const MockMarker = (props: any) => {
    const c = props.coordinate;
    const tid = c ? `marker-${c.latitude}-${c.longitude}` : "marker";

    return ReactActual.createElement(
      View,
      { testID: props.testID || tid, ...props },
      props.children,
    );
  };

  (MockMapView as any).displayName = "MockMapView";

  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_GOOGLE: "google",
    Polygon: MockPolygon,
    Marker: MockMarker,
  };
});

import LoyolaCampus from "../LoyolaCampus";

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

    expect(getByTestId("loyola-search-input").props.value).toMatch(
      /^AD - Administration Building/i,
    );
  });

  it("hides suggestions when search query is empty", async () => {
    const { getByTestId, queryByTestId, findByTestId } = render(
      <LoyolaCampus />,
    );

    const input = getByTestId("loyola-search-input");
    fireEvent.changeText(input, "admin");
    await findByTestId("suggestion-AD");

    fireEvent.changeText(input, "");
    expect(queryByTestId("suggestion-AD")).toBeNull();
  });
});

describe("LoyolaCampus - building shapes (Polygon/Marker)", () => {
  beforeEach(() => {
    mockAnimateToRegion.mockClear();
  });

  it("pressing a building Polygon selects it (style changes) + animates map", () => {
    const { getByTestId } = render(<LoyolaCampus />);

    const polygonId = "polygon-45.4581--73.6401";
    const polygonBefore = getByTestId(polygonId);
    expect(polygonBefore.props.strokeWidth).toBe(2);

    fireEvent.press(polygonBefore);

    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);

    const polygonAfter = getByTestId(polygonId);
    expect(polygonAfter.props.strokeWidth).toBe(3);
    expect(polygonAfter.props.fillColor).toBe("rgba(224, 177, 0, 0.55)");
  });

  it("pressing a building Marker selects it (anchor changes) + animates map", () => {
    const { getByTestId } = render(<LoyolaCampus />);

    const markerId = "marker-45.458--73.64";
    const markerBefore = getByTestId(markerId);
    expect(markerBefore.props.anchor).toEqual({ x: 0.5, y: 0.5 });

    fireEvent.press(markerBefore);

    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);

    const markerAfter = getByTestId(markerId);
    expect(markerAfter.props.anchor).toEqual({ x: 0.5, y: 0.75 });
    expect(markerAfter.props.tracksViewChanges).toBe(true);
  });

  // NEW TEST: covers MapView onPress={() => setSelectedBuilding(null)}
  it("tapping on the map (outside buildings) unselects the selected building", () => {
    const { getByTestId } = render(<LoyolaCampus />);

    const markerId = "marker-45.458--73.64";

    // Select a building first
    fireEvent.press(getByTestId(markerId));
    expect(getByTestId(markerId).props.anchor).toEqual({ x: 0.5, y: 0.75 });

    // Tap outside (MapView onPress)
    fireEvent.press(getByTestId("loyola-mapView"));

    // Should unselect
    expect(getByTestId(markerId).props.anchor).toEqual({ x: 0.5, y: 0.5 });
  });
});
