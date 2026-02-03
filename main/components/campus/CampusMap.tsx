import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { StatusBar } from "expo-status-bar";

import { SGW_BUILDINGS } from "@/components/Buildings/SGW/SGWBuildings";
import { LOYOLA_BUILDINGS } from "@/components/Buildings/Loyola/LoyolaBuildings";
import type { Building, Campus } from "@/components/Buildings/types";

import BuildingShapesLayer from "@/components/campus/BuildingShapesLayer";
import BrandBar from "@/components/layout/BrandBar";
import { styles } from "@/components/Styles/mapStyle";

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

// Exported for testing
export function calculatePanValue(
  currentCampus: Campus,
  dx: number,
  toggleWidth: number,
): number {
  const width = toggleWidth || Dimensions.get("window").width - 28;
  const halfWidth = width / 2;
  const currentValue = currentCampus === "SGW" ? 0 : 1;
  const newValue = currentValue + dx / halfWidth;
  return Math.max(0, Math.min(1, newValue));
}

export function determineCampusFromPan(
  currentCampus: Campus,
  dx: number,
  toggleWidth: number,
): Campus {
  const width = toggleWidth || Dimensions.get("window").width - 28;
  const halfWidth = width / 2;
  const currentValue = currentCampus === "SGW" ? 0 : 1;
  const finalValue = currentValue + dx / halfWidth;
  return finalValue > 0.5 ? "LOY" : "SGW";
}

export default function CampusMap() {
  const [focusedCampus, setFocusedCampus] = useState<Campus>("SGW");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Building | null>(null);

  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const toggleWidth = useRef(0);
  const focusedCampusRef = useRef<Campus>(focusedCampus);

  useEffect(() => {
    focusedCampusRef.current = focusedCampus;
  }, [focusedCampus]);

  const animateToPosition = useCallback(
    (toValue: number) => {
      Animated.spring(slideAnim, {
        toValue,
        useNativeDriver: false,
        tension: 60,
        friction: 10,
      }).start();
    },
    [slideAnim],
  );

  const switchToCampus = (campus: Campus) => {
    if (campus === focusedCampusRef.current) return;
    setFocusedCampus(campus);
    setSelected(null);
    const region = campus === "SGW" ? SGW_REGION : LOY_REGION;
    mapRef.current?.animateToRegion(region, 500);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => {
        const clampedValue = calculatePanValue(
          focusedCampusRef.current,
          gestureState.dx,
          toggleWidth.current,
        );
        slideAnim.setValue(clampedValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        const targetCampus = determineCampusFromPan(
          focusedCampusRef.current,
          gestureState.dx,
          toggleWidth.current,
        );

        if (targetCampus === "LOY") {
          switchToCampus("LOY");
          animateToPosition(1);
        } else {
          switchToCampus("SGW");
          animateToPosition(0);
        }
      },
    }),
  ).current;

  useEffect(() => {
    animateToPosition(focusedCampus === "SGW" ? 0 : 1);
  }, [focusedCampus, animateToPosition]);

  const ALL_BUILDINGS = useMemo(
    () => [...SGW_BUILDINGS, ...LOYOLA_BUILDINGS],
    [],
  );

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
        onPress={() => setSelected(null)}
      >
        <BuildingShapesLayer
          buildings={ALL_BUILDINGS}
          selectedBuildingId={selected?.id ?? null}
          onPickBuilding={onPickBuilding}
        />
      </MapView>

      {/* search UI unchanged */}
      <View style={styles.topOverlay} testID="topOverlay">
        {/* Campus Toggle Slider */}
        <View
          style={styles.campusToggleContainer}
          testID="campusToggle"
          onLayout={(e) => {
            toggleWidth.current = e.nativeEvent.layout.width;
          }}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={[
              styles.campusToggleSlider,
              {
                left: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["2%", "52%"],
                }),
                backgroundColor: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["#912338", "#e3ac20"],
                }),
              },
            ]}
          />
          <Pressable
            testID="campusToggle-SGW"
            onPress={() => switchToCampus("SGW")}
            style={styles.campusToggleButton}
            accessibilityRole="button"
            accessibilityLabel="Switch to SGW campus"
            accessibilityState={{ selected: focusedCampus === "SGW" }}
          >
            <Text
              style={[
                styles.campusToggleText,
                focusedCampus === "SGW" && styles.campusToggleTextActive,
              ]}
            >
              SGW
            </Text>
          </Pressable>
          <Pressable
            testID="campusToggle-Loyola"
            onPress={() => switchToCampus("LOY")}
            style={styles.campusToggleButton}
            accessibilityRole="button"
            accessibilityLabel="Switch to Loyola campus"
            accessibilityState={{ selected: focusedCampus === "LOY" }}
          >
            <Text
              style={[
                styles.campusToggleText,
                focusedCampus === "LOY" && styles.campusToggleTextActive,
              ]}
            >
              Loyola
            </Text>
          </Pressable>
        </View>

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

      <BrandBar
        testID="brandbar"
        backgroundColor={focusedCampus === "SGW" ? "#912338" : "#e3ac20"}
      />
    </View>
  );
}
