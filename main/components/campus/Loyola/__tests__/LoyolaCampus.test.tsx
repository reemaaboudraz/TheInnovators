import { render, fireEvent } from "@testing-library/react-native";
import { searchLoyolaBuildings } from "@/components/Buildings/search";

jest.mock("react-native", () => {
  const rn = jest.requireActual("react-native");
  return {
    ...rn,
    Platform: { ...rn.Platform, OS: "android", select: (obj: any) => obj.android },
  };
});

jest.mock("@/components/Buildings/search", () => ({
  searchLoyolaBuildings: jest.fn(),
}));

jest.mock("@/components/layout/LoyolaBrandBar", () => {
  const { View } = require("react-native");
  return function LoyolaBrandBarMock(props: any) {
    return <View testID="loyola-brandbar-mock" {...props} />;
  };
});

jest.mock("react-native-maps", () => {
  const { forwardRef, useImperativeHandle } = require("react");
  const { View } = require("react-native");

  const animateToRegionMock = jest.fn();

  const MockMapView = forwardRef((props: any, ref: any) => {
    useImperativeHandle(ref, () => ({
      animateToRegion: animateToRegionMock,
    }));
    return <View testID="map-view" {...props} />;
  });

  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_GOOGLE: "google",
    __animateToRegionMock: animateToRegionMock,
  };
});

import LoyolaCampus from "../LoyolaCampus";

describe("LoyolaCampus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with no suggestions when search is empty/blank", () => {
    (searchLoyolaBuildings as jest.Mock).mockReturnValue([]);

    const { queryByTestId, getByTestId } = render(<LoyolaCampus />);

    expect(getByTestId("loyola-search-input")).toBeTruthy();
    expect(queryByTestId("clear-search-button")).toBeNull();

    fireEvent.changeText(getByTestId("loyola-search-input"), "   ");
    expect(searchLoyolaBuildings).not.toHaveBeenCalled();
  });

  test("typing calls searchLoyolaBuildings(query, 6) and shows clear button", () => {
    (searchLoyolaBuildings as jest.Mock).mockReturnValue([]);

    const { getByTestId, queryByTestId } = render(<LoyolaCampus />);
    fireEvent.changeText(getByTestId("loyola-search-input"), "VL");

    expect(searchLoyolaBuildings).toHaveBeenCalledWith("VL", 6);
    expect(queryByTestId("clear-search-button")).toBeTruthy();
  });

  test("shows suggestions and selecting one animates map + fills input", () => {
    const building = {
      id: "1",
      code: "VL",
      name: "Vanier Library",
      address: "7141 Sherbrooke St W",
      latitude: 45.458,
      longitude: -73.64,
    };

    (searchLoyolaBuildings as jest.Mock).mockReturnValue([building]);

    const { getByTestId, getByText } = render(<LoyolaCampus />);
    fireEvent.changeText(getByTestId("loyola-search-input"), "V");

    expect(getByTestId("suggestion-VL")).toBeTruthy();
    expect(getByText("VL - Vanier Library")).toBeTruthy();

    fireEvent.press(getByTestId("suggestion-VL"));

    const maps = require("react-native-maps");
    expect(maps.__animateToRegionMock).toHaveBeenCalledWith(
      {
        latitude: 45.458,
        longitude: -73.64,
        latitudeDelta: 0.0025,
        longitudeDelta: 0.0025,
      },
      500
    );

    expect(getByTestId("loyola-search-input").props.value).toBe(
      "VL - Vanier Library"
    );
  });

  test("clear button clears the input when pressed", () => {
    (searchLoyolaBuildings as jest.Mock).mockReturnValue([]);

    const { getByTestId, queryByTestId } = render(<LoyolaCampus />);
    fireEvent.changeText(getByTestId("loyola-search-input"), "VL");
    expect(queryByTestId("clear-search-button")).toBeTruthy();

    fireEvent.press(getByTestId("clear-search-button"));
    expect(getByTestId("loyola-search-input").props.value).toBe("");
  });
});
