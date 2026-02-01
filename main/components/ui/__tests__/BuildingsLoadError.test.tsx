import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { describe, it, expect, jest } from "@jest/globals";
import BuildingsLoadError from "../BuildingsLoadError";

describe("BuildingsLoadError", () => {
  it("does not render when visible is false", () => {
    const { queryByTestId } = render(
      <BuildingsLoadError visible={false} onRefresh={jest.fn()} />,
    );

    expect(queryByTestId("buildings-error-overlay")).toBeNull();
  });

  it("renders when visible is true", () => {
    const { getByTestId, getByText } = render(
      <BuildingsLoadError visible onRefresh={jest.fn()} />,
    );

    expect(getByTestId("buildings-error-overlay")).toBeTruthy();
    expect(getByTestId("buildings-error-card")).toBeTruthy();

    expect(getByText(/whoops/i)).toBeTruthy();
    expect(getByText(/error loading the buildings/i)).toBeTruthy();
    expect(getByTestId("buildings-error-refresh")).toBeTruthy();
  });

  it("calls onRefresh when pressing Refresh button", () => {
    const onRefresh = jest.fn();

    const { getByTestId } = render(
      <BuildingsLoadError visible onRefresh={onRefresh} />,
    );

    fireEvent.press(getByTestId("buildings-error-refresh"));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("uses testIDPrefix when provided", () => {
    const onRefresh = jest.fn();

    const { getByTestId } = render(
      <BuildingsLoadError
        visible
        onRefresh={onRefresh}
        testIDPrefix="loyola-buildings-error"
      />,
    );

    expect(getByTestId("loyola-buildings-error-overlay")).toBeTruthy();

    fireEvent.press(getByTestId("loyola-buildings-error-refresh"));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("accepts accentColor without crashing", () => {
    const { getByTestId } = render(
      <BuildingsLoadError
        visible
        onRefresh={jest.fn()}
        accentColor="#D84A4A"
      />,
    );

    expect(getByTestId("buildings-error-overlay")).toBeTruthy();
  });
});
