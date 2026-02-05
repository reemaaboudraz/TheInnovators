import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";

import type { Building, Campus } from "@/components/Buildings/types";
import { BUILDING_IMAGES } from "@/components/Buildings/details/buildingImages";
import BuildingPin from "@/components/campus/BuildingPin";

import { BUILDING_DETAILS } from "@/components/Buildings/details/buildingDetails";
import { BUILDING_ICONS } from "@/components/Buildings/details/buildingIcons";

type Props = {
  building: Building;
  campusTheme: Campus;
  onClose: () => void;
};

export default function BuildingPopup({
  building,
  campusTheme,
  onClose,
}: Readonly<Props>) {
  const sheetRef = useRef<BottomSheet>(null);

  // Keep your current behavior
  const snapPoints = useMemo(() => ["19%", "75%"], []);

  const theme =
    campusTheme === "SGW"
      ? {
          brand: "#912338",
          brandSoft: "rgba(145,35,56,0.10)",
          cardBorder: "rgba(145,35,56,0.25)",
          icon: "#912338",
        }
      : {
          brand: "#E0B100",
          brandSoft: "rgba(224,177,0,0.10)",
          cardBorder: "rgba(224,177,0,0.25)",
          icon: "#E0B100",
        };

  const expandSheet = useCallback(() => {
    sheetRef.current?.snapToIndex(1);
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  useEffect(() => {
    sheetRef.current?.snapToIndex(0);
  }, [building?.id]);

  const thumbSource = BUILDING_IMAGES[building.code];
  const details = BUILDING_DETAILS[building.code]; // H exists, others = undefined

  const Handle = useCallback(
    (_props: BottomSheetHandleProps) => {
      return (
        <View style={styles.handleWrap}>
          <Pressable
            onPress={expandSheet}
            style={styles.handleTapArea}
            testID="buildingPopup-handle"
          >
            <View style={styles.handleIndicator} />
          </Pressable>

          <Pressable
            onPress={closeSheet}
            hitSlop={14}
            style={styles.handleCloseBtn}
            testID="buildingPopup-close"
          >
            <Text style={[styles.handleCloseText, { color: theme.icon }]}>
              ✕
            </Text>
          </Pressable>
        </View>
      );
    },
    [expandSheet, closeSheet, theme.icon],
  );

  const IconRow = ({
    iconKey,
    title,
    description,
  }: {
    iconKey: keyof typeof BUILDING_ICONS;
    title: string;
    description: string;
  }) => (
    <View style={styles.iconRow}>
      <Image source={BUILDING_ICONS[iconKey]} style={styles.rowIcon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!description && <Text style={styles.rowDesc}>{description}</Text>}
      </View>
    </View>
  );

  const SimpleRow = ({
    iconKey,
    title,
    description,
  }: {
    iconKey: keyof typeof BUILDING_ICONS;
    title: string;
    description: string;
  }) => <IconRow iconKey={iconKey} title={title} description={description} />;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      handleComponent={Handle}
      backgroundStyle={[
        styles.sheetBackground,
        { borderColor: theme.cardBorder },
      ]}
    >
      {/* ✅ Small popup header stays as-is */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <BuildingPin code={building.code} campus={campusTheme} size={46} />

          <View style={styles.textBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {building.name}
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              {building.address}
            </Text>

            <Pressable
              onPress={() => {}}
              style={[styles.directionsBtn, { borderColor: theme.cardBorder }]}
              testID="directionsButton"
            >
              <Text style={[styles.directionsText, { color: theme.brand }]}>
                Directions
              </Text>
            </Pressable>
          </View>

          {thumbSource ? (
            <Image source={thumbSource} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]} />
          )}
        </View>
      </View>

      {/* ✅ Expanded content becomes data-driven */}
      <BottomSheetScrollView
        contentContainerStyle={[styles.content, styles.hiddenAtFirst]}
        showsVerticalScrollIndicator={false}
      >
        {!details ? (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Details coming soon</Text>
            <Text style={styles.cardText}>
              We’ll add the expanded info for this building next.
            </Text>
          </View>
        ) : (
          <>
            {/* Building accessibility */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Building Accessibility</Text>
              {details.accessibility.map((item) => (
                <IconRow
                  key={item.title}
                  iconKey={item.icon}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </View>

            {/* Metro Accessibility */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Metro Accessibility</Text>
              <SimpleRow
                iconKey="metro"
                title={details.metro.title}
                description={details.metro.description}
              />
            </View>

            {/* Building Connectivity */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Building Connectivity</Text>
              <SimpleRow
                iconKey="connectedBuildings"
                title={details.connectivity.title}
                description={details.connectivity.description}
              />
            </View>

            {/* Number of Entries */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Number of Entries</Text>
              {details.entries.map((e, idx) => (
                <SimpleRow
                  key={`${e.title}-${idx}`}
                  iconKey="entry"
                  title={e.title}
                  description={e.description}
                />
              ))}
            </View>

            {/* Other services */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Other services</Text>
              {details.otherServices.map((item) => (
                <IconRow
                  key={item.title}
                  iconKey={item.icon}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </View>

            {/* Overview */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Building Overview</Text>
              {details.overview.map((p, idx) => (
                <Text key={idx} style={styles.paragraph}>
                  {p}
                </Text>
              ))}
            </View>

            {/* Venues */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Venues</Text>
              {details.venues.map((v) => (
                <View key={v} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{v}</Text>
                </View>
              ))}
            </View>

            {/* Departments */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Departments</Text>
              {details.departments.map((d) => (
                <View key={d} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Services */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Services</Text>
              {details.services.map((s) => (
                <View key={s} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{s}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 32 }} />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "white",
    borderWidth: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },

  handleWrap: {
    paddingTop: 6,
    paddingBottom: 4,
    justifyContent: "center",
  },
  handleTapArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 4,
  },
  handleIndicator: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.25)",
    marginBottom: 4,
  },
  handleCloseBtn: {
    position: "absolute",
    right: 12,
    top: 2,
    padding: 8,
    zIndex: 10,
  },
  handleCloseText: {
    fontSize: 18,
    fontWeight: "900",
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  textBlock: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22,
  },
  sub: {
    fontSize: 15,
    lineHeight: 19,
    opacity: 0.75,
    marginTop: 4,
  },

  directionsBtn: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
    backgroundColor: "white",
  },
  directionsText: {
    fontSize: 12,
    fontWeight: "900",
  },

  thumb: {
    width: 88,
    height: 62,
    borderRadius: 16,
    resizeMode: "cover",
    overflow: "hidden",
    marginTop: 6,
  },
  thumbPlaceholder: {
    backgroundColor: "rgba(0,0,0,0.10)",
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  hiddenAtFirst: {
    paddingTop: 30,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  rowIcon: {
    width: 26,
    height: 26,
    resizeMode: "contain",
    marginTop: 2,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  rowDesc: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },

  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
    marginBottom: 10,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 4,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 20,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
});
