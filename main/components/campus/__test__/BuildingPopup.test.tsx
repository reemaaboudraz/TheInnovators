/* eslint-disable import/first */
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Image } from "react-native";

// ---- Mocks ----

// Mock BuildingPin to avoid unrelated rendering/props complexity
jest.mock("@/components/campus/BuildingPin", () => {
    const React = require("react");
    const { Text } = require("react-native");

    return function MockBuildingPin(props: any) {
        return React.createElement(
            Text,
            { testID: "buildingPin" },
            `Pin-${props.code}-${props.campus}-${props.variant}`,
        );
    };
});

// Avoid requiring real asset files
jest.mock("@/components/Buildings/details/buildingImages", () => ({
    BUILDING_IMAGES: {
        H: 123, // truthy -> thumbSource branch
        // Any other code will be undefined -> placeholder branch
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

// Safe-area mock (stable snapPoints + avoids crashes)
jest.mock("react-native-safe-area-context", () => ({
    useSafeAreaInsets: () => ({ top: 10, bottom: 0, left: 0, right: 0 }),
}));

// BottomSheet mock
const mockSnapToIndex = jest.fn();
const mockClose = jest.fn();

jest.mock("@gorhom/bottom-sheet", () => {
    const ReactActual = jest.requireActual("react");
    const RN = jest.requireActual("react-native");
    const { View: RNView, ScrollView } = RN;

    const BottomSheet = ReactActual.forwardRef((props: any, ref: any) => {
        ReactActual.useImperativeHandle(ref, () => ({
            snapToIndex: (i: number) => {
                mockSnapToIndex(i);
                props.onChange?.(i);
            },
            close: () => {
                mockClose();
                props.onClose?.();
            },
        }));

        const Handle = props.handleComponent ? props.handleComponent({}) : null;

        return ReactActual.createElement(
            RNView,
            { testID: "bottomSheet" },
            Handle,
            props.children,
        );
    });

    const BottomSheetScrollView = ({ children, ...rest }: any) =>
        ReactActual.createElement(
            ScrollView,
            { testID: "bottomSheetScrollView", ...rest },
            children,
        );

    return {
        __esModule: true,
        default: BottomSheet,
        BottomSheetScrollView,
    };
});

// Import AFTER mocks
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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders fallback UI when details are missing + shows image thumbnail branch", () => {
        const onClose = jest.fn();
        const onGetDirections = jest.fn();

        const { getByText, UNSAFE_queryAllByType } = render(
            <BuildingPopup
                building={{ ...baseBuilding, details: undefined } as any}
                campusTheme="SGW"
                onClose={onClose}
                onGetDirections={onGetDirections}
            />,
        );

        getByText("Details coming soon");
        getByText("We’ll add the expanded info for this building next.");

        // ThumbSource branch (H exists in BUILDING_IMAGES)
        const images = UNSAFE_queryAllByType(Image);
        expect(images.length).toBeGreaterThan(0);
    });

    it("renders thumb placeholder branch when no building image exists", () => {
        const onClose = jest.fn();

        const { getByText, UNSAFE_queryAllByType } = render(
            <BuildingPopup
                building={{ ...baseBuilding, id: "sgw-x", code: "X", details: undefined } as any}
                campusTheme="SGW"
                onClose={onClose}
                onGetDirections={jest.fn()}
            />,
        );

        getByText("Details coming soon");

        // No building image => should be 0 Image components in fallback mode
        const images = UNSAFE_queryAllByType(Image);
        expect(images.length).toBe(0);
    });

    it("pressing handle expands sheet (snapToIndex) and triggers onSheetChange", () => {
        const onClose = jest.fn();
        const onSheetChange = jest.fn();

        const { getByTestId } = render(
            <BuildingPopup
                building={{ ...baseBuilding, details: undefined } as any}
                campusTheme="SGW"
                onClose={onClose}
                onSheetChange={onSheetChange}
                onGetDirections={jest.fn()}
            />,
        );

        fireEvent.press(getByTestId("buildingPopup-handle"));

        expect(mockSnapToIndex).toHaveBeenCalledWith(1);
        expect(onSheetChange).toHaveBeenCalledWith(1);
    });

    it("pressing close calls BottomSheet.close -> onClose", () => {
        const onClose = jest.fn();

        const { getByTestId } = render(
            <BuildingPopup
                building={{ ...baseBuilding, details: undefined } as any}
                campusTheme="SGW"
                onClose={onClose}
                onGetDirections={jest.fn()}
            />,
        );

        fireEvent.press(getByTestId("buildingPopup-close"));

        expect(mockClose).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("pressing Get Directions calls onGetDirections(building)", () => {
        const onClose = jest.fn();
        const onGetDirections = jest.fn();

        const { getByTestId } = render(
            <BuildingPopup
                building={{ ...baseBuilding, details: undefined } as any}
                campusTheme="SGW"
                onClose={onClose}
                onGetDirections={onGetDirections}
            />,
        );

        fireEvent.press(getByTestId("directionsButton"));
        expect(onGetDirections).toHaveBeenCalledWith(
            expect.objectContaining({ id: "sgw-h", code: "H" }),
        );
    });

    it("renders detailed sections + covers accessibility empty branch + SimpleRow null-return", () => {
        const onClose = jest.fn();

        const buildingWithDetails = {
            ...baseBuilding,
            id: "sgw-h-2",
            details: {
                accessibility: [],
                metro: {},
                connectivity: {},
                entries: [],
                otherServices: [],
                overview: ["Paragraph 1"],
                venues: ["Cafeteria"],
                departments: ["Engineering"],
                services: ["Information desk"],
            },
        };

        const { getByText, queryByText } = render(
            <BuildingPopup
                building={buildingWithDetails as any}
                campusTheme="LOY"
                onClose={onClose}
                onGetDirections={jest.fn()}
            />,
        );

        getByText("Building Accessibility");
        getByText(
            "This building is not accessible. It is not equipped with an accessibility ramp, automated door, elevator or wheelchair lift.",
        );

        getByText("Metro Accessibility");
        getByText("Building Connectivity");

        expect(queryByText("Number of Entries")).toBeNull();
        expect(queryByText("Other services")).toBeNull();

        getByText("Building Overview");
        getByText("Paragraph 1");

        getByText("Venues");
        getByText("Cafeteria");

        getByText("Departments");
        getByText("Engineering");

        getByText("Services");
        getByText("Information desk");
    });

    it("renders accessibility items branch (IconRow mapping + description conditional)", () => {
        const buildingWithAccessibility = {
            ...baseBuilding,
            id: "sgw-h-3",
            details: {
                accessibility: [
                    { icon: "elevator", title: "Elevator", description: "" },
                    { icon: "wifi", title: "Wi-Fi", description: "Available" },
                ],
            },
        };

        const { getByText, queryByText } = render(
            <BuildingPopup
                building={buildingWithAccessibility as any}
                campusTheme="SGW"
                onClose={jest.fn()}
                onGetDirections={jest.fn()}
            />,
        );

        getByText("Building Accessibility");
        getByText("Elevator");
        getByText("Wi-Fi");
        getByText("Available");

        // Empty string description should not render
        expect(queryByText("")).toBeNull();
    });

    it("calls snapToIndex(0) when building id changes (useEffect dependency)", () => {
        const { rerender } = render(
            <BuildingPopup
                building={{ ...baseBuilding, id: "b1", details: undefined } as any}
                campusTheme="SGW"
                onClose={jest.fn()}
                onGetDirections={jest.fn()}
            />,
        );

        rerender(
            <BuildingPopup
                building={{ ...baseBuilding, id: "b2", details: undefined } as any}
                campusTheme="SGW"
                onClose={jest.fn()}
                onGetDirections={jest.fn()}
            />,
        );

        expect(mockSnapToIndex).toHaveBeenCalledWith(0);
    });
});
