import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAnimateToRegion = jest.fn();

jest.mock("@/components/Buildings/SGW/SGWBuildings", () => ({
  SGW_BUILDINGS: [
    {
      id: "sgw-h",
      code: "H",
      name: "Henry F. Hall Building",
      address: "1455 De Maisonneuve Blvd W, Montreal, QC",
      latitude: 45.49729,
      longitude: -73.57898,
      campus: "SGW",
      aliases: ["hall", "henry hall"],
      polygon: [
        { latitude: 45.4973, longitude: -73.579 },
        { latitude: 45.4974, longitude: -73.5791 },
        { latitude: 45.4975, longitude: -73.5792 },
      ],
    },
    {
      id: "sgw-no-poly",
      code: "NP",
      name: "No Polygon Building",
      address: "Some address",
      latitude: 45.4978,
      longitude: -73.5795,
      campus: "SGW",
      aliases: ["nop", "no polygon"],
      polygon: [], // <-- important
    },
  ],
}));

jest.mock("@/components/Buildings/Loyola/LoyolaBuildings", () => ({
  LOYOLA_BUILDINGS: [
    {
      id: "loy-ad",
      code: "AD",
      name: "Administration Building",
      address: "7141 Sherbrooke St W, Montreal, QC",
      latitude: 45.458,
      longitude: -73.64,
      campus: "LOY",
      aliases: ["admin", "administration"],
      polygon: [
        { latitude: 45.4581, longitude: -73.6401 },
        { latitude: 45.4582, longitude: -73.6402 },
        { latitude: 45.4583, longitude: -73.6403 },
      ],
    },
  ],
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
      ...props,
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
      campusToggleContainer: {},
      campusToggleButton: {},
      campusToggleButtonLeft: {},
      campusToggleButtonRight: {},
      campusToggleSlider: {},
      campusToggleText: {},
      campusToggleTextActive: {},
    }),
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
      { ...props, testID: props.testID || "mapView" },
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
      { ...props, testID: tid },
      props.children,
    );
  };

  const MockMarker = (props: any) => {
    const c = props.coordinate;
    const tid = c ? `marker-${c.latitude}-${c.longitude}` : "marker";
    return ReactActual.createElement(
      View,
      { ...props, testID: tid },
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

import CampusMap from "../CampusMap";

beforeEach(() => {
  mockAnimateToRegion.mockClear();
});

describe("CampusMap - initial region", () => {
  it("uses SGW region as initialRegion", () => {
    const { getByTestId } = render(<CampusMap />);
    const map = getByTestId("mapView");

    expect(map.props.initialRegion).toEqual({
      latitude: 45.4973,
      longitude: -73.5794,
      latitudeDelta: 0.006,
      longitudeDelta: 0.006,
    });
  });
});

describe("CampusMap - search bar", () => {
  it("updates text and clears input", () => {
    const { getByPlaceholderText, getByTestId } = render(<CampusMap />);

    const input = getByPlaceholderText("Where to next?");
    fireEvent.changeText(input, "hall");
    expect(getByPlaceholderText("Where to next?").props.value).toBe("hall");

    fireEvent.press(getByTestId("clearSearch"));
    expect(getByPlaceholderText("Where to next?").props.value).toBe("");
  });
});

describe("CampusMap - suggestions", () => {
  it("shows suggestions for SGW + Loyola matches", async () => {
    const { getByPlaceholderText, findByText } = render(<CampusMap />);

    fireEvent.changeText(getByPlaceholderText("Where to next?"), "ad");
    expect(await findByText(/AD — Administration Building/i)).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText("Where to next?"), "hall");
    expect(await findByText(/H — Henry F\. Hall Building/i)).toBeTruthy();
  });

  it("selecting a suggestion animates map and updates the input", async () => {
    const { getByPlaceholderText, getByTestId, findByText } = render(
      <CampusMap />,
    );

    fireEvent.changeText(getByPlaceholderText("Where to next?"), "admin");
    await findByText(/AD — Administration Building/i);

    fireEvent.press(getByTestId("suggestion-LOY-loy-ad"));

    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);
    expect(mockAnimateToRegion).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 45.458,
        longitude: -73.64,
        latitudeDelta: 0.0025,
        longitudeDelta: 0.0025,
      }),
      600,
    );

    expect(getByPlaceholderText("Where to next?").props.value).toMatch(
      /^AD - Administration Building/i,
    );
  });
});

describe("CampusMap - building shapes (Polygon/Marker)", () => {
  it("pressing a Polygon selects it (strokeWidth/fillColor change) + animates", () => {
    const { getByTestId } = render(<CampusMap />);

    const polygonId = "polygon-45.4581--73.6401";
    const before = getByTestId(polygonId);

    expect(before.props.strokeWidth).toBe(2);

    fireEvent.press(before);

    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);

    const after = getByTestId(polygonId);
    expect(after.props.strokeWidth).toBe(3);
    expect(after.props.fillColor).toBe("rgba(224, 177, 0, 0.55)");
  });

  it("pressing a Marker selects it (tracksViewChanges becomes true) + animates", () => {
    const { getByTestId } = render(<CampusMap />);

    const markerId = "marker-45.458--73.64";
    const before = getByTestId(markerId);

    expect(before.props.tracksViewChanges).toBe(false);

    fireEvent.press(before);

    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);

    const after = getByTestId(markerId);
    expect(after.props.tracksViewChanges).toBe(true);
  });

  it("tapping on the map unselects the selected building", () => {
    const { getByTestId } = render(<CampusMap />);

    const markerId = "marker-45.458--73.64";

    fireEvent.press(getByTestId(markerId));
    expect(getByTestId(markerId).props.tracksViewChanges).toBe(true);

    fireEvent.press(getByTestId("mapView"));
    expect(getByTestId(markerId).props.tracksViewChanges).toBe(false);
  });

  describe("CampusMap - polygon optional branch coverage", () => {
    it("renders a building even when polygon is empty (no Polygon)", () => {
      const { getByTestId } = render(<CampusMap />);

      // marker testID from your react-native-maps mock:
      // `marker-${latitude}-${longitude}`
      expect(getByTestId("marker-45.4978--73.5795")).toBeTruthy();
    });
  });
});
