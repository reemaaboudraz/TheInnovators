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
    marginTop: 40,
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
});
