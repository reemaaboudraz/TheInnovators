/// <reference types="jest" />
import React from "react";
import { Image } from "react-native";
import { render } from "@testing-library/react-native";

import BuildingPin from "../BuildingPin";

describe("BuildingPin", () => {
  it("renders the building code text", () => {
    const { getByText } = render(
      <BuildingPin code="H" campus="SGW" size={44} />,
    );

    expect(getByText("H")).toBeTruthy();
  });

  it("uses SGW pin image when campus is SGW", () => {
    const expected = require("@/assets/pins/pin_sgw.png");

    const { UNSAFE_getByType } = render(
      <BuildingPin code="H" campus="SGW" size={44} />,
    );

    const img = UNSAFE_getByType(Image);
    expect(img.props.source).toBe(expected);
  });

  it("uses Loyola pin image when campus is LOY", () => {
    const expected = require("@/assets/pins/pin_loyola.png");

    const { UNSAFE_getByType } = render(
      <BuildingPin code="AD" campus="LOY" size={44} />,
    );

    const img = UNSAFE_getByType(Image);
    expect(img.props.source).toBe(expected);
  });

  it("scales the font size based on size prop", () => {
    const size = 50;
    const expectedFontSize = Math.round(size * 0.3);

    const { getByText } = render(
      <BuildingPin code="EV" campus="SGW" size={size} />,
    );

    expect(getByText("EV")).toHaveStyle({ fontSize: expectedFontSize });
  });
});
