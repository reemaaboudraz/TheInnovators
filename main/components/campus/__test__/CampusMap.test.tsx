/* eslint-disable import/first */
import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";

// RN StatusBar / internals in tests can call clearImmediate in some environments
if (!(global as any).clearImmediate) {
  (global as any).clearImmediate = (
      fn: (...args: any[]) => void,
      ...args: any[]
  ) => setTimeout(fn, 0, ...args);
}

const mockAnimateToRegion = jest.fn();

// -------------------- DATASETS --------------------
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

// -------------------- Shared captured PanResponder config --------------------
type PanConfig = {
  onPanResponderMove?: (evt: unknown, gestureState: { dx: number }) => void;
  onPanResponderRelease?: (evt: unknown, gestureState: { dx: number }) => void;
  onStartShouldSetPanResponder?: () => boolean;
  onMoveShouldSetPanResponder?: (
      evt: unknown,
      gestureState: { dx: number },
  ) => boolean;
};

let mockCapturedPanConfig: PanConfig | null = null;

// -------------------- ToggleButton mock --------------------
jest.mock("@/components/campus/ToggleButton", () => {
  const ReactActual = jest.requireActual("react") as typeof React;
  const RN = jest.requireActual(
      "react-native",
  ) as typeof import("react-native");
  const { View, Pressable, Text, PanResponder } = RN;

  const calculatePanValue = (
      currentCampus: "SGW" | "LOY",
      dx: number,
      toggleWidth: number,
  ) => {
    const safeWidth = toggleWidth > 0 ? toggleWidth : 300;
    const half = safeWidth / 2;
    const base = currentCampus === "SGW" ? 0 : 1;
    const delta = dx / half;
    const next = base + delta;
    return Math.max(0, Math.min(1, next));
  };

  const determineCampusFromPan = (
      currentCampus: "SGW" | "LOY",
      dx: number,
      toggleWidth: number,
  ) => {
    const finalValue = calculatePanValue(currentCampus, dx, toggleWidth);
    return finalValue > 0.5 ? "LOY" : "SGW";
  };

  function MockToggleButton(props: {
    focusedCampus: "SGW" | "LOY";
    onCampusChange: (campus: "SGW" | "LOY") => void;
  }) {
    mockCapturedPanConfig = {
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, g) => Math.abs(g.dx) > 10,
      onPanResponderMove: () => {},
      onPanResponderRelease: (_evt, g) => {
        const next = determineCampusFromPan(props.focusedCampus, g.dx, 300);
        if (next !== props.focusedCampus) props.onCampusChange(next);
      },
    };

    const panResponder = PanResponder.create(mockCapturedPanConfig);

    return ReactActual.createElement(
        View,
        { testID: "campusToggle", ...(panResponder?.panHandlers ?? {}) },
        ReactActual.createElement(
            Pressable,
            {
              testID: "campusToggle-SGW",
              onPress: () => props.onCampusChange("SGW"),
            },
            ReactActual.createElement(Text, null, "SGW"),
        ),
        ReactActual.createElement(
            Pressable,
            {
              testID: "campusToggle-Loyola",
              onPress: () => props.onCampusChange("LOY"),
            },
            ReactActual.createElement(Text, null, "Loyola"),
        ),
    );
  }

  return {
    __esModule: true,
    default: MockToggleButton,
    calculatePanValue,
    determineCampusFromPan,
  };
});

