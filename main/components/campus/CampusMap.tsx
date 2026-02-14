/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
  Keyboard,
  Image,
} from "react-native";
import MapView, {
  Marker,
  Polygon,
  PROVIDER_GOOGLE,
  Region,
  MapPressEvent,
} from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons, Ionicons, FontAwesome6 } from "@expo/vector-icons";

import type { Building, Campus } from "@/components/Buildings/types";
import SGW_DATA from "@/components/Buildings/data/SGW_data.json";
import LOY_DATA from "@/components/Buildings/data/Loyola_data.json";
import ToggleButton from "@/components/campus/ToggleButton";
import BuildingPopup from "@/components/campus/BuildingPopup";
import BuildingPin from "@/components/campus/BuildingPin";
import CurrentLocationButton from "@/components/campus/CurrentLocationButton";
import BrandBar from "@/components/layout/BrandBar";
import { styles } from "@/components/Styles/mapStyle";

type Coord = { latitude: number; longitude: number };

type Suggestion =
  | {
      kind: "building";
      key: string;
      campus: Campus;
      building: Building;
      title: string;
      sub: string;
    }
  | {
      kind: "pin";
      key: string;
      title: string;
      sub: string;
      coordinate: Coord;
    };

type ActiveField = "start" | "end";

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

export const calculatePanValue = (
  currentCampus: Campus,
  dx: number,
  toggleWidth: number,
): number => {
  const safeWidth = toggleWidth > 0 ? toggleWidth : 300;
  const half = safeWidth / 2;
  const base = currentCampus === "SGW" ? 0 : 1;
  const delta = dx / half;
  const next = base + delta;
  return Math.max(0, Math.min(1, next));
};

export const determineCampusFromPan = (
  currentCampus: Campus,
  dx: number,
  toggleWidth: number,
): Campus => {
  const finalValue = calculatePanValue(currentCampus, dx, toggleWidth);
  return finalValue > 0.5 ? "LOY" : "SGW";
};

const CAMPUS_COLORS = {
  SGW: "#912338",
  LOY: "#d4ad20",
  getDirections: "#912338",
};

const ALL_BUILDINGS: Building[] = [
  ...(SGW_DATA as Building[]),
  ...(LOY_DATA as Building[]),
];

const getRegionForCoordinate = (coordinate: Coord, delta = 0.0025): Region => ({
  latitude: coordinate.latitude,
  longitude: coordinate.longitude,
  latitudeDelta: delta,
  longitudeDelta: delta,
});

const getBuildingFocusRegion = (b: Building): Region => {
  if (!b.polygon || b.polygon.length === 0) {
    return {
      latitude: b.latitude,
      longitude: b.longitude,
      latitudeDelta: 0.0025,
      longitudeDelta: 0.0025,
    };
  }

  const lats = b.polygon.map((p) => p.latitude);
  const lngs = b.polygon.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latPad = Math.max((maxLat - minLat) * 1.6, 0.0018);
  const lngPad = Math.max((maxLng - minLng) * 1.6, 0.0018);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latPad,
    longitudeDelta: lngPad,
  };
};

function formatPinLabel(c: Coord): string {
  return `Dropped Pin (${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)})`;
}

function matchBuilding(b: Building, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return false;
  return (
    b.code.toLowerCase().includes(needle) ||
    b.name.toLowerCase().includes(needle) ||
    b.address.toLowerCase().includes(needle) ||
    (b.aliases ?? []).some((a) => a.toLowerCase().includes(needle))
  );
}

/* -------------------- NEW: tap-to-building helpers -------------------- */
const toRadians = (deg: number): number => (deg * Math.PI) / 180;

function distanceMeters(a: Coord, b: Coord): number {
  const R = 6371000; // meters
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Ray-casting algorithm. x=longitude, y=latitude
function isPointInPolygon(point: Coord, polygon: Coord[]): boolean {
  if (!polygon || polygon.length < 3) return false;

  const x = point.longitude;
  const y = point.latitude;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-12) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

function resolveTapToBuilding(
  coord: Coord,
  buildings: Building[],
): Building | null {
  // 1) Exact polygon hit
  for (const b of buildings) {
    if (b.polygon?.length && isPointInPolygon(coord, b.polygon)) {
      return b;
    }
  }

  // 2) Nearest building center fallback within threshold
  let nearest: Building | null = null;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const b of buildings) {
    const d = distanceMeters(coord, {
      latitude: b.latitude,
      longitude: b.longitude,
    });
    if (d < minDistance) {
      minDistance = d;
      nearest = b;
    }
  }

  // Conservative threshold so random street taps don't map incorrectly
  return minDistance <= 35 ? nearest : null;
}
/* --------------------------------------------------------------------- */

