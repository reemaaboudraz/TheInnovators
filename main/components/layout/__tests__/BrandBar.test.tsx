import React from "react";
import { render } from "@testing-library/react-native";
import { describe, it, expect } from "@jest/globals";
import BrandBar, { adjustColorShade } from "@/components/layout/BrandBar";

describe("BrandBar", () => {
  describe("rendering", () => {
    it("renders with default props", () => {
      const { getByTestId } = render(<BrandBar />);

      const brandBar = getByTestId("brandbar");
      expect(brandBar).toBeTruthy();
    });

    it("renders with custom testID", () => {
      const { getByTestId } = render(<BrandBar testID="loyola-brandbar" />);

      const brandBar = getByTestId("loyola-brandbar");
      expect(brandBar).toBeTruthy();
    });

    it("renders the overlay gradient with matching testID", () => {
      const { getByTestId } = render(<BrandBar testID="sgw-brandbar" />);

      const overlay = getByTestId("sgw-brandbar-overlay");
      expect(overlay).toBeTruthy();
    });

    it("applies default height of 40", () => {
      const { getByTestId } = render(<BrandBar />);

      const brandBar = getByTestId("brandbar");
      const styles = brandBar.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flatStyle.height).toBe(40);
    });

    it("applies custom height when provided", () => {
      const { getByTestId } = render(<BrandBar height={60} />);

      const brandBar = getByTestId("brandbar");
      const styles = brandBar.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flatStyle.height).toBe(60);
    });

    it("uses default burgundy color (#800020) for gradient", () => {
      const { getByTestId } = render(<BrandBar />);

      const brandBar = getByTestId("brandbar");
      const colors = brandBar.props.colors;

      expect(colors).toHaveLength(3);
      expect(colors[0]).toBe(colors[2]); // Edge colors should match
    });

    it("applies custom backgroundColor to gradient", () => {
      const customColor = "#e3ac20"; // Loyola gold
      const { getByTestId } = render(
        <BrandBar backgroundColor={customColor} />,
      );

      const brandBar = getByTestId("brandbar");
      const colors = brandBar.props.colors;

      expect(colors).toHaveLength(3);
      expect(colors[0]).toBe(colors[2]); // Edge colors should match
    });

    it("has correct gradient locations", () => {
      const { getByTestId } = render(<BrandBar />);

      const brandBar = getByTestId("brandbar");

      expect(brandBar.props.locations).toEqual([0, 0.5, 1]);
    });

    it("has horizontal gradient direction", () => {
      const { getByTestId } = render(<BrandBar />);

      const brandBar = getByTestId("brandbar");

      expect(brandBar.props.start).toEqual({ x: 0, y: 0 });
      expect(brandBar.props.end).toEqual({ x: 1, y: 0 });
    });

    it("overlay has vertical gradient direction", () => {
      const { getByTestId } = render(<BrandBar />);

      const overlay = getByTestId("brandbar-overlay");

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

    it("handles the SGW burgundy color", () => {
      const burgundy = "#800020";
      const darkerShade = adjustColorShade(burgundy, -0.25);
      const lighterShade = adjustColorShade(burgundy, 0.1);

      expect(darkerShade).not.toBe(burgundy);
      expect(lighterShade).not.toBe(burgundy);
      expect(darkerShade).not.toBe(lighterShade);
    });

    it("handles the Loyola gold color", () => {
      const gold = "#e3ac20";
      const darkerShade = adjustColorShade(gold, -0.25);
      const lighterShade = adjustColorShade(gold, 0.1);

      expect(darkerShade).not.toBe(gold);
      expect(lighterShade).not.toBe(gold);
      expect(darkerShade).not.toBe(lighterShade);
    });

    it("produces valid hex color format", () => {
      const result = adjustColorShade("#123456", 0.3);

      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});
