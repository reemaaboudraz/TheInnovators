import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import SGWCampus from "@/app/(tabs)/map";

const mockAnimateToRegion = jest.fn();

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

    return ReactActual.createElement(View, { testID: "mapView", ...props });
  });

  (MockMapView as any).displayName = "MockMapView";

  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_GOOGLE: "google",
  };
});

describe("SGWCampus - suggestions", () => {
  beforeEach(() => {
    mockAnimateToRegion.mockClear();
  });

  it("selecting a suggestion animates the map and updates the input", async () => {
    const { getByPlaceholderText, findByText } = render(<SGWCampus />);

    fireEvent.changeText(getByPlaceholderText("Where to next?"), "hall");

    const row = await findByText(/H — Henry F\. Hall Building/i);
    fireEvent.press(row);

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

    expect(getByPlaceholderText("Where to next?").props.value).toMatch(
      /^H - Henry F\. Hall Building/i,
    );
  });
});
