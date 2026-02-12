/* eslint-disable import/first */
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { jest } from "@jest/globals";

// Mock datasets
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
        polygon: [],
    },
]);

jest.mock("@/components/Buildings/data/Loyola_data.json", () => [
    {
        id: "loy-ad",
        code: "AD",
        name: "Administration Building",
        address: "7141 Sherbrooke St W, Montreal, QC",
        latitude: 45.4582,
        longitude: -73.6401,
        campus: "LOY",
        zoomCategory: 2,
        aliases: ["admin"],
        polygon: [],
    },
]);

const mockAnimateToRegion = jest.fn();

jest.mock("react-native-maps", () => {
    const React = require("react");
    const { View } = require("react-native");

    const MockMap = React.forwardRef((props: any, ref: any) => {
        React.useImperativeHandle(ref, () => ({
            animateToRegion: mockAnimateToRegion,
        }));
        return <View testID={props.testID ?? "mapView"}>{props.children}</View>;
    });

    const MockMarker = ({ children }: any) => <View>{children}</View>;

    return {
        __esModule: true,
        default: MockMap,
        Marker: MockMarker,
        PROVIDER_GOOGLE: "google",
    };
});

jest.mock("@/components/campus/BuildingShapesLayer", () => {
    const React = require("react");
    const { View } = require("react-native");
    return function MockLayer() {
        return <View testID="buildingShapesLayer" />;
    };
});

jest.mock("@/components/campus/CurrentLocationButton", () => {
    const React = require("react");
    const { View } = require("react-native");
    return function MockCurrentLocationButton() {
        return <View testID="currentLocationButton" />;
    };
});

jest.mock("@/components/campus/BuildingPopup", () => {
    const React = require("react");
    const { View } = require("react-native");
    return function MockPopup() {
        return <View testID="buildingPopup" />;
    };
});

jest.mock("@/components/layout/BrandBar", () => {
    const React = require("react");
    const { View } = require("react-native");
    return function MockBrandBar() {
        return <View testID="brandbar" />;
    };
});

import CampusMap from "../CampusMap";

describe("CampusMap navigation flow", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("allows selecting start and destination via suggestions then enables Get Directions", () => {
        const { getByTestId, queryByTestId } = render(<CampusMap />);

        fireEvent.press(getByTestId("selectStartButton"));
        fireEvent.changeText(getByTestId("startInput"), "h");
        fireEvent.press(getByTestId("suggestion-SGW-sgw-h"));

        fireEvent.press(getByTestId("selectDestinationButton"));
        fireEvent.changeText(getByTestId("destinationInput"), "ad");
        fireEvent.press(getByTestId("suggestion-LOY-loy-ad"));

        expect(queryByTestId("suggestions")).toBeNull();

        const button = getByTestId("getDirectionsButton");
        expect(button.props.accessibilityState?.disabled).toBe(false);
    });

    it("swap button swaps current start and destination", () => {
        const { getByTestId } = render(<CampusMap />);

        fireEvent.press(getByTestId("selectStartButton"));
        fireEvent.changeText(getByTestId("startInput"), "h");
        fireEvent.press(getByTestId("suggestion-SGW-sgw-h"));

        fireEvent.press(getByTestId("selectDestinationButton"));
        fireEvent.changeText(getByTestId("destinationInput"), "ad");
        fireEvent.press(getByTestId("suggestion-LOY-loy-ad"));

        fireEvent.press(getByTestId("swapRouteButton"));

        const button = getByTestId("getDirectionsButton");
        expect(button.props.accessibilityState?.disabled).toBe(false);
    });
});
