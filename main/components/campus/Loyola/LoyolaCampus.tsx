import React, { useMemo, useRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Region, Polygon } from "react-native-maps";
import { LOYOLA_BUILDINGS } from "@/components/Buildings/Loyola/LoyolaBuildings";
import { StatusBar } from "expo-status-bar";
import type { Building } from "@/components/Buildings/types";
import { searchLoyolaBuildings } from "@/components/Buildings/search";
import BrandBar from "@/components/layout/BrandBar";
import { styles } from "@/components/Styles/mapStyle";

const LOYOLA_INITIAL_REGION: Region = {
  latitude: 45.457984,
  longitude: -73.639834,
  latitudeDelta: 0.006,
  longitudeDelta: 0.006,
};

const UI_THEME = {
  burgundy: "#e3ac20",
  surface: "rgba(255,255,255,0.92)",
  textDark: "#111111",
  textMuted: "rgba(17,17,17,0.55)",
};

export default function LoyolaCampus() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );
  const mapViewRef = useRef<MapView>(null);

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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

        <MapView
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
        >
            {LOYOLA_BUILDINGS.map((b) =>
                b.polygon?.length ? (
                    <Polygon
                        key={b.id}
                        coordinates={b.polygon}
                        tappable
                        onPress={() => handleSelectBuilding(b)}

                        strokeColor="#E0B100"
                        strokeWidth={2}
                        fillColor="rgba(224, 177, 0, 0.35)"
                    />

                ) : null,
            )}
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

      {/* Bottom accent */}
      <BrandBar testID="loyola-brandbar" backgroundColor={UI_THEME.burgundy} />
    </View>
  );
}
