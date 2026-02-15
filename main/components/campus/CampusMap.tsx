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

import { useNavigation } from "@/hooks/useNavigation";
import RoutePlanner from "@/components/campus/RoutePlanner"; // diamond button only
import RouteInput from "@/components/campus/RouteInput";

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

const INITIAL_REGION: Region = SGW_REGION;

function SuggestionsList({
  suggestions,
  onPick,
  testIdPrefix,
  containerTestID,
  containerStyle,
}: Readonly<{
  suggestions: Building[];
  onPick: (b: Building) => void;
  testIdPrefix: "suggestion" | "routeSuggestion";
  containerTestID: "suggestions" | "route-suggestions";
  containerStyle?: any;
}>) {
  if (suggestions.length === 0) return null;

  return (
    <View style={[styles.suggestions, containerStyle]} testID={containerTestID}>
      {suggestions.map((b) => (
        <Pressable
          key={`${b.campus}-${b.id}`}
          testID={`${testIdPrefix}-${b.campus}-${b.id}`}
          onPress={() => onPick(b)}
          style={styles.suggestionRow}
        >
          <Text style={styles.suggestionTitle}>
            {b.code} — {b.name} ({b.campus})
          </Text>
          <Text style={styles.suggestionSub}>{b.address}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function CampusMap() {
  const [focusedCampus, setFocusedCampus] = useState<Campus>("SGW");

  // One query drives suggestions (KEEP THIS for tests)
  const [query, setQuery] = useState("");

  // Popup selection (normal mode)
  const [selected, setSelected] = useState<Building | null>(null);

  // User location
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const [startText, setStartText] = useState("");
  const [destText, setDestText] = useState("");

  const [popupIndex, setPopupIndex] = useState(-1);

  const mapRef = useRef<MapView>(null);
  const nav = useNavigation();

  // Auto fetch user location on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted" || cancelled) return;

        const last = await Location.getLastKnownPositionAsync();
        if (last && !cancelled) {
          setUserLocation({
            latitude: last.coords.latitude,
            longitude: last.coords.longitude,
          });
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });

        if (!cancelled) {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
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
    setPopupIndex(-1);

    const region = campus === "SGW" ? SGW_REGION : LOY_REGION;
    mapRef.current?.animateToRegion(region, 500);
  };

  // Find which building user is inside
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

  // KEEP your existing suggestion memo (query-driven)
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

  const focusBuilding = (b: Building) => {
    // keep your behavior
    setQuery(`${b.code} - ${b.name}`);
    setFocusedCampus(b.campus);

    if (b.polygon?.length) {
      const z = b.zoomCategory ?? 2;
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

  const focusRouteField = (field: "start" | "destination") => {
    nav.setActiveField(field);
    setQuery(field === "start" ? startText : destText);
    nav.setRouteError(null);
  };

  const handlePickBuilding = (b: Building) => {
    if (nav.isRouteMode) {
      // set start/destination based on activeField
      nav.setFieldFromBuilding(b);

      const label = `${b.code} - ${b.name}`;
      if (nav.activeField === "start") {
        setStartText(label);
        focusRouteField("destination");
      } else {
        setDestText(label);
      }

      // hide suggestions after selecting
      setQuery("");
      focusBuilding(b);
      return;
    }

    // Normal mode: popup selection
    setSelected(b);
    focusBuilding(b);
  };
  const floatingBottom = useMemo(() => {
    // base position when popup is closed
    const base = 120;

    // if popup isn't shown
    if (!selected || popupIndex === -1) return base;

    // snap 0 (usually "collapsed" / peek)
    if (popupIndex === 0) return 280;

    // snap 1+ (expanded)
    return 440;
  }, [selected, popupIndex]);

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
        onPress={() => {
          // Only clear popup in normal mode
          if (!nav.isRouteMode && selected) {
            setSelected(null);
            setPopupIndex(-1);
          }
        }}
      >
        <BuildingShapesLayer
          buildings={ALL_BUILDINGS}
          selectedBuildingId={selected?.id ?? null}
          userLocationBuildingId={userLocationBuildingId}
          onPickBuilding={handlePickBuilding}
        />

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

      {/* TOP OVERLAY */}
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

        {/* NORMAL MODE SEARCH */}
        {!nav.isRouteMode && (
          <>
            <View style={styles.searchBar} testID="searchBar">
              <Text style={styles.searchIcon}>⌕</Text>

              <TextInput
                testID="searchInput"
                value={query}
                onChangeText={(t) => {
                  setQuery(t);
                  if (selected) {
                    setSelected(null);
                    setPopupIndex(-1);
                  }
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
                    setPopupIndex(-1);
                  }}
                  hitSlop={8}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearIcon}>✕</Text>
                </Pressable>
              )}
            </View>

            <SuggestionsList
              suggestions={suggestions}
              onPick={handlePickBuilding}
              testIdPrefix="suggestion"
              containerTestID="suggestions"
            />
          </>
        )}

        {/* ROUTE MODE UI */}
        {nav.isRouteMode && (
          <>
            <View style={routeStyles.routePanel} testID="routePanel">
              <RouteInput
                start={nav.routeStart}
                destination={nav.routeDest}
                activeField={nav.activeField}
                onFocusField={focusRouteField}
                onSwap={() => {
                  const a = nav.routeStart;
                  const b = nav.routeDest;
                  nav.setRouteStart(b);
                  nav.setRouteDest(a);

                  setStartText(destText);
                  setDestText(startText);

                  // keep suggestions synced to active field
                  setQuery(nav.activeField === "start" ? destText : startText);
                }}
                startText={startText}
                destText={destText}
                onChangeStartText={(t) => {
                  nav.setActiveField("start");
                  setStartText(t);
                  setQuery(t);
                  nav.setRouteError(null);
                  if (nav.routeStart) nav.setRouteStart(null);
                }}
                onChangeDestText={(t) => {
                  nav.setActiveField("destination");
                  setDestText(t);
                  setQuery(t);
                  nav.setRouteError(null);
                  if (nav.routeDest) nav.setRouteDest(null);
                }}
                onClearStart={() => {
                  setStartText("");
                  nav.setRouteStart(null);
                  setQuery("");
                  nav.setRouteError(null);
                  focusRouteField("start");
                }}
                onClearDestination={() => {
                  setDestText("");
                  nav.setRouteDest(null);
                  setQuery("");
                  nav.setRouteError(null);
                  focusRouteField("destination");
                }}
              />
            </View>

            <SuggestionsList
              suggestions={suggestions}
              onPick={handlePickBuilding}
              testIdPrefix="routeSuggestion"
              containerTestID="route-suggestions"
              containerStyle={routeStyles.routeSuggestions}
            />
          </>
        )}
      </View>

      {/* FLOATING BUTTONS STACK (now dynamic bottom) */}
      <View style={[floatingStyles.container, { bottom: floatingBottom }]}>
        <CurrentLocationButton onLocationFound={handleLocationFound} />

        <RoutePlanner
          isRouteMode={nav.isRouteMode}
          onToggle={() => {
            nav.toggleRouteMode();
            setSelected(null);
            setPopupIndex(-1);

            if (nav.isRouteMode) {
              setQuery("");
            } else {
              focusRouteField("destination");
            }
          }}
        />
      </View>

      {/* Popup only in normal mode */}
      {!nav.isRouteMode && selected && (
        <BuildingPopup
          building={selected}
          campusTheme={focusedCampus}
          onClose={() => {
            setSelected(null);
            setPopupIndex(-1);
          }}
          onSheetChange={(index: number) => setPopupIndex(index)}
        />
      )}

      <BrandBar
        testID="brandbar"
        backgroundColor={focusedCampus === "SGW" ? "#912338" : "#e3ac20"}
      />
    </View>
  );
}

const routeStyles = StyleSheet.create({
  routePanel: {
    marginTop: 10,
    width: "100%",
  },
  routeSuggestions: {
    zIndex: 999,
    elevation: 999,
  },
});

const floatingStyles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    // bottom is now dynamic via inline style
    gap: 30,
    alignItems: "center",
    zIndex: 999,
    elevation: 999,
  },
});

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
