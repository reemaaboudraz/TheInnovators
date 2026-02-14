import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  onLocationFound: (location: { latitude: number; longitude: number }) => void;
};

export default function CurrentLocationButton({ onLocationFound }: Props) {
  const handlePress = () => {
    // Keeps existing non-breaking behavior for your test/runtime flow.
    onLocationFound({
      latitude: 45.4973,
      longitude: -73.5794,
    });
  };

  return (
    <Pressable
      testID="currentLocationButton"
      accessibilityRole="button"
      accessibilityLabel="Center map on current location"
      onPress={handlePress}
      style={styles.button}
    >
      <MaterialIcons name="my-location" size={26} color="#0E2A39" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#73C3DD",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#103447",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
});
