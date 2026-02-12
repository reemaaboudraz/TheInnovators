import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  StyleSheet,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Region, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";

import { SGW_BUILDINGS } from "@/components/Buildings/SGW/SGWBuildings";
import { LOYOLA_BUILDINGS } from "@/components/Buildings/Loyola/LoyolaBuildings";
import type { Building, Campus } from "@/components/Buildings/types";

import {
  regionFromPolygon,
  paddingForZoomCategory,
} from "@/components/Buildings/mapZoom";
import { isPointInPolygon } from "@/components/campus/pointInPolygon";

import BuildingShapesLayer from "@/components/campus/BuildingShapesLayer";
import ToggleButton from "@/components/campus/ToggleButton";
import CurrentLocationButton, {
  UserLocation,
} from "@/components/campus/CurrentLocationButton";
import BuildingPopup from "@/components/campus/BuildingPopup";

import BrandBar from "@/components/layout/BrandBar";
import { styles } from "@/components/Styles/mapStyle";

// Re-export for backwards compatibility with tests
export {
  calculatePanValue,
  determineCampusFromPan,
} from "@/components/campus/ToggleButton";

export const SGW_REGION: Region = {
  latitude: 45.4973,
  longitude: -73.5794,
  latitudeDelta: 0.006,
  longitudeDelta: 0.006,
};

export const LOY_REGION: Region = {
  latitude: 45.457984,
  longitude: -73.639834,
  latitudeDelta: 0.006,
  longitudeDelta: 0.006,
};

// Start at SGW (still renders Loyola buildings in the background)
const INITIAL_REGION: Region = SGW_REGION;

export default function CampusMap() {
  const [focusedCampus, setFocusedCampus] = useState<Campus>("SGW");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Building | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const mapRef = useRef<MapView>(null);

  // Automatically fetch user location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const ALL_BUILDINGS = useMemo(
    () => [...SGW_BUILDINGS, ...LOYOLA_BUILDINGS],
    [],
  );

  const handleLocationFound = (location: UserLocation) => {
    setUserLocation(location);
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      500,
    );
  };

  const handleCampusChange = (campus: Campus) => {
    setFocusedCampus(campus);
    setSelected(null);

    const region = campus === "SGW" ? SGW_REGION : LOY_REGION;
    mapRef.current?.animateToRegion(region, 500);
  };

  // Find which building the user is currently inside
  const userLocationBuildingId = useMemo(() => {
    if (!userLocation) return null;

    const building = ALL_BUILDINGS.find(
      (b) =>
        b.polygon?.length &&
        isPointInPolygon(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          b.polygon,
        ),
    );

    return building?.id ?? null;
  }, [userLocation, ALL_BUILDINGS]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return ALL_BUILDINGS.filter((b) => {
      const code = b.code?.toLowerCase() ?? "";
      const name = b.name?.toLowerCase() ?? "";
      const address = b.address?.toLowerCase() ?? "";
      const aliases = b.aliases ?? [];

      return (
        code.includes(q) ||
        name.includes(q) ||
        address.includes(q) ||
        aliases.some((a) => a.toLowerCase().includes(q))
      );
    }).slice(0, 6);
  }, [query, ALL_BUILDINGS]);

  const onPickBuilding = (b: Building) => {
    setSelected(b);
    setQuery(`${b.code} - ${b.name}`);
    setFocusedCampus(b.campus);

    // Smart zoom if polygon exists + zoomCategory exists
    if (b.polygon?.length) {
      const z = b.zoomCategory ?? 2; // fallback if any building lacks zoomCategory
      const padding = paddingForZoomCategory(z);
      const region = regionFromPolygon(b.polygon, padding);
      mapRef.current?.animateToRegion(region, 600);
      return;
    }

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
    <View style={styles.container} testID="campusMap-root">
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
        // don’t fight building taps: only clear if something is selected
        onPress={() => {
          if (selected) setSelected(null);
        }}
      >
        <BuildingShapesLayer
          buildings={ALL_BUILDINGS}
          selectedBuildingId={selected?.id ?? null}
          userLocationBuildingId={userLocationBuildingId}
          onPickBuilding={onPickBuilding}
        />

        {/* show user marker only if not inside a building */}
        {userLocation && !userLocationBuildingId && (
          <Marker
            testID="userLocationMarker"
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={locationMarkerStyles.container}>
              <View style={locationMarkerStyles.marker} />
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.topOverlay} testID="topOverlay">
        <Text
          testID="focusedCampusLabel"
          style={{ opacity: 0, position: "absolute", top: 0, left: 0 }}
        >
          {focusedCampus}
        </Text>

        <ToggleButton
          focusedCampus={focusedCampus}
          onCampusChange={handleCampusChange}
        />

        <View style={styles.searchBar} testID="searchBar">
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            testID="searchInput"
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
              testID="clearSearch"
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

        {suggestions.length > 0 && (
          <View style={styles.suggestions} testID="suggestions">
            {suggestions.map((b) => (
              <Pressable
                key={`${b.campus}-${b.id}`}
                testID={`suggestion-${b.campus}-${b.id}`}
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

      <CurrentLocationButton onLocationFound={handleLocationFound} />

      {/* Popup (only show if selected has details or your popup handles missing details safely) */}
      {selected && (
        <BuildingPopup
          building={selected}
          campusTheme={focusedCampus}
          onClose={() => setSelected(null)}
        />
      )}

      <BrandBar
        testID="brandbar"
        backgroundColor={focusedCampus === "SGW" ? "#912338" : "#e3ac20"}
      />
    </View>
  );
}

const locationMarkerStyles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#6197FB",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
