import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Marker, Polygon } from "react-native-maps";

import type { Building, Campus } from "@/components/Buildings/types";

const CAMPUS_COLORS: Record<
  Campus,
  {
    stroke: string;
    fill: string;
    fillSelected: string;
    labelBg: string;
    labelBorder: string;
  }
> = {
  SGW: {
    stroke: "#912338",
    fill: "rgba(145, 35, 56, 0.30)",
    fillSelected: "rgba(145, 35, 56, 0.55)",
    labelBg: "rgba(145,35,56,0.95)",
    labelBorder: "#6f1a2a",
  },
  LOY: {
    stroke: "#E0B100",
    fill: "rgba(224, 177, 0, 0.30)",
    fillSelected: "rgba(224, 177, 0, 0.55)",
    labelBg: "rgba(224,177,0,0.95)",
    labelBorder: "#8C5F0A",
  },
};

type Props = {
  buildings: Building[];
  selectedBuildingId: string | null;
  onPickBuilding: (b: Building) => void;
};

/**
 * Render-only layer: draws building polygons + code markers.
 * - Prevents duplicating rendering logic across campuses/screens
 * - Keeps CampusMap focused on layout + interaction flow (search/selection/camera)
 */
export default function BuildingShapesLayer({
  buildings,
  selectedBuildingId,
  onPickBuilding,
}: Readonly<Props>) {
  return (
    <>
      {buildings.map((b) => {
        const isSelected = selectedBuildingId === b.id;
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
              accessibilityLabel={`${b.code} ${b.name}`}
            >
              <View
                accessible
                accessibilityRole="button"
                style={[
                  s.codeCircle,
                  {
                    backgroundColor: colors.labelBg,
                    borderColor: colors.labelBorder,
                  },
                ]}
              >
                <Text style={s.codeText}>{b.code}</Text>
              </View>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
}

const s = StyleSheet.create({
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
