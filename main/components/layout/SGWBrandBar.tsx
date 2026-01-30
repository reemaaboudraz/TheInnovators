import React from "react";
import { View, StyleSheet } from "react-native";

type SGWBrandBarProps = {
  height?: number;
  backgroundColor?: string;
};

export default function SGWBrandBar({
  height = 40,
  backgroundColor = "#800020",
}: Readonly<SGWBrandBarProps>) {
  return <View style={[styles.brandBar, { height, backgroundColor }]} />;
}

const styles = StyleSheet.create({
  brandBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
