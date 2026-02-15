import React from "react";
import { render } from "@testing-library/react-native";
import { StyleSheet, View } from "react-native";
import BuildingPin from "@/components/campus/BuildingPin";

describe("BuildingPin", () => {
  it("uses default size=44 and renders SGW pin", () => {
    const { getByText, UNSAFE_getAllByType } = render(
      <BuildingPin code="H" campus="SGW" />,
    );

    // Code label renders
    getByText("H");

    // Root View has correct default sizing
    const views = UNSAFE_getAllByType(View);
    const flat = StyleSheet.flatten(views[0].props.style);

    expect(flat).toMatchObject({
      width: 44,
      height: 44 * 1.5, // height = size * 1.5
    });
  });

  it("uses provided size and renders LOY pin branch", () => {
    const { getByText, UNSAFE_getAllByType } = render(
      <BuildingPin code="AD" campus="LOY" size={60} />,
    );

    getByText("AD");

    const views = UNSAFE_getAllByType(View);
    const flat = StyleSheet.flatten(views[0].props.style);

    expect(flat).toMatchObject({
      width: 60,
      height: 60 * 1.5, // size * 1.5
    });
  });
});
