import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RoutePlanner from "@/components/campus/RoutePlanner"; // adjust path if needed

describe("RoutePlanner", () => {
  it("renders the route mode button", () => {
    const { getByTestId } = render(
      <RoutePlanner isRouteMode={false} onToggle={jest.fn()} />,
    );

    getByTestId("routeModeButton");
  });

  it("calls onToggle when pressed", () => {
    const onToggle = jest.fn();

    const { getByTestId } = render(
      <RoutePlanner isRouteMode={false} onToggle={onToggle} />,
    );

    fireEvent.press(getByTestId("routeModeButton"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("calls onToggle when pressed", () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(
      <RoutePlanner isRouteMode={false} onToggle={onToggle} />,
    );

    fireEvent.press(getByTestId("routeModeButton"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
