import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { styles } from "@/components/Styles/welcomeStyle";
// adjust path as needed

export default function WelcomeScreen() {
  // To do we have to configure google sign in
  const onGoogleSignInPress = () => {
    Alert.alert("Coming soon", "Google Sign-In logic will be added later.");
  };

  const onContinueGuestPress = () => {
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
