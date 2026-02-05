import React from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  ImageSourcePropType,
} from "react-native";
import type { Campus } from "@/components/Buildings/types";

const SGW_PIN: ImageSourcePropType = require("@/assets/pins/pin_sgw.png");
const LOY_PIN: ImageSourcePropType = require("@/assets/pins/pin_loyola.png");

type Props = {
  code: string;
  campus: Campus;
  size?: number; // controls the whole pin size
};

export default function BuildingPin({ code, campus, size = 44 }: Props) {
  const src = campus === "SGW" ? SGW_PIN : LOY_PIN;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size * 1.25, // ⬅️ taller pin = more breathing room
        },
      ]}
    >
      <Image source={src} style={styles.pin} />

      <View style={styles.textOverlay} pointerEvents="none">
        <Text
          style={[
            styles.code,
            {
              fontSize: Math.round(size * 0.30), // ⬅️ slightly bigger text
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {code}
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
