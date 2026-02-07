import React from "react";
import { render } from "@testing-library/react-native";
import { StyleSheet, View } from "react-native";
import BuildingPin from "@/components/campus/BuildingPin";

describe("BuildingPin", () => {
  it("uses default size=44 and renders SGW pin", () => {
    const { getByText, UNSAFE_getAllByType } = render(
      <BuildingPin code="H" campus="SGW" />,
    );

    getByText("H");

    const views = UNSAFE_getAllByType(View);
    const flat = StyleSheet.flatten(views[0].props.style);

    expect(flat).toMatchObject({ width: 44, height: 55 });
  });

  it("uses provided size and renders LOY pin branch", () => {
    const { getByText, UNSAFE_getAllByType } = render(
      <BuildingPin code="AD" campus="LOY" size={60} />,
    );

    getByText("AD");

    const views = UNSAFE_getAllByType(View);
    const flat = StyleSheet.flatten(views[0].props.style);

    expect(flat).toMatchObject({ width: 60, height: 75 });
  });
});
