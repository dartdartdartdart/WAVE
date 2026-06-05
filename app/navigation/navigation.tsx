import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";


import { supabase } from "../../lib/supabase";

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

  async function loadMarkers() {
    console.log("LOAD MARKERS START");
  
    try {
      const { data, error } = await supabase
        .from("telemetry_readings")
        .select("*")
        .order("recorded_at", { ascending: false });
  
      if (error) {
        console.log("MARKER ERROR:", error);
        return;
      }
  
      const latestDevices = new Map();
  
      data?.forEach((row) => {
        if (!latestDevices.has(row.device_id)) {
          latestDevices.set(row.device_id, row);
        }
      });
  
      const telemetryMarkers = [
        {
          id: "wave_01",
          lat: 7.0982,
          lng: 125.6421,
          title: "IoT Unit 1 - Water Level",
        },
        {
          id: "wave_02",
          lat: 7.0604,
          lng: 125.5947,
          title: "IoT Unit 2 - Rainfall",
        },
      ].map((marker) => {
        const live = latestDevices.get(marker.id);
  
        return {
          ...marker,
          risk_tier: live?.tier_level ?? "Safe",
          water_rise_m: live?.water_rise_m ?? 0,
          alert_level:
            live?.tier_level === "Critical"
              ? 3
              : live?.tier_level === "Warning"
              ? 2
              : live?.tier_level === "Alert"
              ? 1
              : 0,
        };
      });
  
      console.log(
        "TELEMETRY MARKERS:",
        telemetryMarkers
      );
  
      setMarkers(telemetryMarkers);
  
    } catch (err) {
      console.log("LOAD MARKERS CRASH:", err);
    }
  }

  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
 
  useEffect(() => {
    console.log("NAVIGATION SCREEN MOUNTED");
  
    loadMarkers();
  
    const channel = supabase
      .channel("device-live-status")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "device_live_status",
        },
        (payload) => {
          console.log("REALTIME UPDATE RECEIVED");
          console.log(payload);
  
          loadMarkers();
        }
      )
      .subscribe((status) => {
        console.log("REALTIME STATUS:", status);
      });
  
    return () => {
      console.log("REMOVING REALTIME CHANNEL");
  
      supabase.removeChannel(channel);
    };
  }, []);
  const safeCount = markers.filter(
    m => m.risk_tier === "Safe"
  ).length;
  
  const alertCount = markers.filter(
    m => m.risk_tier === "Alert"
  ).length;
  
  const warningCount = markers.filter(
    m => m.risk_tier === "Warning"
  ).length;
  
  const criticalCount = markers.filter(
    m => m.risk_tier === "Critical"
  ).length;

  console.log("CURRENT MARKERS STATE:", markers);
  console.log("MARKER COUNT:", markers.length);

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
        {markers.map((marker: any) => {
  console.log("RENDERING:", marker.id);

  return (
    <Marker
      key={marker.id}
      coordinate={{
        latitude: marker.lat,
        longitude: marker.lng,
      }}
      pinColor={getMarkerColor(marker.risk_tier)}
      title={marker.title}
      description={marker.message}
      onPress={() => setSelectedMarker(marker)}
    />
  );
})}
      </MapView>

      {/* Status Card */}
      <View style={styles.infoCard}>
  {selectedMarker ? (
    <>
      <Text style={styles.routeTitle}>
        {selectedMarker.title}
      </Text>

      <View
  style={{
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor:
      selectedMarker.risk_tier === "Safe"
        ? "#4CAF50"
        : selectedMarker.risk_tier === "Alert"
        ? "#FFD54F"
        : selectedMarker.risk_tier === "Warning"
        ? "#FF9800"
        : "#F44336",
  }}
>
  <Text
    style={{
      color: "#fff",
      fontWeight: "bold",
    }}
  >
    {selectedMarker.risk_tier}
  </Text>
</View>

<Text style={styles.routeText}>
  Water Rise: {(selectedMarker.water_rise_m * 100).toFixed(0)} cm
</Text>

<Text style={styles.routeText}>
  Alert Level: {selectedMarker.alert_level}
</Text>
    </>
  ) : (
    <>
      <Text style={styles.routeTitle}>
        W.A.V.E. Flood Monitoring
      </Text>

      <Text style={styles.routeText}>
        Tap a sensor marker
      </Text>
    </>
  )}
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