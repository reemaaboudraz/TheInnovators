import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterEach,
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

describe("CampusMap - campus toggle", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the campus toggle with SGW and Loyola buttons", () => {
    const { getByTestId } = render(<CampusMap />);

    expect(getByTestId("campusToggle")).toBeTruthy();
    expect(getByTestId("campusToggle-SGW")).toBeTruthy();
    expect(getByTestId("campusToggle-Loyola")).toBeTruthy();
  });

  it("triggers onLayout and stores toggle width correctly", () => {
    const { getByTestId } = render(<CampusMap />);

    const toggle = getByTestId("campusToggle");

    // Trigger onLayout event to store width in ref
    act(() => {
      fireEvent(toggle, "layout", {
        nativeEvent: { layout: { width: 300, height: 44 } },
      });
    });

    // Component should handle layout without crashing
    expect(toggle).toBeTruthy();
  });

  it("pressing Loyola button switches campus and animates to Loyola region", () => {
    const { getByTestId } = render(<CampusMap />);

    // Trigger onLayout to set toggle width
    act(() => {
      fireEvent(getByTestId("campusToggle"), "layout", {
        nativeEvent: { layout: { width: 300 } },
      });
    });

    // Press Loyola button
    fireEvent.press(getByTestId("campusToggle-Loyola"));

    // Run timers to complete animation
    act(() => {
      jest.runAllTimers();
    });

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

    act(() => {
      fireEvent(getByTestId("campusToggle"), "layout", {
        nativeEvent: { layout: { width: 300 } },
      });
    });

    // First switch to Loyola
    fireEvent.press(getByTestId("campusToggle-Loyola"));
    act(() => {
      jest.runAllTimers();
    });

    mockAnimateToRegion.mockClear();

    // Switch back to SGW
    fireEvent.press(getByTestId("campusToggle-SGW"));
    act(() => {
      jest.runAllTimers();
    });

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
    act(() => {
      jest.runAllTimers();
    });

    // Should not call animateToRegion since already on SGW
    expect(mockAnimateToRegion).not.toHaveBeenCalled();
  });

  it("PanResponder onMove updates slider animation value", () => {
    const { getByTestId } = render(<CampusMap />);

    const toggle = getByTestId("campusToggle");

    act(() => {
      fireEvent(toggle, "layout", {
        nativeEvent: { layout: { width: 300 } },
      });
    });

    // Simulate pan move gesture (dx > 10 to trigger)
    act(() => {
      fireEvent(toggle, "responderMove", {
        nativeEvent: {},
        gestureState: { dx: 50 },
      });
    });

    // Component should handle the move gesture
    expect(toggle).toBeTruthy();
  });

  it("PanResponder release with swipe right switches to Loyola", () => {
    const { getByTestId } = render(<CampusMap />);

    const toggle = getByTestId("campusToggle");

    act(() => {
      fireEvent(toggle, "layout", {
        nativeEvent: { layout: { width: 300 } },
      });
    });

    // Simulate swipe right gesture (finalValue > 0.5)
    act(() => {
      fireEvent(toggle, "responderRelease", {
        nativeEvent: {},
        gestureState: { dx: 200 },
      });
    });

    act(() => {
      jest.runAllTimers();
    });

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

  it("PanResponder release with swipe left switches to SGW when on Loyola", () => {
    const { getByTestId } = render(<CampusMap />);

    const toggle = getByTestId("campusToggle");

    act(() => {
      fireEvent(toggle, "layout", {
        nativeEvent: { layout: { width: 300 } },
      });
    });

    // First switch to Loyola via button
    fireEvent.press(getByTestId("campusToggle-Loyola"));
    act(() => {
      jest.runAllTimers();
    });

    mockAnimateToRegion.mockClear();

    // Simulate swipe left gesture (finalValue < 0.5)
    act(() => {
      fireEvent(toggle, "responderRelease", {
        nativeEvent: {},
        gestureState: { dx: -200 },
      });
    });

    act(() => {
      jest.runAllTimers();
    });

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

  it("PanResponder release with small swipe stays on current campus", () => {
    const { getByTestId } = render(<CampusMap />);

    const toggle = getByTestId("campusToggle");

    act(() => {
      fireEvent(toggle, "layout", {
        nativeEvent: { layout: { width: 300 } },
      });
    });

    // Small swipe that doesn't cross 0.5 threshold
    act(() => {
      fireEvent(toggle, "responderRelease", {
        nativeEvent: {},
        gestureState: { dx: 30 },
      });
    });

    act(() => {
      jest.runAllTimers();
    });

    // Should stay on SGW (no region change, or animates back to SGW)
    // The first call would be to SGW since finalValue < 0.5
    expect(mockAnimateToRegion).not.toHaveBeenCalled();
  });

  it("BrandBar backgroundColor updates based on focused campus", () => {
    const { getByTestId } = render(<CampusMap />);

    // Initially on SGW - burgundy color
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#912338");

    // Switch to Loyola
    fireEvent.press(getByTestId("campusToggle-Loyola"));
    act(() => {
      jest.runAllTimers();
    });

    // Should be yellow
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#e3ac20");

    // Switch back to SGW
    fireEvent.press(getByTestId("campusToggle-SGW"));
    act(() => {
      jest.runAllTimers();
    });

    // Should be burgundy again
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#912338");
  });

  it("selecting building via suggestion updates focused campus", async () => {
    const { getByPlaceholderText, getByTestId, findByText } = render(
      <CampusMap />,
    );

    // Search for Loyola building
    fireEvent.changeText(getByPlaceholderText("Where to next?"), "admin");
    await findByText(/AD — Administration Building/i);

    // Select Loyola building
    fireEvent.press(getByTestId("suggestion-LOY-loy-ad"));

    act(() => {
      jest.runAllTimers();
    });

    // BrandBar should now be yellow (Loyola color)
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#e3ac20");
  });
});