// -------------------- BuildingPopup mock --------------------
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
      onLocationFound: (location: { latitude: number; longitude: number }) => void;
    }) {
      mockOnLocationFound = props.onLocationFound;
      return ReactActual.createElement(
          Pressable,
          {
            testID: "currentLocationButton",
            onPress: () => {
              props.onLocationFound({ latitude: 45.5, longitude: -73.6 });
            },
          },
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
      map: {},
      browseSearchCard: {},
      browseSearchIcon: {},
      browseSearchInput: {},
      browseClearButton: {},
      browseClearText: {},
      directionsFab: {},
      directionsFabText: {},
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
  mockCapturedPanConfig = null;
  mockOnLocationFound = null;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("CampusMap - initial region", () => {
  it("uses SGW region as initialRegion", () => {
    const { getByTestId } = render(<CampusMap />);
    const map = getByTestId("mapView");
    expect(map.props.initialRegion).toEqual(SGW_REGION);
  });
});

describe("CampusMap - browse search bar", () => {
  it("updates text and clears input", () => {
    const { getByPlaceholderText, getByTestId } = render(<CampusMap />);

    const input = getByPlaceholderText("Where to next?");
    fireEvent.changeText(input, "hall");
    expect(getByPlaceholderText("Where to next?").props.value).toBe("hall");

    fireEvent.press(getByTestId("clearSearch"));
    expect(getByPlaceholderText("Where to next?").props.value).toBe("");
  });
});

describe("CampusMap - browse suggestions", () => {
  it("shows suggestions for SGW + Loyola matches", async () => {
    const { getByPlaceholderText, findByText } = render(<CampusMap />);

    fireEvent.changeText(getByPlaceholderText("Where to next?"), "ad");
    expect(await findByText(/AD — Administration Building/i)).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText("Where to next?"), "hall");
    expect(await findByText(/H — Henry F\. Hall Building/i)).toBeTruthy();
  });

  it("selecting a suggestion animates the map and updates input", async () => {
    const { getByPlaceholderText, getByTestId, findByText } = render(
        <CampusMap />,
    );

    fireEvent.changeText(getByPlaceholderText("Where to next?"), "admin");
    await findByText(/AD — Administration Building/i);

    fireEvent.press(getByTestId("suggestion-LOY-loy-ad"));

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

describe("CampusMap - building selection layer", () => {
  it("pressing a Polygon selects it + animates + popup shows", () => {
    const { getByTestId, queryByTestId } = render(<CampusMap />);

    fireEvent.press(getByTestId("polygon-45.4581--73.6401"));

    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);
    expect(queryByTestId("buildingPopup")).toBeTruthy();
  });

  it("pressing a Marker selects it + animates + popup shows", () => {
    const { getByTestId, queryByTestId } = render(<CampusMap />);

    fireEvent.press(getByTestId("marker-45.458--73.64"));

    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);
    expect(queryByTestId("buildingPopup")).toBeTruthy();
  });

  it("map press unselects current building in browse mode", () => {
    const { getByTestId, queryByTestId } = render(<CampusMap />);

    fireEvent.press(getByTestId("marker-45.458--73.64"));
    expect(queryByTestId("buildingPopup")).toBeTruthy();

    fireEvent(getByTestId("mapView"), "press", {
      nativeEvent: {
        coordinate: { latitude: 45.497, longitude: -73.579 },
      },
    });

    expect(queryByTestId("buildingPopup")).toBeNull();
  });

  it("building with empty polygon still selectable by marker", () => {
    const { getByTestId } = render(<CampusMap />);
    expect(getByTestId("marker-45.4978--73.5795")).toBeTruthy();
  });

  it("empty-polygon building uses fixed delta zoom", () => {
    const { getByTestId } = render(<CampusMap />);

    fireEvent.press(getByTestId("marker-45.4978--73.5795"));

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

describe("CampusMap - campus toggle + brand bar", () => {
  it("renders toggle buttons", () => {
    const { getByTestId } = render(<CampusMap />);
    expect(getByTestId("campusToggle")).toBeTruthy();
    expect(getByTestId("campusToggle-SGW")).toBeTruthy();
    expect(getByTestId("campusToggle-Loyola")).toBeTruthy();
  });

  it("press Loyola -> animates to Loyola", () => {
    const { getByTestId } = render(<CampusMap />);
    fireEvent.press(getByTestId("campusToggle-Loyola"));
    expect(mockAnimateToRegion).toHaveBeenCalledWith(LOY_REGION, 500);
  });

  it("press SGW after Loyola -> animates to SGW", () => {
    const { getByTestId } = render(<CampusMap />);
    fireEvent.press(getByTestId("campusToggle-Loyola"));
    mockAnimateToRegion.mockClear();
    fireEvent.press(getByTestId("campusToggle-SGW"));
    expect(mockAnimateToRegion).toHaveBeenCalledWith(SGW_REGION, 500);
  });

  it("BrandBar color follows focused campus", () => {
    const { getByTestId } = render(<CampusMap />);

    expect(getByTestId("brandbar").props.backgroundColor).toBe("#912338");
    fireEvent.press(getByTestId("campusToggle-Loyola"));
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#e3ac20");
    fireEvent.press(getByTestId("campusToggle-SGW"));
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#912338");
  });
});

describe("CampusMap - helper exports", () => {
  describe("calculatePanValue", () => {
    it("returns 0 when SGW and no drag", () => {
      expect(calculatePanValue("SGW", 0, 300)).toBe(0);
    });

    it("returns 0.5 when dragging right by 75 from SGW with width 300", () => {
      expect(calculatePanValue("SGW", 75, 300)).toBe(0.5);
    });

    it("returns 1 when SGW dragged right by 150", () => {
      expect(calculatePanValue("SGW", 150, 300)).toBe(1);
    });

    it("clamps >1 and <0", () => {
      expect(calculatePanValue("SGW", 300, 300)).toBe(1);
      expect(calculatePanValue("SGW", -100, 300)).toBe(0);
    });

    it("works from LOY to left", () => {
      expect(calculatePanValue("LOY", -75, 300)).toBe(0.5);
    });

    it("uses safe default width when width=0", () => {
      const result = calculatePanValue("SGW", 50, 0);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe("determineCampusFromPan", () => {
    it("SGW -> SGW when <=0.5", () => {
      expect(determineCampusFromPan("SGW", 50, 300)).toBe("SGW");
    });

    it("SGW -> LOY when >0.5", () => {
      expect(determineCampusFromPan("SGW", 100, 300)).toBe("LOY");
    });

    it("LOY small left drag stays LOY", () => {
      expect(determineCampusFromPan("LOY", -50, 300)).toBe("LOY");
    });

    it("LOY large left drag goes SGW", () => {
      expect(determineCampusFromPan("LOY", -100, 300)).toBe("SGW");
    });

    it("width=0 fallback", () => {
      const result = determineCampusFromPan("SGW", 50, 0);
      expect(result === "SGW" || result === "LOY").toBe(true);
    });
  });

  describe("region constants", () => {
    it("SGW_REGION exact", () => {
      expect(SGW_REGION).toEqual({
        latitude: 45.4973,
        longitude: -73.5794,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      });
    });

    it("LOY_REGION exact", () => {
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
  it("onStartShouldSetPanResponder returns true", () => {
    render(<CampusMap />);
    expect(mockCapturedPanConfig?.onStartShouldSetPanResponder?.()).toBe(true);
  });

  it("onMoveShouldSetPanResponder true when dx > 10", () => {
    render(<CampusMap />);
    expect(
        mockCapturedPanConfig?.onMoveShouldSetPanResponder?.(null, { dx: 15 }),
    ).toBe(true);
  });

  it("onMoveShouldSetPanResponder false when dx <= 10", () => {
    render(<CampusMap />);
    expect(
        mockCapturedPanConfig?.onMoveShouldSetPanResponder?.(null, { dx: 5 }),
    ).toBe(false);
  });

  it("onPanResponderRelease switches to Loyola when dragged far right", () => {
    render(<CampusMap />);
    expect(mockCapturedPanConfig).not.toBeNull();

    act(() => {
      mockCapturedPanConfig?.onPanResponderRelease?.(null, { dx: 200 });
    });

    expect(mockAnimateToRegion).toHaveBeenCalledWith(LOY_REGION, 500);
  });

  it("onPanResponderRelease stays on SGW when drag is small", () => {
    render(<CampusMap />);
    expect(mockCapturedPanConfig).not.toBeNull();

    act(() => {
      mockCapturedPanConfig?.onPanResponderRelease?.(null, { dx: 10 });
    });

    expect(mockAnimateToRegion).not.toHaveBeenCalled();
  });
});

describe("CampusMap - current location callback", () => {
  it("renders location button", () => {
    const { getByTestId } = render(<CampusMap />);
    expect(getByTestId("currentLocationButton")).toBeTruthy();
  });

  it("handleLocationFound animates map to user location", () => {
    render(<CampusMap />);
    expect(mockOnLocationFound).not.toBeNull();

    act(() => {
      mockOnLocationFound?.({ latitude: 45.5, longitude: -73.6 });
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
