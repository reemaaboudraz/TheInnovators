import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TopDirectionsCard } from "@/components/ui/TopDirectionsCard";

describe("TopDirectionsCard", () => {
  it("renders nothing when not visible", () => {
    const { queryByText } = render(
      <TopDirectionsCard
        visible={false}
        distanceText="10m"
        streetText="Turn right"
      />,
    );
    expect(queryByText("10m")).toBeNull();
  });

  it("renders texts and calls onPress", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <TopDirectionsCard
        visible={true}
        distanceText="10m"
        streetText="Turn right"
        onPress={onPress}
      />,
    );

    expect(getByText("10m")).toBeTruthy();
    expect(getByText("Turn right")).toBeTruthy();

    fireEvent.press(getByText("10m"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
