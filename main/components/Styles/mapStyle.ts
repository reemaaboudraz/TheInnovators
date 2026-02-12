import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },

  topOverlay: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    gap: 10,
  },

  // FIGMA-LIKE compact white card
  navigationCard: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.97)",
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  inputsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  leftIconsColumn: {
    width: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
  },

  startDot: {
    fontSize: 18,
    color: "#111111",
    lineHeight: 18,
  },

  dottedLine: {
    width: 1,
    height: 14,
    borderWidth: 1,
    borderStyle: "dotted",
    borderColor: "rgba(17,17,17,0.4)",
    marginVertical: 2,
  },

  destinationPin: {
    fontSize: 16,
    lineHeight: 16,
  },

  inputsColumn: {
    flex: 1,
    gap: 8,
  },

  routeInput: {
    height: 42,
    borderRadius: 999,
    backgroundColor: "#F0F1F3",
    paddingHorizontal: 14,
    color: "#222",
    fontWeight: "600",
    fontSize: 16,
  },

  routeInputActive: {
    borderWidth: 1.5,
    borderColor: "#8CA2FF",
    backgroundColor: "#EEF3FF",
  },

  swapButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F1F3",
  },

  swapButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    lineHeight: 20,
  },

  suggestions: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.98)",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.12)",
  },

  suggestionRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },

  suggestionTitle: {
    color: "#111",
    fontWeight: "700",
    fontSize: 14,
  },

  suggestionSub: {
    marginTop: 2,
    color: "rgba(17,17,17,0.55)",
    fontSize: 12,
  },

  // hidden compat element
  hiddenCompatButton: {
    width: 0,
    height: 0,
    opacity: 0,
    overflow: "hidden",
  },

  campusToggleContainer: {
    flexDirection: "row",
    borderRadius: 999,
    backgroundColor: "#EBE6E0",
    marginTop: 46,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },

  campusToggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  campusToggleButtonLeft: {
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
  },

  campusToggleButtonRight: {
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },

  campusToggleSlider: {
    position: "absolute",
    top: 4,
    bottom: 4,
    width: "46%",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2,
    elevation: 2,
  },

  campusToggleText: {
    fontSize: 18,
    fontWeight: "700",
  },

  sliderShadowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  activeLabel: { color: "#FFFFFF" },
  inactiveLabel: { color: "#8F6B1E" },
  activeLabelSgw: { color: "#FFFFFF" },
  inactiveLabelSgw: { color: "#8C6A2D" },

  mapBottomOffset: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    height: 1,
  },
});
