import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Keep the same data mocks used by CampusMap.test.tsx style
jest.mock("@/components/Buildings/data/SGW_data.json", () => [
  {
    id: "sgw-h",
    code: "H",
    name: "Henry F. Hall Building",
    address: "1455 De Maisonneuve Blvd W, Montreal, QC",
    latitude: 45.49729,
    longitude: -73.57898,
    campus: "SGW",
    zoomCategory: 2,
    aliases: ["hall", "henry hall", "h"],
    polygon: [
      { latitude: 45.497, longitude: -73.58 },
      { latitude: 45.497, longitude: -73.578 },
      { latitude: 45.498, longitude: -73.578 },
      { latitude: 45.498, longitude: -73.58 },
    ],
  },
  {
    id: "sgw-ev",
    code: "EV",
    name: "Engineering, Computer Science and Visual Arts Integrated Complex",
    address: "1515 St Catherine St W, Montreal, QC",
    latitude: 45.4953,
    longitude: -73.5773,
    campus: "SGW",
    zoomCategory: 2,
    aliases: ["ev", "engineering"],
    polygon: [
      { latitude: 45.4951, longitude: -73.5775 },
      { latitude: 45.4951, longitude: -73.5771 },
      { latitude: 45.4955, longitude: -73.5771 },
      { latitude: 45.4955, longitude: -73.5775 },
    ],
  },
]);

jest.mock("@/components/Buildings/data/Loyola_data.json", () => [
  {
    id: "loy-ad",
    code: "AD",
    name: "Administration Building",
    address: "7141 Sherbrooke St W, Montreal, QC",
    latitude: 45.458,
    longitude: -73.64,
    campus: "LOY",
    zoomCategory: 1,
    aliases: ["admin", "administration"],
    polygon: [
      { latitude: 45.4581, longitude: -73.6401 },
      { latitude: 45.4582, longitude: -73.6402 },
      { latitude: 45.4583, longitude: -73.6403 },
    ],
  },
]);

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));

jest.mock("@/components/campus/BuildingPopup", () => {
  const ReactActual = jest.requireActual("react") as typeof React;
  const RN = jest.requireActual(
    "react-native",
  ) as typeof import("react-native");
  const { View } = RN;
  return {
    __esModule: true,
    default: function MockBuildingPopup() {
      return ReactActual.createElement(View, { testID: "buildingPopup" });
    },
  };
});

jest.mock("@/components/campus/CurrentLocationButton", () => {
  const ReactActual = jest.requireActual("react") as typeof React;
  const RN = jest.requireActual(
    "react-native",
  ) as typeof import("react-native");
  const { View } = RN;
  return {
    __esModule: true,
    default: function MockCurrentLocationButton() {
      return ReactActual.createElement(View, {
        testID: "currentLocationButton",
      });
    },
  };
});

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

    return ReactActual.createElement(
      View,
      { ...props, testID: props.testID || "mapView" },
      props.children,
    );
  });

  const MockPolygon = (props: any) =>
    ReactActual.createElement(
      View,
      { ...props, testID: "polygon" },
      props.children,
    );

  const MockMarker = (props: any) =>
    ReactActual.createElement(
      View,
      { ...props, testID: "marker" },
      props.children,
    );

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
  jest.clearAllMocks();
});

describe("CampusMap navigation flow", () => {
  it("typing start/destination text alone does not commit route selection and button stays disabled", () => {
    const { getByTestId } = render(<CampusMap />);

    const startInput = getByTestId("startInput");
    const destinationInput = getByTestId("destinationInput");
    const getDirectionsButton = getByTestId("getDirectionsButton");

    act(() => {
      fireEvent.changeText(startInput, "H");
      fireEvent.changeText(destinationInput, "EV");
    });

    // In current implementation, these inputs represent committed selections.
    // Raw typing alone does not commit them, so value remains empty.
    expect(getByTestId("startInput").props.value).toBe("");
    expect(getByTestId("destinationInput").props.value).toBe("");

    expect(getDirectionsButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it("swap button does not crash and keeps disabled state when no committed selections exist", () => {
    const { getByTestId } = render(<CampusMap />);

    const swapRouteButton = getByTestId("swapRouteButton");
    const getDirectionsButton = getByTestId("getDirectionsButton");

    act(() => {
      fireEvent.press(swapRouteButton);
    });

    expect(getByTestId("startInput").props.value).toBe("");
    expect(getByTestId("destinationInput").props.value).toBe("");
    expect(getDirectionsButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });
});
