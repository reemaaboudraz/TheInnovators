import React from "react";
import { render } from "@testing-library/react-native";
import SGWCampus from "@/app/(tabs)/map";
import { describe, it, expect } from "@jest/globals";


describe("SGWCampus - initial region", () => {
    it("uses SGW region as initialRegion", () => {
        const { getByTestId } = render(<SGWCampus />);

        const map = getByTestId("mapView");

        expect(map.props.initialRegion).toEqual({
            latitude: 45.4973,
            longitude: -73.5794,
            latitudeDelta: 0.006,
            longitudeDelta: 0.006,
        });
    });
});
