import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  onLocationFound: (location: { latitude: number; longitude: number }) => void;
};

export default function CurrentLocationButton({ onLocationFound }: Props) {
  const handlePress = () => {
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
      <View style={styles.iconWrapper}>
        <MaterialIcons name="my-location" size={24} color="#0D2A3A" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#74C5DF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#0F3245",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
});
