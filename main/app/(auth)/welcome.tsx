import React from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";

export default function WelcomeScreen() {
  const onGoogleSignInPress = () => {
    // UI only for now — logic later
    Alert.alert("Coming soon", "Google Sign-In logic will be added later.");
  };

  const onContinueGuestPress = () => {
    // Go straight to the map
    router.replace("/(tabs)/map");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Campus Guide</Text>
        <Text style={styles.subtitle}>
          Explore SGW & Loyola maps and find your way around.
        </Text>

        <Pressable style={styles.googleButton} onPress={onGoogleSignInPress}>
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </Pressable>
      </View>

      <Pressable onPress={onContinueGuestPress} style={styles.guestWrapper}>
        <Text style={styles.guestText}>Continue without signing in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    backgroundColor: "#800020",
  },
  content: {
    gap: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 18,
  },
  googleButton: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  guestWrapper: {
    alignItems: "center",
    paddingVertical: 10,
  },
  guestText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    textDecorationLine: "underline",
  },
});
