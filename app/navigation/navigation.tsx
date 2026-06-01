import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import markerData from "../../assets/data/map_markers.json";

function getMarkerColor(tier: string): string {
  switch (tier) {
    case "Safe":
      return "green";

    case "Alert":
      return "yellow";

    case "Warning":
      return "orange";

    case "Critical":
      return "red";

    default:
      return "gray";
  }
}

export default function NavigationScreen() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 7.0731,
          longitude: 125.6128,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Current Location */}
        <Marker
          coordinate={{
            latitude: 7.0731,
            longitude: 125.6128,
          }}
          title="Current Location"
        />

        {/* Flood Markers */}
        {markerData.markers.map((marker: any) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.position.lat,
              longitude: marker.position.lng,
            }}
            pinColor={getMarkerColor(marker.risk_tier)}
            title={marker.title}
            description={marker.message}
          />
        ))}
      </MapView>

      {/* Status Card */}
      <View style={styles.infoCard}>
        <Text style={styles.routeTitle}>
          W.A.V.E. Flood Monitoring
        </Text>

        <Text style={styles.routeText}>
          Sensors Online: {markerData.markers.length}
        </Text>

        <Text style={styles.routeText}>
          Status: Active
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  infoCard: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,

    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,

    elevation: 5,
  },

  routeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2F4A3E",
  },

  routeText: {
    marginTop: 5,
    color: "#666",
  },
});