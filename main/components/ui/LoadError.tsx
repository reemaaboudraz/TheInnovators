import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type Props = Readonly<{
  visible: boolean;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  accentColor: string;
  testIDPrefix: string; // IMPORTANT
}>;

export default function LoadError({
  visible,
  title,
  message,
  primaryLabel,
  onPrimary,
  accentColor,
  testIDPrefix,
}: Props) {
  if (!visible) return null;

  return (
    <View style={s.overlay} testID={`${testIDPrefix}-overlay`}>
      <View style={s.card} testID={`${testIDPrefix}-card`}>
        <Text style={s.title}>{title}</Text>

        <Text style={s.body} testID={`${testIDPrefix}-message`}>
          {message}
        </Text>

        <Pressable
          onPress={onPrimary}
          style={[s.button, { backgroundColor: accentColor }]}
          testID={`${testIDPrefix}-refresh`}
        >
          <Text style={s.buttonText}>{primaryLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    marginBottom: 14,
  },
  button: {
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});
