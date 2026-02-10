/* eslint-disable import/first */
import React from "react";
import { render } from "@testing-library/react-native";

// ✅ Mock BottomSheet to avoid Reanimated worklet errors in Jest
jest.mock("@gorhom/bottom-sheet", () => {
  const ReactActual = jest.requireActual("react") as typeof React;
  const RN = jest.requireActual(
    "react-native",
  ) as typeof import("react-native");
  const { View, ScrollView } = RN;

  const BottomSheet = ({ children }: any) =>
    ReactActual.createElement(View, { testID: "bottomSheet" }, children);

  const BottomSheetScrollView = ({ children }: any) =>
    ReactActual.createElement(
      ScrollView,
      { testID: "bottomSheetScrollView" },
      children,
    );

  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetScrollView,
  };
});

// Safe-area mock (stable snapPoints + avoids crashes)
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 10, bottom: 0, left: 0, right: 0 }),
}));

// Avoid requiring real asset files
jest.mock("@/components/Buildings/details/buildingImages", () => ({
  BUILDING_IMAGES: {
    H: 123, // truthy -> triggers thumbSource branch if your component uses it
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

// ✅ Import AFTER mocks
import BuildingPopup from "@/components/campus/BuildingPopup";

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

  it("renders fallback UI when details are missing", () => {
    const onClose = jest.fn();

    const { getByText } = render(
      <BuildingPopup
        building={{ ...baseBuilding, details: undefined } as any}
        campusTheme="SGW"
        onClose={onClose}
      />,
    );

    getByText("Details coming soon");
    getByText("We’ll add the expanded info for this building next.");
  });

  it("renders detailed sections when details exist", () => {
    const onClose = jest.fn();

    const buildingWithDetails = {
      ...baseBuilding,
      details: {
        accessibility: [
          { icon: "elevator", title: "Elevator", description: "" },
          { icon: "wifi", title: "Wi-Fi", description: "Available" },
        ],
        metro: { title: "Metro nearby", description: "Guy-Concordia" },
        connectivity: { title: "Connected", description: "Underground links" },
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
