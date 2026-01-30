import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, {Marker, Polygon} from "react-native-maps";
import { Building, buildingCatalog } from "@/models/Building";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 45.4973,
          longitude: -73.5794,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
      
      {buildingCatalog.buildings.map((building:Building) => (
          <Polygon 
          coordinates={building.polygon}
          key={building.name}
          strokeColor="#000"
          fillColor="rgba(96, 6, 6, 0.52)"
        />
      ))}

      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
