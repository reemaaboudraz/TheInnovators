import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type BrandBarProps = {
  height?: number;
  backgroundColor?: string;
};

export function adjustColorShade(baseColor: string, intensity: number) {
  const colorValue = Number.parseInt(baseColor.slice(1), 16);
  const targetValue = intensity < 0 ? 0 : 255;
  const factor = Math.abs(intensity);

  const red = colorValue >> 16;
  const green = (colorValue >> 8) & 0x00ff;
  const blue = colorValue & 0x0000ff;

  return (
    "#" +
    (
      0x1000000 +
      (Math.round((targetValue - red) * factor) + red) * 0x10000 +
      (Math.round((targetValue - green) * factor) + green) * 0x100 +
      (Math.round((targetValue - blue) * factor) + blue)
    )
      .toString(16)
      .slice(1)
  );
}

export default function LoyolaBrandBar({
  height = 40,
  backgroundColor = "#e3ac20",
}: Readonly<BrandBarProps>) {
  const gradientEdgeColor = adjustColorShade(backgroundColor, -0.25);
  const gradientCenterColor = adjustColorShade(backgroundColor, 0.1);

  return (
    <LinearGradient
      testID="loyola-brandbar"
      colors={[gradientEdgeColor, gradientCenterColor, gradientEdgeColor]}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.brandBar, { height }]}
    >
      <LinearGradient
        testID="loyola-brandbar-overlay"
        colors={[
          "rgba(255,255,255,0.28)",
          "rgba(255,255,255,0.06)",
          "rgba(0,0,0,0.18)",
        ]}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  brandBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
});
