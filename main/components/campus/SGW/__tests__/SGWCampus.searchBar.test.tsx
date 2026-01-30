import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { describe, it, expect } from "@jest/globals";
import SGWCampus from "@/app/(tabs)/map";

describe("SGWCampus - search bar", () => {
  it("updates text and clears input", () => {
    const { getByPlaceholderText, getByText } = render(<SGWCampus />);

    const input = getByPlaceholderText("Where to next?");
    fireEvent.changeText(input, "hall");

    const clearButton = getByText("✕");
    expect(clearButton).toBeTruthy();

    fireEvent.press(clearButton);
    expect(getByPlaceholderText("Where to next?").props.value).toBe("");
  });
});
