import React from "react";
import { render } from "@testing-library/react-native";
import { describe, it, expect } from "@jest/globals";
import LoyolaBrandBar, {
  adjustColorShade,
} from "@/components/layout/LoyolaBrandBar";

describe("LoyolaBrandBar", () => {
  describe("rendering", () => {
    it("renders with default props", () => {
      const { getByTestId } = render(<LoyolaBrandBar />);

      const brandBar = getByTestId("loyola-brandbar");
      expect(brandBar).toBeTruthy();
    });

    it("renders the overlay gradient", () => {
      const { getByTestId } = render(<LoyolaBrandBar />);

      const overlay = getByTestId("loyola-brandbar-overlay");
      expect(overlay).toBeTruthy();
    });

    it("applies default height of 40", () => {
      const { getByTestId } = render(<LoyolaBrandBar />);

      const brandBar = getByTestId("loyola-brandbar");
      const styles = brandBar.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flatStyle.height).toBe(40);
    });

    it("applies custom height when provided", () => {
      const { getByTestId } = render(<LoyolaBrandBar height={60} />);

      const brandBar = getByTestId("loyola-brandbar");
      const styles = brandBar.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flatStyle.height).toBe(60);
    });

    it("uses default gold color (#e3ac20) for gradient", () => {
      const { getByTestId } = render(<LoyolaBrandBar />);

      const brandBar = getByTestId("loyola-brandbar");
      const colors = brandBar.props.colors;

      // The center color should be a lighter shade of #e3ac20
      expect(colors).toHaveLength(3);
      expect(colors[0]).toBe(colors[2]); // Edge colors should match
    });

    it("applies custom backgroundColor to gradient", () => {
      const customColor = "#ff5500";
      const { getByTestId } = render(
        <LoyolaBrandBar backgroundColor={customColor} />,
      );

      const brandBar = getByTestId("loyola-brandbar");
      const colors = brandBar.props.colors;

      // Gradient should have 3 colors derived from custom color
      expect(colors).toHaveLength(3);
      expect(colors[0]).toBe(colors[2]); // Edge colors should match
    });

    it("has correct gradient locations", () => {
      const { getByTestId } = render(<LoyolaBrandBar />);

      const brandBar = getByTestId("loyola-brandbar");

      expect(brandBar.props.locations).toEqual([0, 0.5, 1]);
    });

    it("has horizontal gradient direction", () => {
      const { getByTestId } = render(<LoyolaBrandBar />);

      const brandBar = getByTestId("loyola-brandbar");

      expect(brandBar.props.start).toEqual({ x: 0, y: 0 });
      expect(brandBar.props.end).toEqual({ x: 1, y: 0 });
    });

    it("overlay has vertical gradient direction", () => {
      const { getByTestId } = render(<LoyolaBrandBar />);

      const overlay = getByTestId("loyola-brandbar-overlay");

      expect(overlay.props.start).toEqual({ x: 0, y: 0 });
      expect(overlay.props.end).toEqual({ x: 0, y: 1 });
    });
  });

  describe("adjustColorShade", () => {
    it("darkens color with negative intensity", () => {
      const result = adjustColorShade("#ffffff", -0.5);

      // White darkened by 50% should be gray (#808080)
      expect(result).toBe("#808080");
    });

    it("lightens color with positive intensity", () => {
      const result = adjustColorShade("#000000", 0.5);

      // Black lightened by 50% should be gray (#808080)
      expect(result).toBe("#808080");
    });

    it("returns same color with zero intensity", () => {
      const result = adjustColorShade("#ff5500", 0);

      expect(result).toBe("#ff5500");
    });

    it("handles the default gold color", () => {
      const defaultColor = "#e3ac20";
      const darkerShade = adjustColorShade(defaultColor, -0.25);
      const lighterShade = adjustColorShade(defaultColor, 0.1);

      // Darker shade should have lower RGB values
      expect(darkerShade).not.toBe(defaultColor);
      expect(lighterShade).not.toBe(defaultColor);
      expect(darkerShade).not.toBe(lighterShade);
    });

    it("produces valid hex color format", () => {
      const result = adjustColorShade("#123456", 0.3);

      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});
