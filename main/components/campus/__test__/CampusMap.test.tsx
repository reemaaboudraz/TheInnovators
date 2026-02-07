/* eslint-disable import/first, react/display-name, @typescript-eslint/no-require-imports */
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAnimateToRegion = jest.fn();

// ✅ Fix Safe Area crash when BuildingPopup renders after selecting a building
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

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
      polygon: [],
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

// ✅ Make BottomSheet safe in Jest (prevents native crashes)
jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View } = require("react-native");

  const BottomSheet = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      snapToIndex: jest.fn(),
      close: jest.fn(),
    }));
    return <View testID="bottomSheet">{props.children}</View>;
  });

  (BottomSheet as any).displayName = "BottomSheet";

  const BottomSheetScrollView = (props: any) => (
    <View testID="bottomSheetScroll">{props.children}</View>
  );

  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetScrollView,
  };
});

// ✅ Avoid asset / lookup issues inside BuildingPopup
jest.mock("@/components/Buildings/details/buildingImages", () => ({
  BUILDING_IMAGES: {
    H: 123, // truthy => covers thumbSource branch
  },
}));

jest.mock("@/components/Buildings/details/buildingIcons", () => ({
  BUILDING_ICONS: {
    metro: 1,
    connectedBuildings: 2,
    entry: 3,
    wifi: 4,
    elevator: 5,
  },
}));

import CampusMap, {
  calculatePanValue,
  determineCampusFromPan,
  SGW_REGION,
  LOY_REGION,
} from "../CampusMap";

import BuildingPopup from "@/components/campus/BuildingPopup";
import BuildingPin from "@/components/campus/BuildingPin";

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

    fireEvent.changeText(getByPlaceholderText("Where to next?"), "hall");
    await findByText(/H — Henry F\. Hall Building/i);
    fireEvent.press(getByTestId("suggestion-SGW-sgw-h"));

    fireEvent.changeText(getByPlaceholderText("Where to next?"), "admin");
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

    // Your component uses " - " in setQuery(`${code} - ${name}`)
    expect(getByPlaceholderText("Where to next?").props.value).toMatch(
      /^AD\s-\sAdministration Building/i,
    );
  });
});

