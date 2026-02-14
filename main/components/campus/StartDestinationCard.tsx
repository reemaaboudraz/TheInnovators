import React from "react";
import { Image, Pressable, StyleSheet, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  startValue: string;
  destinationValue: string;
  onChangeStart: (text: string) => void;
  onChangeDestination: (text: string) => void;
  onSwapPress?: () => void;
};

export default function StartDestinationCard({
  startValue,
  destinationValue,
  onChangeStart,
  onChangeDestination,
  onSwapPress,
}: Props) {
  return (
    <View testID="startDestinationCard" style={styles.card}>
      <View style={styles.leftRailCol}>
        <Image
          source={require("@/assets/icons/start-destination-rail.png")}
          style={styles.railIcon}
          resizeMode="contain"
          accessibilityLabel="Start and destination rail icon"
        />
      </View>

      <View style={styles.inputsCol}>
        <TextInput
          testID="startInput"
          style={styles.input}
          value={startValue}
          onChangeText={onChangeStart}
          placeholder="Enter your starting location"
          placeholderTextColor="#9C9CA3"
          returnKeyType="next"
        />
        <TextInput
          testID="destinationInput"
          style={styles.input}
          value={destinationValue}
          onChangeText={onChangeDestination}
          placeholder="Enter your destination"
          placeholderTextColor="#9C9CA3"
          returnKeyType="done"
        />
      </View>

      <Pressable
        testID="swapLocationsButton"
        onPress={onSwapPress}
        style={styles.swapBtn}
        accessibilityRole="button"
        accessibilityLabel="Swap start and destination"
      >
        <MaterialCommunityIcons
          name="swap-vertical"
          size={31}
          color="#111111"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 96,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 8,
  },
  leftRailCol: {
    width: 34,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  railIcon: {
    width: 24,
    height: 80,
  },
  inputsCol: {
    flex: 1,
    height: "100%",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  input: {
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E9E9EE",
    paddingHorizontal: 14,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "500",
    color: "#1E1E1E",
  },
  swapBtn: {
    width: 36,
    height: 78,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
