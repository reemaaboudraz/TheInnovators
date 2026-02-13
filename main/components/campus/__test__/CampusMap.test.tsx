/* eslint-disable import/first */
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

// -------------------- DATASETS (CampusMap imports JSON now) --------------------
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
    aliases: ["hall", "henry hall"],
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
    zoomCategory: 3,
    aliases: ["nop", "no polygon"],
    polygon: [],
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

// -------------------- UI Mocks --------------------
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: () =>
    Promise.resolve({ status: "denied" }),
  getCurrentPositionAsync: () =>
    Promise.resolve({ coords: { latitude: 0, longitude: 0 } }),
  getLastKnownPositionAsync: () => Promise.resolve(null),
  Accuracy: { Low: 2, Balanced: 3 },
}));

// ✅ IMPORTANT: CampusMap renders BuildingPopup, which uses @gorhom/bottom-sheet + Reanimated.
// Mock it so CampusMap tests don’t crash.
jest.mock("@/components/campus/BuildingPopup", () => {
  const ReactActual = jest.requireActual("react") as typeof React;
  const RN = jest.requireActual(
    "react-native",
  ) as typeof import("react-native");
  const { View, Text, Pressable } = RN;

  return {
    __esModule: true,
    default: function MockBuildingPopup(props: any) {
      return ReactActual.createElement(
        View,
        { testID: "buildingPopup" },
        ReactActual.createElement(
          Text,
          null,
          `Popup: ${props?.building?.code ?? "?"}`,
        ),
        ReactActual.createElement(
          Pressable,
          { testID: "closePopup", onPress: props.onClose },
          ReactActual.createElement(Text, null, "Close"),
        ),
      );
    },
  };
});

let mockOnLocationFound:
  | ((location: { latitude: number; longitude: number }) => void)
  | null = null;

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
      // ToggleButton styles (used by ToggleButton component)
      campusToggleContainer: {},
      campusToggleButton: {},
      campusToggleButtonLeft: {},
      campusToggleButtonRight: {},
      campusToggleSlider: {},
      campusToggleText: {},
      campusToggleTextActive: {},
      map: {},
    }),
  };
});

// -------------------- react-native-maps mock --------------------
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

// ✅ import AFTER mocks
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
    expect(map.props.initialRegion).toEqual(SGW_REGION);
  });
});

describe("CampusMap - search bar", () => {
  it("updates text and clears input", () => {
    const { getByPlaceholderText, getByTestId } = render(<CampusMap />);

    const input = getByPlaceholderText("Where to next?");
    act(() => {
      fireEvent.changeText(input, "hall");
    });
    expect(getByPlaceholderText("Where to next?").props.value).toBe("hall");

    act(() => {
      fireEvent.press(getByTestId("clearSearch"));
    });
    expect(getByPlaceholderText("Where to next?").props.value).toBe("");
  });
});

describe("CampusMap - suggestions", () => {
  it("shows suggestions for SGW + Loyola matches", async () => {
    const { getByPlaceholderText, findByText } = render(<CampusMap />);

    act(() => {
      fireEvent.changeText(getByPlaceholderText("Where to next?"), "ad");
    });
    expect(await findByText(/AD — Administration Building/i)).toBeTruthy();

    act(() => {
      fireEvent.changeText(getByPlaceholderText("Where to next?"), "hall");
    });
    expect(await findByText(/H — Henry F\. Hall Building/i)).toBeTruthy();
  });

  it("selecting a suggestion animates the map and updates the input", async () => {
    const { getByPlaceholderText, getByTestId, findByText } = render(
      <CampusMap />,
    );

    act(() => {
      fireEvent.changeText(getByPlaceholderText("Where to next?"), "admin");
    });
    await findByText(/AD — Administration Building/i);

    act(() => {
      fireEvent.press(getByTestId("suggestion-LOY-loy-ad"));
    });

    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);
    const [regionArg, durationArg] = mockAnimateToRegion.mock.calls[0];

    expect(durationArg).toBe(600);
    expect(regionArg).toEqual(
      expect.objectContaining({
        latitude: expect.any(Number),
        longitude: expect.any(Number),
        latitudeDelta: expect.any(Number),
        longitudeDelta: expect.any(Number),
      }),
    );

    expect(getByPlaceholderText("Where to next?").props.value).toMatch(
      /^AD - Administration Building/i,
    );
  });
});

