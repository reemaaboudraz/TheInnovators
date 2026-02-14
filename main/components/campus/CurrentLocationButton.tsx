import React, { useCallback, useState } from "react";
import { Pressable, Alert, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

export type LocationStatus = "idle" | "loading" | "granted" | "denied";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

interface CurrentLocationButtonProps {
  onLocationFound: (location: UserLocation) => void;
  onPermissionDenied?: () => void;
  style?: any;
}

export default function CurrentLocationButton({
  onLocationFound,
  onPermissionDenied,
  style,
}: CurrentLocationButtonProps) {
  const [status, setStatus] = useState<LocationStatus>("idle");

  const handlePress = useCallback(async () => {
    setStatus("loading");

    try {
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

      const last = await Location.getLastKnownPositionAsync();

      if (last) {
        onLocationFound({
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
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
      style={[styles.button, style]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Center map on current location"
      accessibilityState={{ busy: status === "loading" }}
    >
      {status === "loading" ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : (
        <MaterialIcons name="my-location" size={24} color="#007AFF" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
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
});
