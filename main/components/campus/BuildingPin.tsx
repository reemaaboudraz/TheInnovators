import React from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  ImageSourcePropType,
} from "react-native";
import type { Campus } from "@/components/Buildings/types";

const SGW_PIN: ImageSourcePropType = require("@/assets/pins/pin_rm.png");
const LOY_PIN: ImageSourcePropType = require("@/assets/pins/pin_rm.png");

type Props = {
  code: string;
  campus: Campus;
  size?: number; // controls the whole pin size
  /** When set, shown on the pin instead of code (e.g. building name for route pins). */
  label?: string;
};

export default function BuildingPin({ code, campus, size = 44, label }: Props) {
  const src = campus === "SGW" ? SGW_PIN : LOY_PIN;
  const displayText = label ?? code;
  const pinHeight = size * 1.50

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: pinHeight,
        },
      ]}
    >
      <Image
        source={src}
        style={[styles.pin, { width: size, height: pinHeight }]}
        resizeMode="contain"
      />

      <View style={styles.textOverlay} pointerEvents="none">
        <Text
          style={[
            styles.code,
            {
              fontSize: label ? Math.round(size * 0.22) : Math.round(size * 0.3),
            },
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {displayText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  pin: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  textOverlay: {
    position: "absolute",
    top: "13%", // ⬅️ centers text in the circular head
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  code: {
    color: "white",
    fontWeight: "900",
    letterSpacing: 0.4,
  },
});
