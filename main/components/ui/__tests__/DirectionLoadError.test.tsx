import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DirectionsLoadError from "@/components/ui/DirectionLoadError";

describe("DirectionLoadError", () => {
  it("renders nothing when not visible", () => {
    const { queryByTestId } = render(
      <DirectionsLoadError visible={false} message="x" onRefresh={() => {}} />,
    );
    expect(queryByTestId("directions-error-overlay")).toBeNull();
  });

  it("shows message when visible", () => {
    const { getByTestId } = render(
      <DirectionsLoadError
        visible
        message="Network error"
        onRefresh={() => {}}
      />,
    );
    expect(getByTestId("directions-error-message")).toBeTruthy();
  });

  it("calls onRefresh", () => {
    const onRefresh = jest.fn();
    const { getByTestId } = render(
      <DirectionsLoadError visible message="x" onRefresh={onRefresh} />,
    );
    fireEvent.press(getByTestId("directions-error-refresh"));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
