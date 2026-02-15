import React, { useCallback, useState } from "react";
import { Pressable, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { getDeviceLocation, LocationError } from "@/components/campus/locationUtils";

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
                                              }: Readonly<CurrentLocationButtonProps>) {
    const [status, setStatus] = useState<LocationStatus>("idle");

    const handlePress = useCallback(async () => {
        setStatus("loading");

        try {
            const loc = await getDeviceLocation();

            setStatus("granted");
            onLocationFound({
                latitude: loc.latitude,
                longitude: loc.longitude,
            });
        } catch (error: any) {
            // Keep your status behavior consistent
            if (error instanceof LocationError) {
                if (error.code === "PERMISSION_DENIED") {
                    setStatus("denied");
                    Alert.alert(
                        "Location Permission Required",
                        "Please enable location services in your device settings to use this feature.",
                        [{ text: "OK" }],
                    );
                    onPermissionDenied?.();
                    return;
                }

                if (error.code === "SERVICES_OFF") {
                    setStatus("idle");
                    Alert.alert(
                        "Location Services Off",
                        "Please enable location services on your device to use this feature.",
                        [{ text: "OK" }],
                    );
                    return;
                }
            }

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
                <MaterialIcons name="near-me" size={26} color="#007AFF" />
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 50,
        height: 50,
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
