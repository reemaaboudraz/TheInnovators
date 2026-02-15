/* eslint-disable import/first */
import React from "react";
import { render } from "@testing-library/react-native";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// ✅ Mock helper so we can fully control label visibility decisions
const mockShouldShowBuildingLabel = jest.fn();

jest.mock("@/components/campus/helper_methods/campusMap.labels", () => ({
  __esModule: true,
  shouldShowBuildingLabel: (b: any, r: any) =>
    mockShouldShowBuildingLabel(b, r),
}));

// ✅ Mock react-native-maps so Marker/Polygon render as Views with stable testIDs
jest.mock("react-native-maps", () => {
  const ReactActual = jest.requireActual("react") as typeof React;
  const RN = jest.requireActual(
    "react-native",
  ) as typeof import("react-native");
  const { View } = RN;

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

  return {
    __esModule: true,
    Polygon: MockPolygon,
    Marker: MockMarker,
  };
});

// ✅ Import AFTER mocks
import BuildingShapesLayer from "../BuildingShapesLayer";

function makeBuilding(
  id: string,
  campus: "SGW" | "LOY",
  lat: number,
  lng: number,
) {
  return {
    id,
    code: id.toUpperCase(),
    name: `Building ${id}`,
    address: "Test address",
    latitude: lat,
    longitude: lng,
    campus,
    zoomCategory: 2,
    aliases: [],
    polygon: [
      { latitude: lat + 0.001, longitude: lng + 0.001 },
      { latitude: lat + 0.001, longitude: lng + 0.002 },
      { latitude: lat + 0.002, longitude: lng + 0.002 },
      { latitude: lat + 0.002, longitude: lng + 0.001 },
    ],
  } as any;
}

function makeRegion(latDelta: number, lngDelta: number) {
  return {
    latitude: 45.5,
    longitude: -73.6,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  } as any;
}

describe("BuildingShapesLayer - label visibility (zoom-based)", () => {
  beforeEach(() => {
    mockShouldShowBuildingLabel.mockReset();
  });

  it("renders label Marker when helper returns true", () => {
    const b1 = makeBuilding("h", "SGW", 45.497, -73.579);
    const region = makeRegion(0.01, 0.01);

    mockShouldShowBuildingLabel.mockReturnValue(true);

    const { getByTestId } = render(
      <BuildingShapesLayer
        buildings={[b1]}
        selectedBuildingId={null}
        userLocationBuildingId={null}
        onPickBuilding={jest.fn()}
        region={region}
      />,
    );

    // polygon always renders
    getByTestId(`polygon-${b1.polygon[0].latitude}-${b1.polygon[0].longitude}`);

    // label marker renders because helper said true
    getByTestId(`marker-${b1.latitude}-${b1.longitude}`);
  });

  it("does NOT render label Marker when helper returns false, but keeps polygon intact", () => {
    const b1 = makeBuilding("h", "SGW", 45.497, -73.579);
    const region = makeRegion(0.08, 0.08);

    mockShouldShowBuildingLabel.mockReturnValue(false);

    const { getByTestId, queryByTestId } = render(
      <BuildingShapesLayer
        buildings={[b1]}
        selectedBuildingId={null}
        userLocationBuildingId={null}
        onPickBuilding={jest.fn()}
        region={region}
      />,
    );

    // polygon stays
    getByTestId(`polygon-${b1.polygon[0].latitude}-${b1.polygon[0].longitude}`);

    // label marker is hidden
    expect(queryByTestId(`marker-${b1.latitude}-${b1.longitude}`)).toBeNull();
  });

  it("calls helper for each building using the provided region", () => {
    const b1 = makeBuilding("h", "SGW", 45.497, -73.579);
    const b2 = makeBuilding("ad", "LOY", 45.458, -73.64);
    const region = makeRegion(0.02, 0.01);

    mockShouldShowBuildingLabel.mockReturnValue(true);

    render(
      <BuildingShapesLayer
        buildings={[b1, b2]}
        selectedBuildingId={null}
        userLocationBuildingId={null}
        onPickBuilding={jest.fn()}
        region={region}
      />,
    );

    expect(mockShouldShowBuildingLabel).toHaveBeenCalledTimes(2);

    expect(mockShouldShowBuildingLabel).toHaveBeenNthCalledWith(1, b1, region);
    expect(mockShouldShowBuildingLabel).toHaveBeenNthCalledWith(2, b2, region);
  });
});
