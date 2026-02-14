/* eslint-disable import/first */
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Fix for RN StatusBar usage in Jest node env
if (!(global as any).clearImmediate) {
  (global as any).clearImmediate = (
    fn: (...args: any[]) => void,
    ...args: any[]
  ) => setTimeout(fn, 0, ...args);
}

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));

jest.mock("react-native-maps", () => {
  const ReactActual = require("react");
  const { View } = require("react-native");
  const MockMap = ReactActual.forwardRef((props: any, ref: any) => {
    ReactActual.useImperativeHandle(ref, () => ({
      animateToRegion: jest.fn(),
      fitToCoordinates: jest.fn(),
    }));
    return ReactActual.createElement(View, {
      testID: "campusMapMock",
      ...props,
    });
  });

  return {
    __esModule: true,
    default: MockMap,
    Marker: ({ children, ...props }: any) =>
      ReactActual.createElement(View, props, children),
    Polygon: ({ children, ...props }: any) =>
      ReactActual.createElement(View, props, children),
    Polyline: ({ children, ...props }: any) =>
      ReactActual.createElement(View, props, children),
    PROVIDER_GOOGLE: "google",
  };
});

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({
    status: "granted",
  })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 45.497, longitude: -73.579 },
  })),
}));

import CampusMap from "../CampusMap";

describe("CampusMap navigation flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("typing start/destination text alone does not commit route selection and button stays disabled", async () => {
    const { getByTestId } = render(<CampusMap />);

    fireEvent.press(getByTestId("directionsModeButton"));

    const startInput = getByTestId("startInput");
    const destinationInput = getByTestId("destinationInput");
    const getDirectionsButton = getByTestId("getDirectionsButton");

    fireEvent.changeText(startInput, "H");
    fireEvent.changeText(destinationInput, "EV");

    await waitFor(() => {
      expect(getDirectionsButton.props.accessibilityState).toEqual(
        expect.objectContaining({ disabled: true }),
      );
    });
  });

  it("swap button does not crash and keeps disabled state when no committed selections exist", async () => {
    const { getByTestId } = render(<CampusMap />);

    fireEvent.press(getByTestId("directionsModeButton"));

    const swapButton = getByTestId("swapRouteButton");
    const getDirectionsButton = getByTestId("getDirectionsButton");

    fireEvent.press(swapButton);

    await waitFor(() => {
      expect(getDirectionsButton.props.accessibilityState).toEqual(
        expect.objectContaining({ disabled: true }),
      );
    });
  });
});
