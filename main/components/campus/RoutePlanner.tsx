import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  isRouteMode: boolean;
  onToggle: () => void;
};

export default function RoutePlanner({
  isRouteMode,
  onToggle,
}: Readonly<Props>) {
  return (
    <Pressable
      testID="routeModeButton"
      onPress={onToggle}
      style={[s.diamond, isRouteMode ? s.on : s.off]}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Toggle route mode"
    >
      <Text style={s.arrow}>↱</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  diamond: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "45deg" }],
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 6,
  },
  on: {
    backgroundColor: "#912338",
  },
  off: {
    backgroundColor: "#912338",
  },
  arrow: {
    color: "white",
    fontSize: 20,
    transform: [{ rotate: "-45deg" }],
    fontWeight: "800",
  },
});
