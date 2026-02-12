import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NavigationSearchCard from "../NavigationSearchCard";
import type { Building } from "@/components/Buildings/types";

const mockBuilding: Building = {
    id: "sgw-h",
    code: "H",
    name: "Henry F. Hall Building",
    address: "1455 De Maisonneuve Blvd W, Montreal, QC",
    latitude: 45.49729,
    longitude: -73.57898,
    campus: "SGW",
    zoomCategory: 2,
    aliases: ["hall"],
    polygon: [],
};

describe("NavigationSearchCard", () => {
    it("renders start/destination inputs and disabled get directions initially", () => {
        const { getByTestId } = render(
            <NavigationSearchCard
                startValue=""
                destinationValue=""
                selectionMode={null}
                query=""
                suggestions={[]}
                onFocusStart={jest.fn()}
                onFocusDestination={jest.fn()}
                onChangeQuery={jest.fn()}
                onPickSuggestion={jest.fn()}
                onSwap={jest.fn()}
                onGetDirections={jest.fn()}
            />,
        );

        expect(getByTestId("startInput")).toBeTruthy();
        expect(getByTestId("destinationInput")).toBeTruthy();

        const button = getByTestId("getDirectionsButton");
        expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it("enables get directions when both values exist", () => {
        const { getByTestId } = render(
            <NavigationSearchCard
                startValue="H - Henry F. Hall Building"
                destinationValue="LB - Webster Library"
                selectionMode={null}
                query=""
                suggestions={[]}
                onFocusStart={jest.fn()}
                onFocusDestination={jest.fn()}
                onChangeQuery={jest.fn()}
                onPickSuggestion={jest.fn()}
                onSwap={jest.fn()}
                onGetDirections={jest.fn()}
            />,
        );

        const button = getByTestId("getDirectionsButton");
        expect(button.props.accessibilityState?.disabled).toBe(false);
    });

    it("shows suggestions in start mode and picks suggestion", () => {
        const onPickSuggestion = jest.fn();

        const { getByTestId } = render(
            <NavigationSearchCard
                startValue=""
                destinationValue=""
                selectionMode="start"
                query="h"
                suggestions={[mockBuilding]}
                onFocusStart={jest.fn()}
                onFocusDestination={jest.fn()}
                onChangeQuery={jest.fn()}
                onPickSuggestion={onPickSuggestion}
                onSwap={jest.fn()}
                onGetDirections={jest.fn()}
            />,
        );

        fireEvent.press(getByTestId("suggestion-SGW-sgw-h"));
        expect(onPickSuggestion).toHaveBeenCalledWith(mockBuilding);
    });
});
