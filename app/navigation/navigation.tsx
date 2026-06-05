import * as Location from "expo-location";

import { useRef } from "react";

import {
  GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import MapViewDirections from "react-native-maps-directions";

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
  const [location, setLocation] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);

  const mapRef = useRef<MapView>(null);
  useEffect(() => {
    if (!location || !mapRef.current) return;
  
    mapRef.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  }, [location]);
 
  useEffect(() => {
    console.log("NAVIGATION SCREEN MOUNTED");
  
    loadMarkers();
  
    const channel = supabase
      .channel("telemetry-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "telemetry_readings",
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
  
  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();
  
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }
  
      const current =
        await Location.getCurrentPositionAsync({});
  
      console.log("CURRENT GPS:", current.coords);
  
      setLocation(current.coords);
    })();
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
  
      <GooglePlacesAutocomplete
        placeholder="Where do you want to go?"
        fetchDetails={true}
        onPress={(data, details = null) => {
          if (!details) return;
        
          setDestination({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
          });
        }}
        query={{
          key: "AIzaSyAw_KSanfyBRyW8h7RGJa28catfm0xPcrM",
          language: "en",
        }}
        styles={{
          container: {
            position: "absolute",
            top: 60,
            left: 10,
            right: 10,
            zIndex: 999,
            elevation: 10,
          },
        }}
      />
  
  <MapView
  ref={mapRef}
  style={styles.map}
  showsUserLocation={true}
  followsUserLocation={true}

  
  initialRegion={{
    latitude: location?.latitude ?? 7.0731,
    longitude: location?.longitude ?? 125.6128,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
>

{destination && ( <Marker coordinate={destination} title="Destination" pinColor="blue" /> )} 
{location && destination && (
  <MapViewDirections
    origin={{
      latitude: location.latitude,
      longitude: location.longitude,
    }}
    destination={destination}
    apikey={"AIzaSyAw_KSanfyBRyW8h7RGJa28catfm0xPcrM"}
    strokeWidth={5}
    onReady={(result) => {
      mapRef.current?.fitToCoordinates(
        result.coordinates,
        {
          edgePadding: {
            top: 100,
            right: 100,
            bottom: 100,
            left: 100,
          },
          animated: true,
        }
      );
    }}
  />
)}
       

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
      description={`Water Rise: ${(marker.water_rise_m * 100).toFixed(0)} cm`}
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