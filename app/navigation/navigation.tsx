import * as Location from "expo-location";

import { useRef } from "react";

import {
  GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import MapViewDirections from "react-native-maps-directions";

import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { supabase } from "../../lib/supabase";

import polyline from "@mapbox/polyline";


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
function calculateRouteRisk(
  coordinates: any[],
  markers: any[]
) {
  let highestRisk = "Safe";

  markers.forEach((sensor) => {
    let closestDistance = Infinity;

    coordinates.forEach((point) => {
      const distance = getDistanceKm(
        point[0],
        point[1],
        sensor.lat,
        sensor.lng
      );

      if (distance < closestDistance) {
        closestDistance = distance;
      }
    });
    console.log(
      sensor.id,
      sensor.risk_tier,
      "CLOSEST:",
      closestDistance.toFixed(2),
      "km"
    );

    if (closestDistance <= 5) {
      if (sensor.risk_tier === "Critical") {
        highestRisk = "Critical";
      } else if (
        sensor.risk_tier === "Warning" &&
        highestRisk !== "Critical"
      ) {
        highestRisk = "Warning";
      } else if (
        sensor.risk_tier === "Alert" &&
        highestRisk === "Safe"
      ) {
        highestRisk = "Alert";
      }
    }
  });

  return highestRisk;
}

function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}
export default function NavigationScreen() {

  const {
    destination: destinationParam,
  } = useLocalSearchParams();

  console.log(
    "DESTINATION PARAM:",
    destinationParam
  );

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
  const [
    selectedRouteCoordinates,
    setSelectedRouteCoordinates,
  ] = useState<any[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [alternativeRouteRisks, setAlternativeRouteRisks] =
  useState<any[]>([]);


const [routeCoordinates, setRouteCoordinates] =
  useState<any[]>([]);

  const [routeRisk, setRouteRisk] =
  useState("Safe");
  const [
    recommendedRoute,
    setRecommendedRoute,
  ] = useState<any>(null);
  
  const [
    sameRiskRoutes,
    setSameRiskRoutes,
  ] = useState(false);
  const [showFloodModal, setShowFloodModal] =
  useState(false);
  const [alternativeRoutes, setAlternativeRoutes] =
  useState<any[]>([]);
  const [
    selectedRoute,
    setSelectedRoute,
  ] = useState<any>(null);
  
  async function fetchAlternativeRoutes() {
    if (!location || !destination) {
      return;
    }
  
    console.log(
      "FETCHING ALTERNATIVE ROUTES"
    );
  
    const url =
      `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${location.latitude},${location.longitude}` +
      `&destination=${destination.latitude},${destination.longitude}` +
      `&alternatives=true` +
      `&key=AIzaSyAw_KSanfyBRyW8h7RGJa28catfm0xPcrM`;
  
    const response = await fetch(url);
  
    const data = await response.json();
  
    console.log(
      "ALTERNATIVE ROUTES RESPONSE:",
      data
    );
    console.log(
      "ALTERNATIVE ROUTE COUNT:",
      data.routes.length
    );
  
    setAlternativeRoutes(
      data.routes || []
    );
    console.log(
      "START ANALYZING ALTERNATIVE ROUTES"
    );
    
    const analyzedRoutes = data.routes.map(
      (route: any) => {
    
        const decoded = polyline.decode(
          route.overview_polyline.points
        );
    
        const risk = calculateRouteRisk(
          decoded,
          markers
        );
    
        console.log(
          "ROUTE:",
          route.summary
        );
    
        console.log(
          "RISK:",
          risk
        );
    
        return {
          summary: route.summary,
          risk,
          routeData: route,
        };
      }
    );
    
    console.log(
      "ANALYZED ROUTES:",
      analyzedRoutes
    );
    
    setAlternativeRouteRisks(
      analyzedRoutes
    );
    /* RECOMMENDATION LOGIC */

const riskScore: any = {
  Safe: 0,
  Alert: 1,
  Warning: 2,
  Critical: 3,
};

const uniqueRisks = [
  ...new Set(
    analyzedRoutes.map(
      (route: any) => route.risk
    )
  ),
];

if (uniqueRisks.length === 1) {

  setSameRiskRoutes(true);

} else {

  setSameRiskRoutes(false);

  const bestRoute =
    analyzedRoutes.reduce(
      (best: any, current: any) =>

        riskScore[current.risk] <
        riskScore[best.risk]

          ? current
          : best
    );

  setRecommendedRoute(
    bestRoute
  );

  console.log(
    "RECOMMENDED ROUTE:",
    bestRoute
  );
}

    const firstRoute = data.routes[0];


    
    
  

const decodedRoute = polyline.decode(
  firstRoute.overview_polyline.points
);

console.log(
  "DECODED ROUTE POINT COUNT:",
  decodedRoute.length
);

console.log(
  "FIRST DECODED POINT:",
  decodedRoute[0]
);

console.log(
  "LAST DECODED POINT:",
  decodedRoute[decodedRoute.length - 1]
);
    data.routes.forEach(
      (route: any, index: number) => {
        console.log(
          `ROUTE ${index + 1} SUMMARY:`,
          route.summary
        );
    
        console.log(
          `ROUTE ${index + 1} POLYLINE:`,
          route.overview_polyline?.points
        );
      }
    );
    console.log(
      "ALTERNATIVE ROUTES SAVED:",
      data.routes.length
    );
 
  }
  useEffect(() => {
    console.log(
      "ALTERNATIVE ROUTES STATE:",
      alternativeRoutes.length
    );
  }, [alternativeRoutes]);
  useEffect(() => {
    if (
      routeCoordinates.length === 0 ||
      markers.length === 0
    ) {
      return;
    }
  
    console.log(
      "STARTING ROUTE ANALYSIS"
    );
  
    let highestRisk = "Safe";
  
    markers.forEach((sensor) => {
      let closestDistance = Infinity;
  
      routeCoordinates.forEach((point) => {
        const distance = getDistanceKm(
          point.latitude,
          point.longitude,
          sensor.lat,
          sensor.lng
        );
  
        if (distance < closestDistance) {
          closestDistance = distance;
        }
      });
  
      console.log(
        sensor.id,
        sensor.risk_tier,
        "CLOSEST DISTANCE:",
        closestDistance.toFixed(2),
        "km"
      );
  
      if (closestDistance <= 5) {
        if (sensor.risk_tier === "Critical") {
          highestRisk = "Critical";
        } else if (
          sensor.risk_tier === "Warning" &&
          highestRisk !== "Critical"
        ) {
          highestRisk = "Warning";
        } else if (
          sensor.risk_tier === "Alert" &&
          highestRisk === "Safe"
        ) {
          highestRisk = "Alert";
        }
      }
    });
  
    console.log(
      "FINAL ROUTE RISK:",
      highestRisk
    );
  
    setRouteRisk(highestRisk);

    if (highestRisk !== "Safe") {
      setShowFloodModal(true);
      console.log(
        "SHOWING FLOOD MODAL"
      );
    }

if (highestRisk !== "Safe") {
  
}
  }, [routeCoordinates, markers]);


  useEffect(() => {
    if (!destinationParam) return;
  
    console.log(
      "LOOKING UP DESTINATION:",
      destinationParam
    );
  
    const fetchDestination = async () => {
      try {
        const response = await fetch(
          "https://maps.googleapis.com/maps/api/geocode/json?address=" +
          encodeURIComponent(
            destinationParam as string
          ) +
          "&key=AIzaSyAw_KSanfyBRyW8h7RGJa28catfm0xPcrM"
        );
  
        const data = await response.json();
  
        console.log(
          "GEOCODE RESPONSE:",
          data
        );
  
        if (
          data.results &&
          data.results.length > 0
        ) {
          const location =
            data.results[0].geometry.location;
  
          const coords = {
            latitude: location.lat,
            longitude: location.lng,
          };
  
          console.log(
            "SETTING DESTINATION:",
            coords
          );
  
          setDestination(coords);
        }
      } catch (error) {
        console.log(
          "GEOCODE ERROR:",
          error
        );
      }
    };
  
    fetchDestination();
  }, [destinationParam]);
  useEffect(() => {
    console.log(
      "DESTINATION CHANGED:",
      destination
    );
  }, [destination]);

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
  
  console.log("LOCATION STATE:", location);
  
  console.log("DESTINATION STATE:", destination);
  
  console.log(
    "CAN RENDER DIRECTIONS:",
    !!location && !!destination
  );
  console.log(
    "ROUTE STATE COUNT:",
    routeCoordinates.length
  );
  console.log(
    "SHOW FLOOD MODAL STATE:",
    showFloodModal
  );
  return (
    <View style={styles.container}>
  <Modal
  visible={showFloodModal}
  transparent
  animationType="fade"
>
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    }}
  >
    <View
      style={{
        width: "85%",
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        ⚠ Flood Risk Detected
      </Text>

      <Text>
  Current Route Risk: {routeRisk}
</Text>

<Text
  style={{
    marginTop: 10,
  }}
>
  This route passes near a monitored flood zone.
</Text>
<TouchableOpacity
  onPress={() => {
    setShowFloodModal(true);
  }}
  style={{
    marginTop: 10,
    backgroundColor: "#1976D2",
    padding: 10,
    borderRadius: 8,
  }}
>
  <Text
    style={{
      color: "white",
      textAlign: "center",
      fontWeight: "bold",
    }}
  >
    Change Route
  </Text>
</TouchableOpacity>

<Text
  style={{
    marginTop: 10,
  }}
>
  An alternative route may be available.
</Text>
{alternativeRouteRisks.length > 0 && (
  <View style={{ marginTop: 20 }}>
    <Text
      style={{
        fontWeight: "bold",
        marginBottom: 10,
      }}
    >
      Alternative Routes
    </Text>

    {alternativeRouteRisks.map(
      (route: any, index: number) => (
        <View
          key={index}
          style={{
            marginBottom: 10,
          }}
        >
          <Text>
            Route {index + 1}
          </Text>

          <Text>
            {route.summary}
          </Text>

          <Text>
            Risk: {route.risk}
          </Text>

          <TouchableOpacity
onPress={() => {

  console.log(
    "SELECTED ROUTE:",
    route.summary
  );

  const decoded =
    polyline.decode(
      route.routeData
        .overview_polyline
        .points
    );

  const coordinates =
    decoded.map(
      ([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      })
    );

  console.log(
    "SELECTED ROUTE POINTS:",
    coordinates.length
  );

  setSelectedRoute(route);

  setSelectedRouteCoordinates(
    coordinates
  );
  mapRef.current?.fitToCoordinates(
    coordinates,
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
  setShowFloodModal(false);
}}


  style={{
    marginTop: 5,
    backgroundColor: "#1976D2",
    padding: 8,
    borderRadius: 6,
  }}
>
  <Text
    style={{
      color: "white",
      textAlign: "center",
    }}
  >
    Select Route
  </Text>
</TouchableOpacity>
        </View>
      )
    )}
  </View>
)}

{sameRiskRoutes ? (
  <View
    style={{
      marginTop: 15,
      padding: 10,
      backgroundColor: "#FFF3CD",
      borderRadius: 8,
    }}
  >
    <Text>
      All available routes currently
      have the same flood risk level.
    </Text>
  </View>
) : (
  recommendedRoute && (
    <View
      style={{
        marginTop: 15,
        padding: 10,
        backgroundColor: "#E3F2FD",
        borderRadius: 8,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
        }}
      >
        Recommended Route
      </Text>

      <Text>
        {recommendedRoute.summary}
      </Text>

      <Text>
        Risk: {recommendedRoute.risk}
      </Text>
    </View>
  )
)}
<TouchableOpacity
  style={{
    marginTop: 20,
    backgroundColor: "#1976D2",
    padding: 12,
    borderRadius: 8,
  }}
  onPress={fetchAlternativeRoutes}
>

        <Text
          style={{
            color: "white",
            textAlign: "center",
          }}
        >
          View Alternatives
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          marginTop: 10,
          backgroundColor: "#666",
          padding: 12,
          borderRadius: 8,
        }}
        onPress={() => {
          setShowFloodModal(false);
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
          }}
        >
          Continue Current Route
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
      <GooglePlacesAutocomplete
        placeholder="Where do you want to go?"
        fetchDetails={true}
        onPress={(data, details = null) => {
          console.log("PLACE PRESSED");
        
          console.log("DATA:", data);
        
          console.log("DETAILS:", details);
        
          if (!details) {
            console.log("DETAILS IS NULL");
            return;
          }
        
          const newDestination = {
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
          };
        
          console.log(
            "SETTING DESTINATION:",
            newDestination
          );
        
          setDestination(newDestination);
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
{location &&
 destination &&
 selectedRouteCoordinates.length === 0 && (
  <>
    {console.log(
      "MAPVIEW DIRECTIONS SHOULD RENDER"
    )}

    <MapViewDirections
      origin={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      destination={destination}
      apikey={"AIzaSyAw_KSanfyBRyW8h7RGJa28catfm0xPcrM"}
      strokeWidth={5}

      onStart={(params) => {
        console.log("ROUTE START");
        console.log(params);
      }}

      onReady={(result) => {
        console.log(
          "ROUTE COORDINATES COUNT:",
          result.coordinates.length
        );
        setRouteCoordinates(result.coordinates);

console.log(
  "ROUTE SAVED:",
  result.coordinates.length
);

        console.log(
          "FIRST ROUTE POINT:",
          result.coordinates[0]
        );

        console.log(
          "LAST ROUTE POINT:",
          result.coordinates[
            result.coordinates.length - 1
          ]
        );

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

      onError={(errorMessage) => {
        console.log(
          "DIRECTIONS ERROR:",
          errorMessage
        );
      }}
    />





  </>
)}

{selectedRouteCoordinates.length > 0 && (
  <Polyline
    coordinates={
      selectedRouteCoordinates
    }
    strokeWidth={5}
   strokeColor="#1976D2"
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



      {routeRisk !== "Safe" && (
  <View
    style={[
      styles.warningCard,
      routeRisk === "Alert"
        ? styles.alertCard
        : routeRisk === "Warning"
        ? styles.warningLevelCard
        : styles.criticalCard,
    ]}
  >
   <Text style={styles.warningTitle}>
  ⚠ Flood Risk Detected
</Text>

<Text style={styles.warningText}>
  Current Route Risk: {routeRisk}
</Text>

<Text style={styles.warningText}>
  This route passes near a monitored flood zone.
</Text>
  </View>
)}

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
  warningCard: {
    position: "absolute",
    top: 120,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    zIndex: 1000,
  },
  
  alertCard: {
    backgroundColor: "#FFD54F",
  },
  
  warningLevelCard: {
    backgroundColor: "#FF9800",
  },
  
  criticalCard: {
    backgroundColor: "#F44336",
  },
  
  warningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  
  warningText: {
    fontSize: 14,
  },
});