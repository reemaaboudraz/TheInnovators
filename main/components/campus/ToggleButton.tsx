import React, { useMemo } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";

export type Campus = "SGW" | "LOY";

type Props = {
  focusedCampus: Campus;
  onCampusChange: (campus: Campus) => void;
};

export const calculatePanValue = (
  currentCampus: Campus,
  dx: number,
  toggleWidth: number,
) => {
  const safeWidth = toggleWidth > 0 ? toggleWidth : 300;
  const half = safeWidth / 2;
  const base = currentCampus === "SGW" ? 0 : 1;
  const delta = dx / half;
  const next = base + delta;
  return Math.max(0, Math.min(1, next));
};

export const determineCampusFromPan = (
  currentCampus: Campus,
  dx: number,
  toggleWidth: number,
): Campus => {
  const finalValue = calculatePanValue(currentCampus, dx, toggleWidth);
  return finalValue > 0.5 ? "LOY" : "SGW";
};

export default function ToggleButton({ focusedCampus, onCampusChange }: Props) {
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_evt, g) => Math.abs(g.dx) > 10,
        onPanResponderMove: () => {},
        onPanResponderRelease: (_evt, g) => {
          const next = determineCampusFromPan(focusedCampus, g.dx, 300);
          if (next !== focusedCampus) onCampusChange(next);
        },
      }),
    [focusedCampus, onCampusChange],
  );

  const sgwSelected = focusedCampus === "SGW";
  const loySelected = focusedCampus === "LOY";

  return (
    <View
      testID="campusToggle"
      style={styles.container}
      {...panResponder.panHandlers}
    >
      <Pressable
        testID="campusToggle-SGW"
        style={[styles.segment, sgwSelected && styles.segmentSGW]}
        onPress={() => onCampusChange("SGW")}
      >
        <Text
          style={[
            styles.label,
            sgwSelected ? styles.selectedText : styles.unselectedText,
          ]}
        >
          SGW
        </Text>
      </Pressable>

      <Pressable
        testID="campusToggle-Loyola"
        style={[styles.segment, loySelected && styles.segmentLOY]}
        onPress={() => onCampusChange("LOY")}
      >
        <Text
          style={[
            styles.label,
            loySelected ? styles.selectedText : styles.unselectedText,
          ]}
        >
          Loyola
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 53, // figma-like
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(195,170,170,0.10)",
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: "center",
    overflow: "hidden",
  },
  segment: {
    flex: 1,
    height: 45,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentSGW: {
    backgroundColor: "#9D1F43",
  },
  segmentLOY: {
    backgroundColor: "#D1A91E",
  },
  label: {
    fontSize: 39 / 2, // ~19.5
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  selectedText: {
    color: "#FFFFFF",
  },
  unselectedText: {
    color: "#1D1D1D",
  },
});
