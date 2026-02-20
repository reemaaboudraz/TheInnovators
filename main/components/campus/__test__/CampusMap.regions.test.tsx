/* eslint-disable import/first */
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

import {
  INITIAL_REGION,
  SGW_REGION,
  LOY_REGION,
} from "../helper_methods/campusMap.constants";

// Silence icon async setState warnings
jest.mock("@expo/vector-icons", () => {
  return new Proxy(
    {},
    {
      get: () => () => null,
    },
  );
});

// Mock heavy children
jest.mock("../BuildingShapesLayer", () => () => null);
jest.mock("../BuildingPopup", () => () => null);
jest.mock("../BuildingPin", () => () => null);
jest.mock("../CurrentLocationButton", () => () => null);
jest.mock("../RoutePlanner", () => () => null);
jest.mock("../RouteInput", () => () => null);
jest.mock("../TravelOptionsPopup", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/components/layout/BrandBar", () => () => null);

// Make ToggleButton controllable
jest.mock("../ToggleButton", () => {
  const React = require("react");
  const { View, Pressable, Text } = require("react-native");
  return function MockToggleButton(props: any) {
    return (
      <View testID="campusToggle">
        <Pressable
          testID="campusToggle-SGW"
          onPress={() => props.onCampusChange("SGW")}
        >
          <Text>SGW</Text>
        </Pressable>

        <Pressable
          testID="campusToggle-Loyola"
          onPress={() => props.onCampusChange("LOY")}
        >
          <Text>Loyola</Text>
        </Pressable>
      </View>
    );
  };
});

// Prevent mount async state update warnings (keep pending by default)
const mockGetDeviceLocation = jest.fn(() => new Promise(() => {}));
jest.mock("../helper_methods/locationUtils", () => ({
  getDeviceLocation: () => mockGetDeviceLocation(),
}));

// CampusMap imports these from campusMap.buildings (NOT locationUtils)
jest.mock("../helper_methods/campusMap.buildings", () => ({
  buildAllBuildings: () => [],
  getUserLocationBuildingId: () => null,
  getBuildingContainingPoint: () => null,
  makeUserLocationBuilding: () => null,
}));

// Mock react-native-maps and capture animateToRegion
const mockAnimateToRegion = jest.fn();

jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View } = require("react-native");

  // eslint-disable-next-line react/display-name
  const MapView = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      animateToRegion: mockAnimateToRegion,
    }));
    return (
      <View {...props} testID={props.testID ?? "mapView"}>
        {props.children}
      </View>
    );
  });

  return {
    __esModule: true,
    default: MapView,
    PROVIDER_GOOGLE: "google",
    Marker: (p: any) => <View {...p} />,
    Polygon: (p: any) => <View {...p} />,
  };
});

// Import AFTER mocks
import CampusMap from "../CampusMap";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CampusMap - regions/toggle", () => {
  it("uses INITIAL_REGION as initialRegion", () => {
    const { getByTestId } = render(<CampusMap />);
    expect(getByTestId("mapView").props.initialRegion).toEqual(INITIAL_REGION);
  });

  it("pressing Loyola animates to LOY_REGION", async () => {
    const { getByTestId } = render(<CampusMap />);

    fireEvent.press(getByTestId("campusToggle-Loyola"));

    await waitFor(() => {
      expect(mockAnimateToRegion).toHaveBeenCalledWith(LOY_REGION, 500);
    });
  });

  it("pressing SGW animates to SGW_REGION (after switching away first)", async () => {
    const { getByTestId } = render(<CampusMap />);

    fireEvent.press(getByTestId("campusToggle-Loyola"));
    await waitFor(() => {
      expect(mockAnimateToRegion).toHaveBeenCalledWith(LOY_REGION, 500);
    });

    fireEvent.press(getByTestId("campusToggle-SGW"));
    await waitFor(() => {
      expect(mockAnimateToRegion).toHaveBeenCalledWith(SGW_REGION, 500);
    });
  });
});