describe("CampusMap - building shapes (Polygon/Marker)", () => {
  it("pressing a Polygon selects it (strokeWidth/fillColor change) + animates", () => {
    const { getByTestId } = render(<CampusMap />);

    // ✅ IMPORTANT: your mock uses `polygon-${lat}-${lng}` (no extra hyphen)
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

    // ✅ Marker id format: `marker-${lat}-${lng}`
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

  it("renders a building even when polygon is empty (no Polygon)", () => {
    const { getByTestId } = render(<CampusMap />);
    expect(getByTestId("marker-45.4978--73.5795")).toBeTruthy();
  });
});

describe("CampusMap - campus toggle", () => {
  it("renders the campus toggle with SGW and Loyola buttons", () => {
    const { getByTestId } = render(<CampusMap />);

    expect(getByTestId("campusToggle")).toBeTruthy();
    expect(getByTestId("campusToggle-SGW")).toBeTruthy();
    expect(getByTestId("campusToggle-Loyola")).toBeTruthy();
  });

  it("pressing Loyola button switches campus and animates to Loyola region", () => {
    const { getByTestId } = render(<CampusMap />);

    fireEvent.press(getByTestId("campusToggle-Loyola"));

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

  it("pressing SGW button after Loyola switches back to SGW region", () => {
    const { getByTestId } = render(<CampusMap />);

    fireEvent.press(getByTestId("campusToggle-Loyola"));
    mockAnimateToRegion.mockClear();

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

  // ✅ FIX: ToggleButton likely blocks redundant calls when already focused.
  it("pressing same campus button does NOT trigger animation", () => {
    const { getByTestId } = render(<CampusMap />);

    fireEvent.press(getByTestId("campusToggle-SGW"));

    expect(mockAnimateToRegion).not.toHaveBeenCalled();
  });

  it("BrandBar backgroundColor updates based on focused campus", () => {
    const { getByTestId } = render(<CampusMap />);

    expect(getByTestId("brandbar").props.backgroundColor).toBe("#912338");

    fireEvent.press(getByTestId("campusToggle-Loyola"));
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#e3ac20");

    fireEvent.press(getByTestId("campusToggle-SGW"));
    expect(getByTestId("brandbar").props.backgroundColor).toBe("#912338");
  });

  it("selecting building via suggestion updates focused campus to Loyola", async () => {
    const { getByPlaceholderText, getByTestId, findByText } = render(
      <CampusMap />,
    );

    fireEvent.changeText(getByPlaceholderText("Where to next?"), "admin");
    await findByText(/AD — Administration Building/i);

    fireEvent.press(getByTestId("suggestion-LOY-loy-ad"));

    expect(getByTestId("brandbar").props.backgroundColor).toBe("#e3ac20");
  });
});

describe("CampusMap - PanResponder helper functions (re-exported)", () => {
  describe("calculatePanValue", () => {
    it("returns 0 when on SGW with no drag", () => {
      const result = calculatePanValue("SGW", 0, 300);
      expect(result).toBe(0);
    });

    it("returns clamped value when dragging right from SGW", () => {
      const result = calculatePanValue("SGW", 75, 300);
      expect(result).toBe(0.5);
    });

    it("returns 1 when fully dragged right from SGW", () => {
      const result = calculatePanValue("SGW", 150, 300);
      expect(result).toBe(1);
    });

    it("clamps to 1 when dragged beyond right edge", () => {
      const result = calculatePanValue("SGW", 300, 300);
      expect(result).toBe(1);
    });

    it("clamps to 0 when dragged beyond left edge", () => {
      const result = calculatePanValue("SGW", -100, 300);
      expect(result).toBe(0);
    });

    it("returns value when dragging left from LOY", () => {
      const result = calculatePanValue("LOY", -75, 300);
      expect(result).toBe(0.5);
    });

    it("uses default width when toggleWidth is 0", () => {
      const result = calculatePanValue("SGW", 50, 0);
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe("determineCampusFromPan", () => {
    it("returns SGW when finalValue <= 0.5 from SGW", () => {
      const result = determineCampusFromPan("SGW", 50, 300);
      expect(result).toBe("SGW");
    });

    it("returns LOY when finalValue > 0.5 from SGW", () => {
      const result = determineCampusFromPan("SGW", 100, 300);
      expect(result).toBe("LOY");
    });

    it("returns LOY when finalValue > 0.5 from LOY (small left drag)", () => {
      const result = determineCampusFromPan("LOY", -50, 300);
      expect(result).toBe("LOY");
    });

    it("returns SGW when finalValue <= 0.5 from LOY (large left drag)", () => {
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

  describe("BuildingPin", () => {
    it("uses default size=44 and SGW branch", () => {
      const { getByText, UNSAFE_getAllByType } = render(
        <BuildingPin code="H" campus="SGW" />,
      );

      getByText("H");

      const { View, StyleSheet } = require("react-native");
      const views = UNSAFE_getAllByType(View);

      const flat = StyleSheet.flatten(views[0].props.style);
      expect(flat).toMatchObject({ width: 44, height: 55 });
    });

    it("uses custom size and LOY branch", () => {
      const { getByText, UNSAFE_getAllByType } = render(
        <BuildingPin code="AD" campus="LOY" size={60} />,
      );

      getByText("AD");

      const { View, StyleSheet } = require("react-native");
      const views = UNSAFE_getAllByType(View);

      const flat = StyleSheet.flatten(views[0].props.style);
      expect(flat).toMatchObject({ width: 60, height: 75 });
    });
  });

  describe("BuildingPopup", () => {
    const baseBuilding = {
      id: "sgw-h",
      campus: "SGW",
      code: "H",
      name: "Henry F. Hall",
      address: "1455 De Maisonneuve",
      latitude: 45.1,
      longitude: -73.1,
    };

    it("renders fallback branch when details are missing", () => {
      const onClose = jest.fn();

      const { getByText } = render(
        <BuildingPopup
          building={{ ...baseBuilding, details: undefined } as any}
          campusTheme="SGW"
          onClose={onClose}
        />,
      );

      // ✅ Covers `!details ? (...) : (...)` branch
      getByText("Details coming soon");
      getByText("We’ll add the expanded info for this building next.");
    });

    it("renders details branch including maps + conditional description", () => {
      const onClose = jest.fn();

      const buildingWithDetails = {
        ...baseBuilding,
        details: {
          accessibility: [
            { icon: "elevator", title: "Elevator", description: "" }, // covers !!description false
            { icon: "wifi", title: "Wi-Fi", description: "Available" }, // covers !!description true
          ],
          metro: { title: "Metro nearby", description: "Guy-Concordia" },
          connectivity: {
            title: "Connected",
            description: "Underground links",
          },
          entries: [
            { title: "Main entrance", description: "Front door" },
            { title: "Side entrance", description: "Accessible ramp" },
          ],
          otherServices: [
            { icon: "wifi", title: "Printing", description: "2nd floor" },
          ],
          overview: ["Paragraph 1", "Paragraph 2"],
          venues: ["Cafeteria", "Study rooms"],
          departments: ["Computer Science", "Engineering"],
          services: ["Security", "Information desk"],
        },
      };

      const { getByText } = render(
        <BuildingPopup
          building={buildingWithDetails as any}
          campusTheme="LOY"
          onClose={onClose}
        />,
      );

      // ✅ covers the mapped sections highlighted red in Sonar
      getByText("Building Accessibility");
      getByText("Elevator");
      getByText("Wi-Fi");
      getByText("Available");

      getByText("Venues");
      getByText("Cafeteria");

      getByText("Departments");
      getByText("Engineering");

      getByText("Services");
      getByText("Information desk");
    });
  });
});
