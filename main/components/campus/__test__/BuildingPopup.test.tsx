import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BuildingPopup from "@/components/campus/BuildingPopup";

// Safe-area mock (stable snapPoints)
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 10, bottom: 0, left: 0, right: 0 }),
}));

// Avoid requiring real asset files
jest.mock("@/components/Buildings/details/buildingImages", () => ({
  BUILDING_IMAGES: {
    H: 123, // truthy -> triggers thumbSource branch
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

  it("renders the fallback UI when details are missing", () => {
    const onClose = jest.fn();

    const { getByText, getByTestId } = render(
      <BuildingPopup
        building={{ ...baseBuilding, details: undefined } as any}
        campusTheme="SGW"
        onClose={onClose}
      />,
    );

    // Fallback branch
    getByText("Details coming soon");
    getByText("We’ll add the expanded info for this building next.");
  });

  it("renders detailed sections when details exist (covers maps + conditional description)", () => {
    const onClose = jest.fn();

    const buildingWithDetails = {
      ...baseBuilding,
      details: {
        accessibility: [
          { icon: "elevator", title: "Elevator", description: "" }, // covers !!description false
          { icon: "wifi", title: "Wi-Fi", description: "Available" }, // covers !!description true
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

    // Section headers + mapped items
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