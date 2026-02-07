import React from "react";
import { render } from "@testing-library/react-native";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// ✅ must be prefixed with "mock" so jest allows it inside jest.mock factory
const mockSnapToIndex = jest.fn();
const mockClose = jest.fn();

jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View, ScrollView } = require("react-native");

  const BottomSheet = React.forwardRef(
    ({ children, ...props }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        snapToIndex: mockSnapToIndex,
        close: mockClose,
      }));

      return (
        <View testID="bottomSheet" {...props}>
          {children}
        </View>
      );
    },
  );

  const BottomSheetScrollView = React.forwardRef((props: any, ref: any) => (
    <ScrollView ref={ref} {...props} />
  ));

  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetScrollView,
  };
});

// ✅ Safe area hook mock so you don't need SafeAreaProvider in this file
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// If BuildingPopup uses Dimensions / useWindowDimensions, this helps stability
jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
}));

import BuildingPopup from "../BuildingPopup";

describe("BuildingPopup", () => {
  beforeEach(() => {
    mockSnapToIndex.mockClear();
    mockClose.mockClear();
  });

  it("renders without crashing", () => {
    const building: any = {
      id: "sgw-h",
      code: "H",
      name: "Henry F. Hall Building",
      address: "1455 De Maisonneuve Blvd W",
      campus: "SGW",
      latitude: 45.49729,
      longitude: -73.57898,
    };

    const { getByTestId } = render(
      <BuildingPopup
        building={building}
        campusTheme="SGW"
        onClose={jest.fn()}
      />,
    );

    expect(getByTestId("bottomSheet")).toBeTruthy();
  });
});
