import React, { useMemo, useRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import type { Building } from "@/components/Buildings/types";
import { searchSGWBuildings } from "@/components/Buildings/search";
import SGWBrandBar from "@/components/layout/SGWBrandBar";
import { styles } from "@/components/Styles/mapStyle";

const SGW_REGION: Region = {
  latitude: 45.4973,
  longitude: -73.5794,
  latitudeDelta: 0.006,
  longitudeDelta: 0.006,
};

const THEME = {
  burgundy: "#800020",
  surface: "rgba(255,255,255,0.92)",
  textDark: "#111111",
  textMuted: "rgba(17,17,17,0.55)",
};

export default function SGWCampus() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Building | null>(null);
  const mapRef = useRef<MapView>(null);

  const suggestions = useMemo(() => {
    //  show suggestions after 1 char
    if (query.trim().length < 1) return [];
    return searchSGWBuildings(query, 6);
  }, [query]);

  const onPickBuilding = (b: Building) => {
    setSelected(b);
    setQuery(`${b.code} - ${b.name}`);

    mapRef.current?.animateToRegion(
      {
        latitude: b.latitude,
        longitude: b.longitude,
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
        ref={mapRef}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        style={StyleSheet.absoluteFillObject}
        initialRegion={SGW_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        rotateEnabled={false}
      />

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
            placeholderTextColor={THEME.textMuted}
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

        {/* Suggestions dropdown when looking for a building */}
        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => onPickBuilding(b)}
                style={styles.suggestionRow}
              >
                <Text style={styles.suggestionTitle}>
                  {b.code} — {b.name}
                </Text>
                <Text style={styles.suggestionSub}>{b.address}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Bottom accent */}
      <SGWBrandBar backgroundColor={THEME.burgundy} />
    </View>
  );
}
