import React from "react";
import { render, act } from "@testing-library/react-native";

const mockAnimateCamera = jest.fn();
const mockAnimateToRegion = jest.fn();

jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View } = require("react-native");

  const MapView = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      animateCamera: mockAnimateCamera,
      animateToRegion: mockAnimateToRegion,
      fitToCoordinates: jest.fn(), // optional, but common
    }));
    return <View testID={props.testID || "map"}>{props.children}</View>;
  });

  const Dummy = (props: any) => <View {...props}>{props.children}</View>;

  return {
    __esModule: true,
    default: MapView,
    Marker: Dummy,
    Polyline: Dummy,
    Polygon: Dummy,
    Circle: Dummy,
    Callout: Dummy,
    Overlay: Dummy,
    Heatmap: Dummy,
    Geojson: Dummy,
    PROVIDER_GOOGLE: "google",
  };
});

// ---- Navigation mock ----
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
  }),
}));

const mockUseRouteNavigation = jest.fn();

jest.mock("@/hooks/useRouteNavigation", () => ({
  __esModule: true,
  useRouteNavigation: (...args: any[]) => mockUseRouteNavigation(...args),
}));

// ---- CurrentLocationButton mock (so userLocation becomes non-null) ----
const mockUserLocation = { latitude: 45.4973, longitude: -73.5789 };

jest.mock("@/components/campus/CurrentLocationButton", () => {
  return {
    __esModule: true,
    default: (props: any) => {
      // No React/useEffect here -> no hoisting/out-of-scope issues
      props.onLocationFound(mockUserLocation);
      return null;
    },
  };
});

import CampusMap from "@/components/campus/CampusMap";

describe("CampusMap camera-follow useEffect", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // default return so renders don't crash
    mockUseRouteNavigation.mockReturnValue({
      isNavigating: false,
      activeStepIndex: 0,
      currentStep: undefined,
    });
  });

  it("does NOT animate when not navigating", () => {
    mockUseRouteNavigation.mockReturnValue({
      isNavigating: false,
      activeStepIndex: 0,
      currentStep: undefined,
    });

    render(<CampusMap />);

    expect(mockAnimateCamera).not.toHaveBeenCalled();
  });

  it("animates camera when navigating + has target (heading is a number)", () => {
    let now = 10_000;
    jest.spyOn(Date, "now").mockImplementation(() => now);

    mockUseRouteNavigation.mockReturnValue({
      isNavigating: true,
      activeStepIndex: 0,
      currentStep: { end: { latitude: 45.5019, longitude: -73.5674 } },
    });

    render(<CampusMap />);

    expect(mockAnimateCamera).toHaveBeenCalledTimes(1);
    expect(mockAnimateCamera).toHaveBeenCalledWith(
      {
        center: mockUserLocation,
        zoom: 18,
        heading: expect.any(Number),
        pitch: 0,
      },
      { duration: 500 },
    );

    const heading = mockAnimateCamera.mock.calls[0][0].heading;
    expect(Number.isNaN(heading)).toBe(false);
  });

  it("uses heading=0 when there is no target (no currentStep end)", () => {
    let now = 10_000;
    jest.spyOn(Date, "now").mockImplementation(() => now);

    mockUseRouteNavigation.mockReturnValue({
      isNavigating: true,
      activeStepIndex: 0,
      currentStep: undefined,
    });

    render(<CampusMap />);

    expect(mockAnimateCamera).toHaveBeenCalledTimes(1);
    expect(mockAnimateCamera).toHaveBeenCalledWith(
      {
        center: mockUserLocation,
        zoom: 18,
        heading: 0,
        pitch: 0,
      },
      { duration: 500 },
    );
  });

  it("throttles camera updates (900ms rule)", () => {
    let now = 10_000;
    jest.spyOn(Date, "now").mockImplementation(() => now);

    // render #1 => animate once
    mockUseRouteNavigation.mockReturnValue({
      isNavigating: true,
      activeStepIndex: 0,
      currentStep: { end: { latitude: 45.5019, longitude: -73.5674 } },
    });

    const screen = render(<CampusMap />);
    expect(mockAnimateCamera).toHaveBeenCalledTimes(1);

    // render #2 within 900ms => should NOT animate again
    now += 500;
    mockUseRouteNavigation.mockReturnValue({
      isNavigating: true,
      activeStepIndex: 1, // dependency changes
      currentStep: { end: { latitude: 45.5019, longitude: -73.5674 } },
    });

    act(() => {
      screen.rerender(<CampusMap />);
    });

    expect(mockAnimateCamera).toHaveBeenCalledTimes(1);

    // render #3 after 900ms => should animate again
    now += 901;
    mockUseRouteNavigation.mockReturnValue({
      isNavigating: true,
      activeStepIndex: 2,
      currentStep: { end: { latitude: 45.5019, longitude: -73.5674 } },
    });

    act(() => {
      screen.rerender(<CampusMap />);
    });

    expect(mockAnimateCamera).toHaveBeenCalledTimes(2);
  });
});
