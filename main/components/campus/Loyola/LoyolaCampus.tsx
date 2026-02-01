import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  Region,
  Polygon,
  Marker,
} from "react-native-maps";
import { StatusBar } from "expo-status-bar";

import { LOYOLA_BUILDINGS } from "@/components/Buildings/Loyola/LoyolaBuildings";
import type { Building } from "@/components/Buildings/types";
import { searchLoyolaBuildings } from "@/components/Buildings/search";
import BrandBar from "@/components/layout/BrandBar";
import { styles } from "@/components/Styles/mapStyle";
import BuildingsLoadError from "@/components/ui/BuildingsLoadError";

const LOYOLA_INITIAL_REGION: Region = {
  latitude: 45.457984,
  longitude: -73.639834,
  latitudeDelta: 0.006,
  longitudeDelta: 0.006,
};

const UI_THEME = {
  burgundy: "#e3ac20",
  textMuted: "rgba(17,17,17,0.55)",
  errorRed: "#D84A4A",
};

export default function LoyolaCampus() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );

  // Used to force a remount of MapView when user presses Refresh.
  const [reloadKey, setReloadKey] = useState(0);

  // Controls the "Whoops! error loading buildings" popup.
  const [buildingsError, setBuildingsError] = useState(false);

  const mapViewRef = useRef<MapView>(null);

  // Validate buildings availability (today it's local constants; later this becomes your fetch error).
  useEffect(() => {
    try {
      if (!Array.isArray(LOYOLA_BUILDINGS) || LOYOLA_BUILDINGS.length === 0) {
        throw new Error("LOYOLA_BUILDINGS missing/empty");
      }
      setBuildingsError(false);
    } catch {
      setBuildingsError(true);
    }
  }, [reloadKey]);

  const buildingSuggestions = useMemo(() => {
    if (searchQuery.trim().length < 1) return [];
    return searchLoyolaBuildings(searchQuery, 6);
  }, [searchQuery]);

  const handleSelectBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setSearchQuery(`${building.code} - ${building.name}`);

    mapViewRef.current?.animateToRegion(
      {
        latitude: building.latitude,
        longitude: building.longitude,
        latitudeDelta: 0.0025,
        longitudeDelta: 0.0025,
      },
      500,
    );
  };

  const handleRefreshBuildings = () => {
    // Reset UI state
    setSearchQuery("");
    setSelectedBuilding(null);

    // Hide popup and force MapView remount
    setBuildingsError(false);
    setReloadKey((k) => k + 1);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      <MapView
        key={reloadKey}
        testID="loyola-mapView"
        ref={mapViewRef}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        style={StyleSheet.absoluteFillObject}
        initialRegion={LOYOLA_INITIAL_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        onPress={() => setSelectedBuilding(null)} // tap outside to unselect
      >
        {LOYOLA_BUILDINGS.map((b) => {
          const isSelected = selectedBuilding?.id === b.id;

          return (
            <React.Fragment key={b.id}>
              {/* Building polygon */}
              {b.polygon?.length ? (
                <Polygon
                  coordinates={b.polygon}
                  tappable
                  onPress={() => handleSelectBuilding(b)}
                  strokeColor={isSelected ? "#8C5F0A" : "#E0B100"}
                  strokeWidth={isSelected ? 3 : 2}
                  fillColor={
                    isSelected
                      ? "rgba(224, 177, 0, 0.55)"
                      : "rgba(224, 177, 0, 0.35)"
                  }
                />
              ) : null}

              {/* Building code label (Marker) */}
              <Marker
                coordinate={{ latitude: b.latitude, longitude: b.longitude }}
                onPress={() => handleSelectBuilding(b)}
                tracksViewChanges={isSelected}
                anchor={isSelected ? { x: 0.5, y: 0.75 } : { x: 0.5, y: 0.5 }}
              >
                {isSelected ? (
                  <View style={localLabelStyles.pinWrap}>
                    <View style={localLabelStyles.pinHead}>
                      <Text style={localLabelStyles.pinText}>{b.code}</Text>
                    </View>
                    <View style={localLabelStyles.pinTail} />
                  </View>
                ) : (
                  <View style={localLabelStyles.codeCircle}>
                    <Text style={localLabelStyles.codeCircleText}>
                      {b.code}
                    </Text>
                  </View>
                )}
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
            testID="loyola-search-input"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (selectedBuilding) setSelectedBuilding(null);
            }}
            placeholder="Where to next?"
            placeholderTextColor={UI_THEME.textMuted}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
          />

          {searchQuery.length > 0 && (
            <Pressable
              testID="clear-search-button"
              onPress={() => {
                setSearchQuery("");
                setSelectedBuilding(null);
              }}
              hitSlop={8}
              style={styles.clearButton}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Suggestions dropdown */}
        {buildingSuggestions.length > 0 && (
          <View style={styles.suggestions}>
            {buildingSuggestions.map((building) => (
              <Pressable
                testID={`suggestion-${building.code}`}
                key={building.id}
                onPress={() => handleSelectBuilding(building)}
                style={styles.suggestionRow}
              >
                <Text style={styles.suggestionTitle}>
                  {building.code} — {building.name}
                </Text>
                <Text style={styles.suggestionSub}>{building.address}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Error popup overlay (prototype "Whoops! ... Refresh") */}
      <BuildingsLoadError
        visible={buildingsError}
        onRefresh={handleRefreshBuildings}
        accentColor={UI_THEME.errorRed}
        testIDPrefix="loyola-buildings-error"
      />

      {/* Bottom accent */}
      <BrandBar testID="loyola-brandbar" backgroundColor={UI_THEME.burgundy} />
    </View>
  );
}

const localLabelStyles = StyleSheet.create({
  codeCircle: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(224,177,0,0.95)",
    borderWidth: 1.5,
    borderColor: "#8C5F0A",
  },
  codeCircleText: {
    fontWeight: "800",
    fontSize: 12,
    color: "#2a1c00",
  },

  // Selected label (pin look)
  pinWrap: {
    alignItems: "center",
  },
  pinHead: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 7,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(224,177,0,1)",
    borderWidth: 2,
    borderColor: "#8C5F0A",
  },
  pinText: {
    fontWeight: "900",
    fontSize: 12,
    color: "#2a1c00",
  },
  pinTail: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 11,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#8C5F0A",
    transform: [{ translateY: -2 }],
  },
});
