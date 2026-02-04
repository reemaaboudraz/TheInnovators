import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },

  topOverlay: {
    position: "absolute",
    top: 10,
    left: 14,
    right: 14,
    gap: 10,
  },

  searchBar: {
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchIcon: {
    fontSize: 18,
    color: "rgba(17,17,17,0.55)",
  },

  searchInput: {
    flex: 1,
    color: "#111111",
    fontWeight: "600",
  },

  suggestions: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    overflow: "hidden",
  },

  suggestionRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },

  suggestionTitle: {
    fontWeight: "700",
    color: "#111111",
  },

  suggestionSub: {
    marginTop: 2,
    color: "rgba(17,17,17,0.55)",
    fontSize: 12,
  },

  clearButton: {
    paddingHorizontal: 4,
  },

  clearIcon: {
    fontSize: 16,
    color: "rgba(17,17,17,0.55)",
    fontWeight: "700",
  },

  campusToggleContainer: {
    flexDirection: "row",
    borderRadius: 999,
    backgroundColor: "#EBE6E0",
    marginTop: 50,
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
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  campusToggleText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5C4033",
  },

  campusToggleTextActive: {
    color: "#FFFFFF",
  },
});
