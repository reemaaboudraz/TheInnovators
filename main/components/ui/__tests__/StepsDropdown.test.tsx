import React from "react";
import { render } from "@testing-library/react-native";
import { StepsDropdown } from "@/components/ui/StepsDropdown";

describe("StepsDropdown", () => {
  const steps = [
    { instruction: "Turn left" },
    { instruction: "Go straight" },
  ] as any[];

  it("does not render when visible=false", () => {
    const { queryByText } = render(
      <StepsDropdown
        visible={false}
        steps={steps}
        activeIndex={0}
        onClose={jest.fn()}
      />,
    );

    expect(queryByText("Turn left")).toBeNull();
    expect(queryByText("Go straight")).toBeNull();
  });

  it("renders steps when visible=true", () => {
    const { getByText } = render(
      <StepsDropdown
        visible={true}
        steps={steps}
        activeIndex={0}
        onClose={jest.fn()}
      />,
    );

    expect(getByText("Turn left")).toBeTruthy();
    expect(getByText("Go straight")).toBeTruthy();
  });
});
