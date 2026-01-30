import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAnimateToRegion = jest.fn();

jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View } = require("react-native");

  const MockMapView = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      animateToRegion: mockAnimateToRegion,
    }));
    return <View testID="mapView" {...props} />;
  });

  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_GOOGLE: "google",
  };
});

import SGWCampus from "@/app/(tabs)/map";

describe("SGWCampus - suggestions", () => {
  beforeEach(() => {
    mockAnimateToRegion.mockClear();
  });

  it("selecting a suggestion animates the map and updates the input", async () => {
    const { getByPlaceholderText, findByText } = render(<SGWCampus />);

    fireEvent.changeText(getByPlaceholderText("Where to next?"), "hall");

    const row = await findByText(/H — Henry F\. Hall Building/i);
    fireEvent.press(row);

    // map animation called
    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);
    expect(mockAnimateToRegion).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 45.49729,
        longitude: -73.57898,
        latitudeDelta: 0.0025,
        longitudeDelta: 0.0025,
      }),
      500,
    );

    // input updated
    expect(getByPlaceholderText("Where to next?").props.value).toMatch(
      /^H - Henry F\. Hall Building/i,
    );
  });
});
