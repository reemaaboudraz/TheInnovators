import React, { useCallback, useState } from "react";
import { Pressable, Text, Alert, StyleSheet } from "react-native";
import * as Location from "expo-location";

export type LocationStatus = "idle" | "loading" | "granted" | "denied";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

interface CurrentLocationButtonProps {
  onLocationFound: (location: UserLocation) => void;
  onPermissionDenied?: () => void;
}

export default function CurrentLocationButton({
  onLocationFound,
  onPermissionDenied,
}: CurrentLocationButtonProps) {
  const [status, setStatus] = useState<LocationStatus>("idle");

  const handlePress = useCallback(async () => {
    setStatus("loading");

    try {
      // Request permission
      const { status: permissionStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (permissionStatus !== "granted") {
        setStatus("denied");
        Alert.alert(
          "Location Permission Required",
          "Please enable location services in your device settings to use this feature.",
          [{ text: "OK" }],
        );
        onPermissionDenied?.();
        return;
      }

      setStatus("granted");

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      onLocationFound({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      setStatus("idle");
      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please try again.",
        [{ text: "OK" }],
      );
    }
  }, [onLocationFound, onPermissionDenied]);

  return (
    <Pressable
      testID="currentLocationButton"
      style={styles.button}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Center map on current location"
      accessibilityState={{ busy: status === "loading" }}
    >
      <Text style={styles.icon}>{status === "loading" ? "..." : "◎"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 100,
    right: 14,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    fontSize: 24,
    color: "#007AFF",
    fontWeight: "600",
  },
});