describe("CampusMap - building shapes (Polygon/Marker)", () => {
  it("pressing a Polygon selects it + animates (and shows popup)", () => {
    const { getByTestId, queryByTestId } = render(<CampusMap />);

    const polygonId = "polygon-45.4581--73.6401";
    const poly = getByTestId(polygonId);

    act(() => {
      fireEvent.press(poly);
    });

    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);
    expect(queryByTestId("buildingPopup")).toBeTruthy();
  });

  it("pressing a Marker selects it + animates (and shows popup)", () => {
    const { getByTestId, queryByTestId } = render(<CampusMap />);

    const markerId = "marker-45.458--73.64";
    const marker = getByTestId(markerId);

    act(() => {
      fireEvent.press(marker);
    });

    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);
    expect(queryByTestId("buildingPopup")).toBeTruthy();
  });

  it("tapping on the map unselects the selected building (popup disappears)", () => {
    const { getByTestId, queryByTestId } = render(<CampusMap />);

    act(() => {
      fireEvent.press(getByTestId("marker-45.458--73.64"));
    });
    expect(queryByTestId("buildingPopup")).toBeTruthy();

    act(() => {
      fireEvent.press(getByTestId("mapView"));
    });
    expect(queryByTestId("buildingPopup")).toBeNull();
  });

  it("renders a building even when polygon is empty (marker exists)", () => {
    const { getByTestId } = render(<CampusMap />);
    expect(getByTestId("marker-45.4978--73.5795")).toBeTruthy();
  });

  it("selecting a building with empty polygon uses fixed deltas", () => {
    const { getByTestId } = render(<CampusMap />);

    act(() => {
      fireEvent.press(getByTestId("marker-45.4978--73.5795"));
    });

    expect(mockAnimateToRegion).toHaveBeenCalledWith(
      {
        latitude: 45.4978,
        longitude: -73.5795,
        latitudeDelta: 0.0025,
        longitudeDelta: 0.0025,
      },
      600,
    );
  });
});

describe("CampusMap - campus toggle", () => {
  it("renders the toggle buttons", () => {
    const { getByTestId } = render(<CampusMap />);
    expect(getByTestId("campusToggle")).toBeTruthy();
    expect(getByTestId("campusToggle-SGW")).toBeTruthy();
    expect(getByTestId("campusToggle-Loyola")).toBeTruthy();
  });

  it("pressing Loyola animates to Loyola region", () => {
    const { getByTestId } = render(<CampusMap />);

    act(() => {
      fireEvent.press(getByTestId("campusToggle-Loyola"));
    });

    expect(mockAnimateToRegion).toHaveBeenCalledWith(LOY_REGION, 500);
  });

  it("pressing SGW after Loyola animates to SGW region", () => {
    const { getByTestId } = render(<CampusMap />);

    act(() => {
      fireEvent.press(getByTestId("campusToggle-Loyola"));
    });
    mockAnimateToRegion.mockClear();

    act(() => {
      fireEvent.press(getByTestId("campusToggle-SGW"));
    });

    expect(mockAnimateToRegion).toHaveBeenCalledWith(SGW_REGION, 500);
  });

  it("BrandBar backgroundColor updates based on focused campus", () => {
    const { getByTestId } = render(<CampusMap />);

    expect(getByTestId("brandbar").props.backgroundColor).toBe("#912338");

    act(() => {
      fireEvent.press(getByTestId("campusToggle-Loyola"));
    });
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#e3ac20");

    act(() => {
      fireEvent.press(getByTestId("campusToggle-SGW"));
    });
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#912338");
  });

  it("selecting a Loyola building via suggestion updates focused campus to Loyola", async () => {
    const { getByPlaceholderText, getByTestId, findByText } = render(
      <CampusMap />,
    );

    act(() => {
      fireEvent.changeText(getByPlaceholderText("Where to next?"), "admin");
    });
    await findByText(/AD — Administration Building/i);

    act(() => {
      fireEvent.press(getByTestId("suggestion-LOY-loy-ad"));
    });

    expect(getByTestId("brandbar").props.backgroundColor).toBe("#e3ac20");
  });
});

