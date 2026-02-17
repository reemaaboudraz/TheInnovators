import React, { useCallback, useMemo, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

import type {
  DirectionRoute,
  TravelMode,
} from "@/components/campus/helper_methods/googleDirections";

type ModeData = {
  mode: TravelMode;
  routes: DirectionRoute[];
};

type Props = {
  campusTheme: "SGW" | "LOY";
  visible: boolean;
  modes: ModeData[]; // one entry per mode
  selectedMode: TravelMode;
  selectedRouteIndex: number;
  onSelectMode: (mode: TravelMode) => void;
  onSelectRouteIndex: (index: number) => void;
  onClose: () => void;
};

function formatDuration(text?: string): string {
  if (!text) return "--";

  return text
    .replace(/hours?/gi, "h")
    .replace(/mins?/gi, "m")
    .replace(/\s+/g, " ")
    .trim();
}

function iconForMode(mode: TravelMode) {
  switch (mode) {
    case "driving":
      return "directions-car";
    case "walking":
      return "directions-walk";
    case "transit":
      return "directions-transit";
    case "bicycling":
      return "directions-bike";
  }
}

export default function TravelOptionsPopup({
  campusTheme,
  visible,
  modes,
  selectedMode,
  selectedRouteIndex,
  onSelectMode,
  onSelectRouteIndex,
  onClose,
}: Readonly<Props>) {
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const theme =
    campusTheme === "SGW"
      ? { brand: "#912338", border: "rgba(145,35,56,0.25)" }
      : { brand: "#E0B100", border: "rgba(224,177,0,0.25)" };

  const snapPoints = useMemo(() => {
    const collapsed = Math.max(260, Math.round(windowHeight * 0.28));
    const topBuffer = insets.top - 6;
    const expanded = Math.max(300, windowHeight - topBuffer);
    return [collapsed, expanded];
  }, [windowHeight, insets.top]);

  const expandSheet = useCallback(() => sheetRef.current?.snapToIndex(1), []);
  const closeSheet = useCallback(() => {
    sheetRef.current?.close();
    onClose(); // make state update immediate + testable
  }, [onClose]);

  const Handle = useCallback(
    (_props: BottomSheetHandleProps) => (
      <View style={s.handleWrap}>
        <Pressable
          onPress={expandSheet}
          style={s.handleTapArea}
          testID="travelPopup-handle"
        >
          <View style={s.handleIndicator} />
        </Pressable>

        <Pressable
          onPress={closeSheet}
          hitSlop={14}
          style={s.handleCloseBtn}
          testID="travelPopup-close"
        >
          <Text style={[s.handleCloseText, { color: theme.brand }]}>✕</Text>
        </Pressable>
      </View>
    ),
    [expandSheet, closeSheet, theme.brand],
  );

  const selectedModeData = modes.find((m) => m.mode === selectedMode);
  const routes = selectedModeData?.routes ?? [];

  if (!visible) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      handleComponent={Handle}
      topInset={Math.max(0, insets.top - 6)}
      backgroundStyle={[s.sheetBackground, { borderColor: theme.border }]}
    >
      <View style={s.header}>
        <Text style={s.headerTitle}>Directions</Text>
      </View>

      <View style={s.modeBar}>
        {modes.map((m) => {
          const fastest = m.routes[0];
          const active = m.mode === selectedMode;

          return (
            <Pressable
              key={m.mode}
              onPress={() => onSelectMode(m.mode)}
              style={[s.modeChip, active && s.modeChipActive]}
              testID={`mode-${m.mode}`}
            >
              <MaterialIcons
                name={iconForMode(m.mode) as any}
                size={18}
                color={active ? "#111" : "rgba(17,17,17,0.55)"}
              />
              <Text style={[s.modeChipTime, active && s.modeChipTimeActive]}
                numberOfLines={1}
                testID={`mode-${m.mode}-time`}
                ellipsizeMode="tail">
                {formatDuration(fastest?.durationText)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <BottomSheetScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {routes.map((r, idx) => {
          const active = idx === selectedRouteIndex;

          return (
            <Pressable
              key={`${selectedMode}-${idx}`}
              onPress={() => onSelectRouteIndex(idx)}
              style={[s.routeCard, active && s.routeCardActive]}
              testID={`route-${selectedMode}-${idx}`}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.routeBig}>{r.durationText}</Text>
                <Text style={s.routeMeta}>{r.distanceText}</Text>
                {!!r.summary && <Text style={s.routeSummary}>{r.summary}</Text>}
              </View>

              <Pressable
                onPress={(e: any) => {
                  e?.stopPropagation?.();
                }}
                style={s.goBtn}
                testID={`go-${selectedMode}-${idx}`}
              >
                <Text style={s.goText}>GO</Text>
              </Pressable>
            </Pressable>
          );
        })}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  sheetBackground: {
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.98)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  headerClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCloseText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  handleWrap: {
    paddingTop: 6,
    paddingBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  handleTapArea: { width: "100%", alignItems: "center", paddingVertical: 6 },
  handleIndicator: {
    width: 44,
    height: 4,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  handleCloseBtn: { position: "absolute", right: 12, top: 2 },
  handleCloseText: { fontSize: 18, fontWeight: "700" },

  modeBar: {
    marginHorizontal: 16,
    marginBottom: 6,
    padding: 6,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.06)",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  modeChip: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  modeChipActive: {
    backgroundColor: "white",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  modeChipTime: {
    fontSize: 13,
    fontWeight: "800",
    color: "rgba(17,17,17,0.55)",
    maxWidth: 60,
  },
  modeChipTimeActive: {
    color: "#111",
  },

  modeRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  modePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(17,17,17,0.05)",
  },
  modePillActive: {
    backgroundColor: "rgba(17,17,17,0.10)",
  },
  modeTime: { fontSize: 13, color: "#111", fontWeight: "700" },

  content: { padding: 14, gap: 10, paddingBottom: 30 },

  routeCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(17,17,17,0.05)",
  },
  routeCardActive: {
    backgroundColor: "rgba(17,17,17,0.08)",
  },
  routeBig: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
  },
  routeMeta: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(17,17,17,0.55)",
  },
  routeSummary: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(17,17,17,0.55)",
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(17,17,17,0.05)",
  },
  routeRowActive: {
    backgroundColor: "rgba(11,87,208,0.10)",
  },
  routeTitle: { fontSize: 14, fontWeight: "800", color: "#111" },
  routeSub: { fontSize: 12, color: "rgba(17,17,17,0.55)", marginTop: 2 },

  goBtn: {
    marginLeft: 12,
    backgroundColor: "#22C55E",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  goText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
});
