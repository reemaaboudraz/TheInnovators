import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  StyleSheet,
} from "react-native";
import MapView, {
  Marker,
  Polygon,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { StatusBar } from "expo-status-bar";

import { SGW_BUILDINGS } from "@/components/Buildings/SGW/SGWBuildings";
import { LOYOLA_BUILDINGS } from "@/components/Buildings/Loyola/LoyolaBuildings";
import type { Building, Campus } from "@/components/Buildings/types";

import BrandBar from "@/components/layout/BrandBar";
import { styles } from "@/components/Styles/mapStyle";

const SGW_REGION: Region = {
  latitude: 45.4973,
  longitude: -73.5794,
  latitudeDelta: 0.006,
  longitudeDelta: 0.006,
};

// Activate the comment block for the Loyola map coordinates when implementing the toggle button
// const LOY_REGION: Region = {
//     latitude: 45.457984,
//     longitude: -73.639834,
//     latitudeDelta: 0.006,
//     longitudeDelta: 0.006,
// };

// Start at SGW (still renders Loyola buildings in the background)
const INITIAL_REGION: Region = SGW_REGION;

const CAMPUS_COLORS = {
  SGW: {
    stroke: "#912338",
    fill: "rgba(145, 35, 56, 0.30)",
    fillSelected: "rgba(145, 35, 56, 0.55)",
  },
  LOY: {
    stroke: "#E0B100",
    fill: "rgba(224, 177, 0, 0.30)",
    fillSelected: "rgba(224, 177, 0, 0.55)",
  },
};

export default function CampusMap() {
  const [focusedCampus, setFocusedCampus] = useState<Campus>("SGW");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Building | null>(null);

  const mapRef = useRef<MapView>(null);

  const ALL_BUILDINGS = useMemo(
    () => [...SGW_BUILDINGS, ...LOYOLA_BUILDINGS],
    [],
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return ALL_BUILDINGS.filter(
      (b) =>
        b.code.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.aliases.some((a) => a.toLowerCase().includes(q)),
    ).slice(0, 6);
  }, [query, ALL_BUILDINGS]);

  const onPickBuilding = (b: Building) => {
    setSelected(b);
    setQuery(`${b.code} - ${b.name}`);

    // Keep this: used for BrandBar color + future features
    setFocusedCampus(b.campus);

    mapRef.current?.animateToRegion(
      {
        latitude: b.latitude,
        longitude: b.longitude,
        latitudeDelta: 0.0025,
        longitudeDelta: 0.0025,
      },
      600,
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      <MapView
        testID="mapView"
        ref={mapRef}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        style={StyleSheet.absoluteFillObject}
        initialRegion={INITIAL_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        onPress={() => setSelected(null)}
      >
        {ALL_BUILDINGS.map((b) => {
          const isSelected = selected?.id === b.id;
          const colors = CAMPUS_COLORS[b.campus];

          return (
            <React.Fragment key={`${b.campus}-${b.id}`}>
              {b.polygon?.length ? (
                <Polygon
                  coordinates={b.polygon}
                  tappable
                  onPress={() => onPickBuilding(b)}
                  strokeColor={colors.stroke}
                  strokeWidth={isSelected ? 3 : 2}
                  fillColor={isSelected ? colors.fillSelected : colors.fill}
                />
              ) : null}

              <Marker
                coordinate={{ latitude: b.latitude, longitude: b.longitude }}
                onPress={() => onPickBuilding(b)}
                tracksViewChanges={isSelected}
              >
                <View
                  style={[
                    labelStyles.codeCircle,
                    {
                      backgroundColor:
                        b.campus === "SGW"
                          ? "rgba(145,35,56,0.95)"
                          : "rgba(224,177,0,0.95)",
                      borderColor: b.campus === "SGW" ? "#6f1a2a" : "#8C5F0A",
                    },
                  ]}
                >
                  <Text style={labelStyles.codeText}>{b.code}</Text>
                </View>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Top UI */}
      <View style={styles.topOverlay}>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              if (selected) setSelected(null);
            }}
            placeholder="Where to next?"
            placeholderTextColor={"rgba(17,17,17,0.55)"}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
          />

          {query.length > 0 && (
            <Pressable
              onPress={() => {
                setQuery("");
                setSelected(null);
              }}
              hitSlop={8}
              style={styles.clearButton}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((b) => (
              <Pressable
                key={`${b.campus}-${b.id}`}
                onPress={() => onPickBuilding(b)}
                style={styles.suggestionRow}
              >
                <Text style={styles.suggestionTitle}>
                  {b.code} — {b.name} ({b.campus})
                </Text>
                <Text style={styles.suggestionSub}>{b.address}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <BrandBar
        testID="brandbar"
        backgroundColor={focusedCampus === "SGW" ? "#912338" : "#e3ac20"}
      />
    </View>
  );
}

const labelStyles = StyleSheet.create({
  codeCircle: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  codeText: {
    fontWeight: "900",
    fontSize: 12,
    color: "white",
  },
});
