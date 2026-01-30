import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