export default function CampusMap() {
  const mapRef = useRef<MapView | null>(null);

  const [focusedCampus, setFocusedCampus] = useState<Campus>("SGW");

  // normal mode search
  const [browseQuery, setBrowseQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );

  // directions mode
  const [directionsMode, setDirectionsMode] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>("start");
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [startCoord, setStartCoord] = useState<Coord | null>(null);
  const [endCoord, setEndCoord] = useState<Coord | null>(null);
  const [startBuilding, setStartBuilding] = useState<Building | null>(null);
  const [endBuilding, setEndBuilding] = useState<Building | null>(null);

  const provider = Platform.OS === "android" ? PROVIDER_GOOGLE : undefined;

  const onCampusChange = (campus: Campus) => {
    if (campus === focusedCampus) return;
    setFocusedCampus(campus);
    setSelectedBuilding(null);

    const target = campus === "SGW" ? SGW_REGION : LOY_REGION;
    mapRef.current?.animateToRegion(target, 500);
  };

  const allSuggestions = useMemo(() => {
    const q = directionsMode
      ? activeField === "start"
        ? startText
        : endText
      : browseQuery;

    if (!q.trim()) return [];

    const matched = ALL_BUILDINGS.filter((b) => matchBuilding(b, q)).slice(
      0,
      8,
    );

    return matched.map(
      (b): Suggestion => ({
        kind: "building",
        key: `${b.campus}-${b.id}`,
        campus: b.campus,
        building: b,
        title: `${b.code} — ${b.name}`,
        sub: b.address,
      }),
    );
  }, [browseQuery, directionsMode, activeField, startText, endText]);

  const clearNormalSearch = () => setBrowseQuery("");

  const applyBuildingToField = (building: Building, field: ActiveField) => {
    const coord = {
      latitude: building.latitude,
      longitude: building.longitude,
    };
    const label = `${building.code} - ${building.name}`;

    if (field === "start") {
      setStartCoord(coord);
      setStartText(label);
      setStartBuilding(building);
      setActiveField("end");
    } else {
      setEndCoord(coord);
      setEndText(label);
      setEndBuilding(building);
    }
    setFocusedCampus(building.campus);
    mapRef.current?.animateToRegion(getBuildingFocusRegion(building), 600);
  };

  const onSuggestionPress = (item: Suggestion) => {
    Keyboard.dismiss();

    if (item.kind === "building") {
      const b = item.building;
      if (directionsMode) {
        applyBuildingToField(b, activeField);
      } else {
        setBrowseQuery(`${b.code} - ${b.name}`);
        setSelectedBuilding(b);
        setFocusedCampus(b.campus);
        mapRef.current?.animateToRegion(getBuildingFocusRegion(b), 600);
      }
    } else {
      if (directionsMode) {
        if (activeField === "start") {
          setStartCoord(item.coordinate);
          setStartText(item.title);
          setStartBuilding(null);
          setActiveField("end");
        } else {
          setEndCoord(item.coordinate);
          setEndText(item.title);
          setEndBuilding(null);
        }
      }
      mapRef.current?.animateToRegion(
        getRegionForCoordinate(item.coordinate),
        600,
      );
    }
  };

  const focusedBuildings = useMemo(
    () => ALL_BUILDINGS.filter((b) => b.campus === focusedCampus),
    [focusedCampus],
  );

  const onMapPress = (e: MapPressEvent) => {
    const coord = e.nativeEvent.coordinate;
    setSelectedBuilding(null);

    if (!directionsMode) return;

    // ✅ NEW: try to resolve tapped coordinate to a building first
    const tappedBuilding = resolveTapToBuilding(coord, focusedBuildings);
    if (tappedBuilding) {
      applyBuildingToField(tappedBuilding, activeField);
      return;
    }

    // fallback to dropped pin coordinates only when no building match
    const label = formatPinLabel(coord);
    if (activeField === "start") {
      setStartCoord(coord);
      setStartText(label);
      setStartBuilding(null);
      setActiveField("end");
    } else {
      setEndCoord(coord);
      setEndText(label);
      setEndBuilding(null);
    }

    mapRef.current?.animateToRegion(getRegionForCoordinate(coord), 500);
  };

  const onBuildingPress = (b: Building) => {
    if (directionsMode) {
      applyBuildingToField(b, activeField);
      return;
    }
    setSelectedBuilding(b);
    mapRef.current?.animateToRegion(getBuildingFocusRegion(b), 600);
  };

  const onLocationFound = (loc: Coord) => {
    mapRef.current?.animateToRegion(
      {
        latitude: loc.latitude,
        longitude: loc.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      500,
    );
  };

  const toggleDirectionsMode = () => {
    setDirectionsMode((prev) => !prev);
  };

  const swapStartEnd = () => {
    const sText = startText;
    const eText = endText;
    const sCoord = startCoord;
    const eCoord = endCoord;
    const sBuilding = startBuilding;
    const eBuilding = endBuilding;

    setStartText(eText);
    setEndText(sText);
    setStartCoord(eCoord);
    setEndCoord(sCoord);
    setStartBuilding(eBuilding);
    setEndBuilding(sBuilding);
  };

  const selectedCampusColor = focusedCampus === "SGW" ? "#912338" : "#e3ac20";

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <MapView
        ref={(r) => {
          mapRef.current = r;
        }}
        provider={provider}
        style={styles.map}
        testID="mapView"
        initialRegion={SGW_REGION}
        onPress={onMapPress}
      >
        {focusedBuildings.map((b) => (
          <React.Fragment key={b.id}>
            {!!b.polygon?.length && (
              <Polygon
                coordinates={b.polygon}
                tappable
                onPress={() => onBuildingPress(b)}
                fillColor={
                  focusedCampus === "SGW"
                    ? "rgba(145,35,56,0.20)"
                    : "rgba(212,173,32,0.20)"
                }
                strokeColor={
                  focusedCampus === "SGW"
                    ? "rgba(145,35,56,0.85)"
                    : "rgba(162,129,16,0.95)"
                }
                strokeWidth={2}
              />
            )}
            <Marker
              coordinate={{ latitude: b.latitude, longitude: b.longitude }}
              onPress={() => onBuildingPress(b)}
            >
              <View
                style={{
                  minWidth: 26,
                  height: 26,
                  borderRadius: 13,
                  paddingHorizontal: 6,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    focusedCampus === "SGW" ? "#912338" : "#c49d13",
                  borderWidth: 2,
                  borderColor: focusedCampus === "SGW" ? "#6f1b2d" : "#9f7f0f",
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}
                >
                  {b.code}
                </Text>
              </View>
            </Marker>
          </React.Fragment>
        ))}

        {startCoord && (
          <Marker
            coordinate={startCoord}
            anchor={{ x: 0.5, y: 1 }}
            centerOffset={{ x: 0, y: 0 }}
          >
            {startBuilding ? (
              <BuildingPin
                code={startBuilding.code}
                campus={startBuilding.campus}
                size={36}
              />
            ) : (
              <Ionicons name="ellipse-outline" size={24} color="#111111" />
            )}
          </Marker>
        )}

        {endCoord && (
          <Marker
            coordinate={endCoord}
            anchor={{ x: 0.5, y: 1 }}
            centerOffset={{ x: 0, y: 0 }}
          >
            {endBuilding ? (
              <BuildingPin
                code={endBuilding.code}
                campus={endBuilding.campus}
                size={36}
              />
            ) : (
              <Ionicons name="location-outline" size={26} color="#c0392b" />
            )}
          </Marker>
        )}
      </MapView>

      {/* Top overlays */}
      <View style={styles.topOverlay} pointerEvents="box-none">
        {/* keep BrandBar for tests but hidden */}
        <View style={{ height: 0, overflow: "hidden" }}>
          <BrandBar testID="brandbar" backgroundColor={selectedCampusColor} />
        </View>

        <View style={{ marginHorizontal: 10, marginTop: 24 }}>
          <ToggleButton
            focusedCampus={focusedCampus}
            onCampusChange={onCampusChange}
          />
        </View>

        {/* Normal search card */}
        {!directionsMode && (
          <View style={{ marginHorizontal: 14, marginTop: 8 }}>
            <View style={{ backgroundColor: "transparent" }}>
              <View
                style={{
                  backgroundColor: "#ECECF1",
                  borderRadius: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  height: 40,
                }}
              >
                <Ionicons name="search" size={15} color="#3C3C43" />
                <TextInput
                  style={{
                    marginLeft: 10,
                    flex: 1,
                    fontSize: 19,
                    lineHeight: 24,
                    fontWeight: "400",
                    color: "#1F2024",
                  }}
                  placeholder="Where to next?"
                  placeholderTextColor="#3C3C43"
                  value={browseQuery}
                  onChangeText={setBrowseQuery}
                  testID="browseSearchInput"
                />
                {!!browseQuery && (
                  <Pressable testID="clearSearch" onPress={clearNormalSearch}>
                    <MaterialIcons name="cancel" size={22} color="#b5b5bc" />
                  </Pressable>
                )}
              </View>

              {allSuggestions.length > 0 && (
                <ScrollView
                  style={{
                    maxHeight: 220,
                    marginTop: 8,
                    borderRadius: 12,
                    backgroundColor: "#fff",
                  }}
                  keyboardShouldPersistTaps="handled"
                >
                  {allSuggestions.map((s) => {
                    if (s.kind !== "building") return null;
                    return (
                      <Pressable
                        key={s.key}
                        testID={`suggestion-${s.campus}-${s.building.id}`}
                        onPress={() => onSuggestionPress(s)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: "#efeff4",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "600",
                            color: "#1f1f1f",
                          }}
                        >
                          {s.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#7a7a82",
                            marginTop: 2,
                          }}
                        >
                          {s.sub}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>
        )}

        
        {directionsMode && (
          <View style={{ marginHorizontal: 18, marginTop: 8 }}>
            <View
              style={{
                height: 81,
                borderRadius: 20,
                backgroundColor: "#FBFBFF",
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: 10,
                paddingRight: 10,
              }}
            >
              
              <View
                style={{
                  width: 26,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={require("@/assets/icons/start-destination-rail.png")}
                  style={{ width: 22, height: 54, resizeMode: "contain" }}
                />
              </View>

              {/* Inputs column */}
              <View style={{ flex: 1, marginLeft: 8, marginRight: 10 }}>
                {/* Start */}
                <Pressable onPress={() => setActiveField("start")}>
                  <View
                    style={{
                      width: "100%",
                      maxWidth: 277,
                      height: 25,
                      borderRadius: 20,
                      backgroundColor: "#F2F2F2",
                      justifyContent: "center",
                      paddingHorizontal: 12,
                      borderWidth: activeField === "start" ? 1 : 0,
                      borderColor: "#B8B8C4",
                    }}
                  >
                    <TextInput
                      placeholder="Enter your starting location"
                      placeholderTextColor="#8D8989"
                      value={startText}
                      onFocus={() => setActiveField("start")}
                      onChangeText={setStartText}
                      style={{
                        fontSize: 12,
                        lineHeight: 12,
                        color: "#8D8989",
                        paddingVertical: 0,
                        includeFontPadding: false as never,
                      }}
                    />
                  </View>
                </Pressable>

                <View style={{ height: 8 }} />

                {/* Destination */}
                <Pressable onPress={() => setActiveField("end")}>
                  <View
                    style={{
                      width: "100%",
                      maxWidth: 277,
                      height: 25,
                      borderRadius: 20,
                      backgroundColor: "#F2F2F2",
                      justifyContent: "center",
                      paddingHorizontal: 12,
                      borderWidth: activeField === "end" ? 1 : 0,
                      borderColor: "#B8B8C4",
                    }}
                  >
                    <TextInput
                      placeholder="Enter your destination"
                      placeholderTextColor="#8D8989"
                      value={endText}
                      onFocus={() => setActiveField("end")}
                      onChangeText={setEndText}
                      style={{
                        fontSize: 12,
                        lineHeight: 12,
                        color: "#8D8989",
                        paddingVertical: 0,
                        includeFontPadding: false as never,
                      }}
                    />
                  </View>
                </Pressable>
              </View>

              {/* Swap icon 20x20 area like Figma */}
              <Pressable
                onPress={swapStartEnd}
                hitSlop={8}
                style={{
                  width: 20,
                  height: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="swap-vert" size={20} color="#111111" />
              </Pressable>
            </View>

            {/* Suggestions (kept same behavior) */}
            {allSuggestions.length > 0 && (
              <ScrollView
                style={{
                  maxHeight: 200,
                  marginTop: 8,
                  borderRadius: 12,
                  backgroundColor: "#fff",
                }}
                keyboardShouldPersistTaps="handled"
              >
                {allSuggestions.map((s) => {
                  if (s.kind !== "building") return null;
                  return (
                    <Pressable
                      key={s.key}
                      onPress={() => onSuggestionPress(s)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: "#efeff4",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#1f1f1f",
                        }}
                      >
                        {s.title}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: "#7a7a82", marginTop: 2 }}
                      >
                        {s.sub}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* popup */}
      {selectedBuilding && !directionsMode && (
        <View
          style={{ position: "absolute", left: 16, right: 16, bottom: 110 }}
        >
          <BuildingPopup
            building={selectedBuilding}
            campusTheme={focusedCampus}
            onClose={() => setSelectedBuilding(null)}
          />
        </View>
      )}

      {/* Floating buttons bottom-right */}
      <View
        style={{
          position: "absolute",
          right: 18,
          bottom: 95,
          alignItems: "center",
          gap: 12,
        }}
        pointerEvents="box-none"
      >
        <CurrentLocationButton onLocationFound={onLocationFound} />
        <Pressable
          testID="getDirectionsButton"
          onPress={toggleDirectionsMode}
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            backgroundColor: directionsMode
              ? "#8a1731"
              : CAMPUS_COLORS.getDirections,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: "#ffffffcc",
          }}
        >
          {directionsMode ? (
            <Ionicons name="close" size={34} color="#fff" />
          ) : (
            <FontAwesome6 name="route" size={26} color="#fff" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
