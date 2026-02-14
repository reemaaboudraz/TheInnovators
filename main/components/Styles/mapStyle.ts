import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  map: {
    flex: 1,
  },

  // Keep overlay high and aligned with figma top spacing
  topOverlay: {
    position: "absolute",
    top: 32, // aligns segmented control Y from figma inspector
    left: 10,
    right: 10,
    zIndex: 20,
  },

  campusToggleContainer: {
    width: "100%",
    alignItems: "center",
  },

  // Search shell (white translucent rounded strip)
  // Figma search field itself is 354x29; this wrapper gives exact positioning space.
  browseSearchCard: {
    width: 354,
    height: 29,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.90)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    alignSelf: "center",
  },

  browseSearchIcon: {
    marginRight: 8,
  },

  browseSearchInput: {
    flex: 1,
    fontSize: 20 / 2, // 10
    lineHeight: 13,
    fontWeight: "500",
    color: "#3A3A3A",
    paddingVertical: 0,
  },

  browseClearButton: {
    marginLeft: 6,
  },

  browseClearText: {
    fontSize: 12,
    color: "#B9B9BB",
    fontWeight: "700",
  },

  suggestions: {
    marginTop: 6,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 12,
    overflow: "hidden",
  },

  suggestionRow: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  suggestionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1E1E",
  },

  suggestionSub: {
    marginTop: 2,
    fontSize: 12,
    color: "#666",
  },

  rightButtonsColumn: {
    position: "absolute",
    right: 16,
    bottom: 86,
    zIndex: 30,
    gap: 12,
    alignItems: "center",
  },

  directionsFab: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: "#912338",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#6E1B2A",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  directionsFabText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});
