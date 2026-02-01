import React from "react";
import SGWCampus from "@/components/campus/SGW/SGWCampus";
import LoyolaCampus from "@/components/campus/Loyola/LoyolaCampus";
import { StyleSheet, View } from "react-native";
import MapView, {Marker, Polygon} from "react-native-maps";
import { CampusBuilding, buildingCatalog } from "@/components/Buildings/SGW/Building";

// this will be removed when the toggle button is added later on
const DEFAULT_CAMPUS: "SGW" | "LOY" = "SGW";

export default function MapScreen() {
  return (
    DEFAULT_CAMPUS === "SGW" ? <SGWCampus /> : <LoyolaCampus />);
}

  /*
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 45.4973,
          longitude: -73.5794,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
          //initialZoom: 9
        }}
      >
      
      {buildingCatalog.buildings.map((building:Building) => (
        <Polygon
        coordinates={building.polygon}
        key={building.name}
        strokeColor="#000"
        fillColor="rgba(96, 6, 6, 1)"
        />
      ))}

      </MapView>
    </View>
  );
}
*/