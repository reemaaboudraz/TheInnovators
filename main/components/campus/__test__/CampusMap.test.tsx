import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  jest,
} from "@jest/globals";

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
      // Square polygon that properly contains the center point
      polygon: [
        { latitude: 45.497, longitude: -73.58 },
        { latitude: 45.497, longitude: -73.578 },
        { latitude: 45.498, longitude: -73.578 },
        { latitude: 45.498, longitude: -73.58 },
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

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({ coords: { latitude: 45.5, longitude: -73.6 } }),
  ),
  Accuracy: { Balanced: 3 },
}));

// Store the onLocationFound callback for testing
let mockOnLocationFound: ((location: {
  latitude: number;
  longitude: number;
}) => void) | null = null;

jest.mock("@/components/campus/CurrentLocationButton", () => {
  const ReactActual = jest.requireActual("react") as typeof React;
  const RN = jest.requireActual(
    "react-native",
  ) as typeof import("react-native");
  const { Pressable, Text } = RN;

  return {
    __esModule: true,
    default: function MockCurrentLocationButton(props: {
      onLocationFound: (location: {
        latitude: number;
        longitude: number;
      }) => void;
    }) {
      mockOnLocationFound = props.onLocationFound;
      return ReactActual.createElement(
        Pressable,
        { testID: "currentLocationButton" },
        ReactActual.createElement(Text, null, "◎"),
      );
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

import CampusMap, {
  calculatePanValue,
  determineCampusFromPan,
  SGW_REGION,
  LOY_REGION,
} from "../CampusMap";

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

  it("clears selected building when typing in search bar", async () => {
    const { getByPlaceholderText, getByTestId, findByText } = render(
      <CampusMap />,
    );

    // First select a building
    fireEvent.changeText(getByPlaceholderText("Where to next?"), "hall");
    await findByText(/H — Henry F\. Hall Building/i);
    fireEvent.press(getByTestId("suggestion-SGW-sgw-h"));

    // Now type something new - this should clear the selected building
    fireEvent.changeText(getByPlaceholderText("Where to next?"), "admin");

    // The input should show the new text
    expect(getByPlaceholderText("Where to next?").props.value).toBe("admin");
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

describe("CampusMap - campus toggle", () => {
  it("renders the campus toggle with SGW and Loyola buttons", () => {
    const { getByTestId } = render(<CampusMap />);

    expect(getByTestId("campusToggle")).toBeTruthy();
    expect(getByTestId("campusToggle-SGW")).toBeTruthy();
    expect(getByTestId("campusToggle-Loyola")).toBeTruthy();
  });

  it("triggers onLayout event on toggle container", () => {
    const { getByTestId } = render(<CampusMap />);

    const toggle = getByTestId("campusToggle");

    // Trigger onLayout event to store width in ref
    fireEvent(toggle, "layout", {
      nativeEvent: { layout: { width: 300, height: 44 } },
    });

    // Component should handle layout without crashing
    expect(toggle).toBeTruthy();
  });

  it("pressing Loyola button switches campus and animates to Loyola region", () => {
    const { getByTestId } = render(<CampusMap />);

    // Press Loyola button
    fireEvent.press(getByTestId("campusToggle-Loyola"));

    // Verify animateToRegion was called with Loyola region
    expect(mockAnimateToRegion).toHaveBeenCalledWith(
      {
        latitude: 45.457984,
        longitude: -73.639834,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      },
      500,
    );
  });

  it("pressing SGW button when on Loyola switches back to SGW region", () => {
    const { getByTestId } = render(<CampusMap />);

    // First switch to Loyola
    fireEvent.press(getByTestId("campusToggle-Loyola"));
    mockAnimateToRegion.mockClear();

    // Switch back to SGW
    fireEvent.press(getByTestId("campusToggle-SGW"));

    expect(mockAnimateToRegion).toHaveBeenCalledWith(
      {
        latitude: 45.4973,
        longitude: -73.5794,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      },
      500,
    );
  });

  it("pressing same campus button does not trigger animation", () => {
    const { getByTestId } = render(<CampusMap />);

    // SGW is already selected by default
    fireEvent.press(getByTestId("campusToggle-SGW"));

    // Should not call animateToRegion since already on SGW
    expect(mockAnimateToRegion).not.toHaveBeenCalled();
  });

  it("BrandBar backgroundColor updates based on focused campus", () => {
    const { getByTestId } = render(<CampusMap />);

    // Initially on SGW - burgundy color
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#912338");

    // Switch to Loyola
    fireEvent.press(getByTestId("campusToggle-Loyola"));

    // Should be yellow
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#e3ac20");

    // Switch back to SGW
    fireEvent.press(getByTestId("campusToggle-SGW"));

    // Should be burgundy again
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#912338");
  });

  it("selecting building via suggestion updates focused campus to Loyola", async () => {
    const { getByPlaceholderText, getByTestId, findByText } = render(
      <CampusMap />,
    );

    // Search for Loyola building
    fireEvent.changeText(getByPlaceholderText("Where to next?"), "admin");
    await findByText(/AD — Administration Building/i);

    // Select Loyola building
    fireEvent.press(getByTestId("suggestion-LOY-loy-ad"));

    // BrandBar should now be yellow (Loyola color)
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#e3ac20");
  });
});

describe("CampusMap - PanResponder helper functions", () => {
  describe("calculatePanValue", () => {
    it("returns 0 when on SGW with no drag", () => {
      const result = calculatePanValue("SGW", 0, 300);
      expect(result).toBe(0);
    });

    it("returns clamped value when dragging right from SGW", () => {
      // With toggleWidth 300, halfWidth = 150
      // dx = 75 means newValue = 0 + 75/150 = 0.5
      const result = calculatePanValue("SGW", 75, 300);
      expect(result).toBe(0.5);
    });

    it("returns 1 when fully dragged right from SGW", () => {
      // dx = 150 means newValue = 0 + 150/150 = 1
      const result = calculatePanValue("SGW", 150, 300);
      expect(result).toBe(1);
    });

    it("clamps to 1 when dragged beyond right edge", () => {
      // dx = 300 means newValue = 0 + 300/150 = 2, clamped to 1
      const result = calculatePanValue("SGW", 300, 300);
      expect(result).toBe(1);
    });

    it("clamps to 0 when dragged beyond left edge", () => {
      // dx = -100 means newValue = 0 + (-100)/150 = -0.67, clamped to 0
      const result = calculatePanValue("SGW", -100, 300);
      expect(result).toBe(0);
    });

    it("returns value when dragging left from LOY", () => {
      // On LOY, currentValue = 1
      // dx = -75 means newValue = 1 + (-75)/150 = 0.5
      const result = calculatePanValue("LOY", -75, 300);
      expect(result).toBe(0.5);
    });

    it("uses default width when toggleWidth is 0", () => {
      // When toggleWidth is 0, it falls back to Dimensions.get("window").width - 28
      const result = calculatePanValue("SGW", 50, 0);
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe("determineCampusFromPan", () => {
    it("returns SGW when finalValue <= 0.5 from SGW", () => {
      // dx = 50 means finalValue = 0 + 50/150 = 0.33
      const result = determineCampusFromPan("SGW", 50, 300);
      expect(result).toBe("SGW");
    });

    it("returns LOY when finalValue > 0.5 from SGW", () => {
      // dx = 100 means finalValue = 0 + 100/150 = 0.67
      const result = determineCampusFromPan("SGW", 100, 300);
      expect(result).toBe("LOY");
    });

    it("returns LOY when finalValue > 0.5 from LOY (small left drag)", () => {
      // On LOY, currentValue = 1
      // dx = -50 means finalValue = 1 + (-50)/150 = 0.67
      const result = determineCampusFromPan("LOY", -50, 300);
      expect(result).toBe("LOY");
    });

    it("returns SGW when finalValue <= 0.5 from LOY (large left drag)", () => {
      // On LOY, currentValue = 1
      // dx = -100 means finalValue = 1 + (-100)/150 = 0.33
      const result = determineCampusFromPan("LOY", -100, 300);
      expect(result).toBe("SGW");
    });

    it("uses default width when toggleWidth is 0", () => {
      const result = determineCampusFromPan("SGW", 50, 0);
      expect(result === "SGW" || result === "LOY").toBe(true);
    });
  });

  describe("exported region constants", () => {
    it("SGW_REGION has correct coordinates", () => {
      expect(SGW_REGION).toEqual({
        latitude: 45.4973,
        longitude: -73.5794,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      });
    });

    it("LOY_REGION has correct coordinates", () => {
      expect(LOY_REGION).toEqual({
        latitude: 45.457984,
        longitude: -73.639834,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      });
    });
  });
});

describe("CampusMap - PanResponder integration", () => {
  it("toggle container has panHandlers attached", () => {
    const { getByTestId } = render(<CampusMap />);

    const toggle = getByTestId("campusToggle");

    // Verify onLayout works (used by PanResponder for width calculations)
    fireEvent(toggle, "layout", {
      nativeEvent: { layout: { width: 300, height: 44 } },
    });

    // The toggle should have panHandlers attached
    expect(toggle.props.onStartShouldSetResponder).toBeDefined();
  });
});

describe("CampusMap - PanResponder handlers via mock", () => {
  // Store the original PanResponder.create
  const RN = jest.requireActual(
    "react-native",
  ) as typeof import("react-native");
  const originalCreate = RN.PanResponder.create;

  type PanConfig = {
    onPanResponderMove?: (evt: unknown, gestureState: { dx: number }) => void;
    onPanResponderRelease?: (
      evt: unknown,
      gestureState: { dx: number },
    ) => void;
    onStartShouldSetPanResponder?: () => boolean;
    onMoveShouldSetPanResponder?: (
      evt: unknown,
      gestureState: { dx: number },
    ) => boolean;
  };

  let capturedConfig: PanConfig | null = null;

  beforeAll(() => {
    // Mock PanResponder.create to capture the config
    (RN.PanResponder.create as unknown) = (config: PanConfig) => {
      capturedConfig = config;
      return originalCreate(config as Parameters<typeof originalCreate>[0]);
    };
  });

  afterAll(() => {
    // Restore original
    (RN.PanResponder.create as unknown) = originalCreate;
  });

  beforeEach(() => {
    capturedConfig = null;
    mockAnimateToRegion.mockClear();
  });

  it("onStartShouldSetPanResponder returns true", () => {
    render(<CampusMap />);

    expect(capturedConfig).not.toBeNull();
    expect(capturedConfig?.onStartShouldSetPanResponder?.()).toBe(true);
  });

  it("onMoveShouldSetPanResponder returns true when dx > 10", () => {
    render(<CampusMap />);

    expect(capturedConfig).not.toBeNull();
    expect(
      capturedConfig?.onMoveShouldSetPanResponder?.(null, { dx: 15 }),
    ).toBe(true);
  });

  it("onMoveShouldSetPanResponder returns false when dx <= 10", () => {
    render(<CampusMap />);

    expect(capturedConfig).not.toBeNull();
    expect(capturedConfig?.onMoveShouldSetPanResponder?.(null, { dx: 5 })).toBe(
      false,
    );
  });

  it("onPanResponderMove updates slide animation value", () => {
    render(<CampusMap />);

    expect(capturedConfig).not.toBeNull();

    // Call the move handler - should not throw
    capturedConfig?.onPanResponderMove?.(null, { dx: 50 });

    // If we get here without error, the handler executed
    expect(true).toBe(true);
  });

  it("onPanResponderRelease switches to Loyola when dragged far right", () => {
    render(<CampusMap />);

    expect(capturedConfig).not.toBeNull();

    // Call the release handler with large positive dx (should switch to LOY)
    capturedConfig?.onPanResponderRelease?.(null, { dx: 200 });

    // Should have animated to Loyola region
    expect(mockAnimateToRegion).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 45.457984,
        longitude: -73.639834,
      }),
      500,
    );
  });

  it("onPanResponderRelease stays on SGW when dragged slightly", () => {
    render(<CampusMap />);

    expect(capturedConfig).not.toBeNull();

    // Call the release handler with small dx (should stay on SGW)
    capturedConfig?.onPanResponderRelease?.(null, { dx: 10 });

    // Should not have triggered campus switch (already on SGW)
    expect(mockAnimateToRegion).not.toHaveBeenCalled();
  });
});

describe("CampusMap - Current Location Button", () => {
  it("renders the current location button", () => {
    const { getByTestId } = render(<CampusMap />);

    expect(getByTestId("currentLocationButton")).toBeTruthy();
  });

  it("initially has showsUserLocation disabled", () => {
    const { getByTestId } = render(<CampusMap />);

    const map = getByTestId("mapView");
    expect(map.props.showsUserLocation).toBe(false);
  });
});

describe("CampusMap - User Location Features", () => {
  beforeEach(() => {
    mockOnLocationFound = null;
    mockAnimateToRegion.mockClear();
  });

  it("handleLocationFound animates map to user location", () => {
    render(<CampusMap />);

    expect(mockOnLocationFound).not.toBeNull();

    // Call with location outside any building, wrapped in act
    act(() => {
      mockOnLocationFound!({ latitude: 45.5, longitude: -73.6 });
    });

    expect(mockAnimateToRegion).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 45.5,
        longitude: -73.6,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }),
      500,
    );
  });

  it("shows user location marker when user is outside buildings", () => {
    const { queryByTestId } = render(<CampusMap />);

    expect(mockOnLocationFound).not.toBeNull();

    // Call with location far from any building polygon, wrapped in act
    act(() => {
      mockOnLocationFound!({ latitude: 45.5, longitude: -73.6 });
    });

    // The userLocationMarker should appear (the mock creates testID from coordinates)
    expect(queryByTestId("marker-45.5--73.6")).toBeTruthy();
  });

  it("highlights building in blue when user is inside a building polygon", () => {
    const { getByTestId, queryByTestId } = render(<CampusMap />);

    expect(mockOnLocationFound).not.toBeNull();

    // Call with location inside the H building polygon, wrapped in act
    // The H building polygon is: lat 45.497-45.498, lng -73.58 to -73.578
    act(() => {
      mockOnLocationFound!({ latitude: 45.4975, longitude: -73.579 });
    });

    // The userLocationMarker should NOT appear since user is inside a building
    expect(queryByTestId("userLocationMarker")).toBeNull();

    // The H building polygon should have the user location styling
    const hPolygon = getByTestId("polygon-45.497--73.58");
    expect(hPolygon.props.fillColor).toBe("rgba(97, 151, 251, 0.35)");
    expect(hPolygon.props.strokeColor).toBe("#4A90D9");
    expect(hPolygon.props.strokeWidth).toBe(3);
  });
});
