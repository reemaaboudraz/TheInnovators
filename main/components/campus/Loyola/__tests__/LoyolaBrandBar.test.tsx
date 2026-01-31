import React from "react";
import { render } from "@testing-library/react-native";
import LoyolaBrandBar, { adjustColorShade } from "../../../layout/LoyolaBrandBar";

jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return {
    LinearGradient: (props: any) => <View {...props} />,
  };
});

describe("adjustColorShade", () => {
  test("returns a valid hex color string", () => {
    const out = adjustColorShade("#e3ac20", 0.1);
    expect(out).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test("darkens when intensity is negative", () => {
    const out = adjustColorShade("#ffffff", -0.25);
    expect(out.toLowerCase()).not.toBe("#ffffff");
  });

  test("lightens when intensity is positive", () => {
    const out = adjustColorShade("#000000", 0.25);
    expect(out.toLowerCase()).not.toBe("#000000");
  });
});

describe("LoyolaBrandBar component", () => {
  test("renders gradients with default props", () => {
    const { getByTestId } = render(<LoyolaBrandBar />);

    expect(getByTestId("loyola-brandbar")).toBeTruthy();
    expect(getByTestId("loyola-brandbar-overlay")).toBeTruthy();
  });

  test("uses provided height", () => {
    const { getByTestId } = render(<LoyolaBrandBar height={60} />);

    const style = getByTestId("loyola-brandbar").props.style;
    const heightStyle = Array.isArray(style) ? style.find((s) => s?.height) : style;

    expect(heightStyle.height).toBe(60);
  });
});
