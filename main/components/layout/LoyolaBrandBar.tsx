import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type SGWBrandBarProps = {
  height?: number;
  backgroundColor?: string;
};

function shadeColor(color: string, percent: number) {
  const f = Number.parseInt(color.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent);
  const R = f >> 16;
  const G = (f >> 8) & 0x00ff;
  const B = f & 0x0000ff;

  return (
    "#" +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}

export default function LoyolaBrandBar({
  height = 40,
  backgroundColor = "#e3ac20",
}: Readonly<SGWBrandBarProps>) {
  const edgeColor = shadeColor(backgroundColor, -0.25); // darker
  const centerColor = shadeColor(backgroundColor, 0.1); // slightly lighter

  return (
    <LinearGradient
      colors={[edgeColor, centerColor, edgeColor]}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.brandBar, { height }]}
    >
      {/* Glass shine */}
      <LinearGradient
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
