import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { StartLiveBanner } from "@/components/ui/StartLiveBanner";

describe("StartLiveBanner", () => {
  it("renders nothing when visible=false", () => {
    const { queryByText } = render(
      <StartLiveBanner visible={false} bottomOffset={40} onExit={jest.fn()} />,
    );

    expect(queryByText("Go to start to begin live navigation")).toBeNull();
    expect(queryByText("Exit")).toBeNull();
  });

  it("renders message and Exit when visible=true", () => {
    const { getByText } = render(
      <StartLiveBanner visible={true} bottomOffset={40} onExit={jest.fn()} />,
    );

    expect(getByText("Go to start to begin live navigation")).toBeTruthy();
    expect(getByText("Exit")).toBeTruthy();
  });

  it("calls onExit when Exit is pressed", () => {
    const onExit = jest.fn();
    const { getByText } = render(
      <StartLiveBanner visible={true} bottomOffset={40} onExit={onExit} />,
    );

    fireEvent.press(getByText("Exit"));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});