describe("CampusMap - PanResponder helper functions", () => {
  describe("calculatePanValue", () => {
    it("returns 0 when on SGW with no drag", () => {
      expect(calculatePanValue("SGW", 0, 300)).toBe(0);
    });

    it("returns clamped value when dragging right from SGW", () => {
      expect(calculatePanValue("SGW", 75, 300)).toBe(0.5);
    });

    it("returns 1 when fully dragged right from SGW", () => {
      expect(calculatePanValue("SGW", 150, 300)).toBe(1);
    });

    it("clamps to 1 when dragged beyond right edge", () => {
      expect(calculatePanValue("SGW", 300, 300)).toBe(1);
    });

    it("clamps to 0 when dragged beyond left edge", () => {
      expect(calculatePanValue("SGW", -100, 300)).toBe(0);
    });

    it("returns value when dragging left from LOY", () => {
      expect(calculatePanValue("LOY", -75, 300)).toBe(0.5);
    });

    it("uses default width when toggleWidth is 0", () => {
      const result = calculatePanValue("SGW", 50, 0);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe("determineCampusFromPan", () => {
    it("returns SGW when finalValue <= 0.5 from SGW", () => {
      expect(determineCampusFromPan("SGW", 50, 300)).toBe("SGW");
    });

    it("returns LOY when finalValue > 0.5 from SGW", () => {
      expect(determineCampusFromPan("SGW", 100, 300)).toBe("LOY");
    });

    it("returns LOY when finalValue > 0.5 from LOY (small left drag)", () => {
      expect(determineCampusFromPan("LOY", -50, 300)).toBe("LOY");
    });

    it("returns SGW when finalValue <= 0.5 from LOY (large left drag)", () => {
      expect(determineCampusFromPan("LOY", -100, 300)).toBe("SGW");
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

describe("CampusMap - PanResponder handlers (captured from ToggleButton)", () => {
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
    jest.useFakeTimers();

    (RN.PanResponder.create as unknown) = (config: PanConfig) => {
      capturedConfig = config;
      return originalCreate(config as Parameters<typeof originalCreate>[0]);
    };
  });

  afterAll(() => {
    (RN.PanResponder.create as unknown) = originalCreate;
    jest.useRealTimers();
  });

  beforeEach(() => {
    capturedConfig = null;
    mockAnimateToRegion.mockClear();
  });

  it("onStartShouldSetPanResponder returns true", () => {
    render(<CampusMap />);
    expect(capturedConfig?.onStartShouldSetPanResponder?.()).toBe(true);
  });

  it("onMoveShouldSetPanResponder returns true when dx > 10", () => {
    render(<CampusMap />);
    expect(
      capturedConfig?.onMoveShouldSetPanResponder?.(null, { dx: 15 }),
    ).toBe(true);
  });

  it("onMoveShouldSetPanResponder returns false when dx <= 10", () => {
    render(<CampusMap />);
    expect(capturedConfig?.onMoveShouldSetPanResponder?.(null, { dx: 5 })).toBe(
      false,
    );
  });

  it("onPanResponderRelease switches to Loyola when dragged far right", () => {
    render(<CampusMap />);
    expect(capturedConfig).not.toBeNull();

    act(() => {
      capturedConfig?.onPanResponderRelease?.(null, { dx: 200 });
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockAnimateToRegion).toHaveBeenCalledWith(LOY_REGION, 500);
  });

  it("onPanResponderRelease stays on SGW when dragged slightly", () => {
    render(<CampusMap />);
    expect(capturedConfig).not.toBeNull();

    act(() => {
      capturedConfig?.onPanResponderRelease?.(null, { dx: 10 });
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockAnimateToRegion).not.toHaveBeenCalled();
  });
});

describe("CampusMap - Current Location button callback", () => {
  it("renders the current location button", () => {
    const { getByTestId } = render(<CampusMap />);
    expect(getByTestId("currentLocationButton")).toBeTruthy();
  });

  it("handleLocationFound animates map to user location", () => {
    render(<CampusMap />);
    expect(mockOnLocationFound).not.toBeNull();

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
});
