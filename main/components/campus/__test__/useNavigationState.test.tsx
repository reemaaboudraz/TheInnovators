import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";
import { useNavigationState } from "@/components/campus/useNavigationState";
import type { Building } from "@/components/Buildings/types";

const startB: Building = {
  id: "s",
  code: "H",
  name: "Henry Hall",
  address: "addr",
  latitude: 1,
  longitude: 1,
  campus: "SGW",
  zoomCategory: 2,
  aliases: [],
  polygon: [],
};

const destB: Building = {
  id: "d",
  code: "AD",
  name: "Administration",
  address: "addr",
  latitude: 2,
  longitude: 2,
  campus: "LOY",
  zoomCategory: 2,
  aliases: [],
  polygon: [],
};

function HookHarness() {
  const s = useNavigationState();

  return (
    <View>
      <Text testID="startValue">{s.startValue}</Text>
      <Text testID="destinationValue">{s.destinationValue}</Text>
      <Text testID="selectionMode">{String(s.selectionMode)}</Text>

      <Pressable testID="setStart" onPress={() => s.setStartBuilding(startB)} />
      <Pressable
        testID="setDest"
        onPress={() => s.setDestinationBuilding(destB)}
      />
      <Pressable testID="setMode" onPress={() => s.setSelectionMode("start")} />
      <Pressable testID="setQuery" onPress={() => s.setQuery("abc")} />
      <Pressable testID="swap" onPress={s.swap} />
    </View>
  );
}

describe("useNavigationState", () => {
  it("initial state is empty/null", () => {
    const { getByTestId } = render(<HookHarness />);
    expect(getByTestId("startValue").props.children).toBe("");
    expect(getByTestId("destinationValue").props.children).toBe("");
    expect(getByTestId("selectionMode").props.children).toBe("null");
  });

  it("builds display values and swaps start/destination", () => {
    const { getByTestId } = render(<HookHarness />);

    fireEvent.press(getByTestId("setStart"));
    fireEvent.press(getByTestId("setDest"));

    expect(getByTestId("startValue").props.children).toBe("H - Henry Hall");
    expect(getByTestId("destinationValue").props.children).toBe(
      "AD - Administration",
    );

    fireEvent.press(getByTestId("swap"));

    expect(getByTestId("startValue").props.children).toBe(
      "AD - Administration",
    );
    expect(getByTestId("destinationValue").props.children).toBe(
      "H - Henry Hall",
    );
  });
});
