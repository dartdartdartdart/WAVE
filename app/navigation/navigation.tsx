import * as Location from "expo-location";
import { useRef } from "react";
import RouteBottomSheet from "./components/RouteBottomSheet";



import {
  analyzeRoutes,
  rerankRoutes,
  getDistanceKm,
  calculateTransportOverlap,
} from "./components/RouteScoring";

import polyline from "@mapbox/polyline";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { supabase } from "../../lib/supabase";
import SensorInfoCard from "./components/SensorInfoCard";

import NavigationSearchBar from "./components/NavigationSearchBar";

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
          lat: 7.0505,
          lng: 125.5985,
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
  const [isLiveSharing, setIsLiveSharing] =
  useState(false);
  
  const [
    selectedRouteCoordinates,
    setSelectedRouteCoordinates,
  ] = useState<any[]>([]);
  const [
    storedAnalyzedRoutes,
    setStoredAnalyzedRoutes,
  ] = useState<any[]>([]);

  const [markers, setMarkers] = useState<any[]>([]);
  const [hasViewedAlternatives, setHasViewedAlternatives] =
  useState(false);
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
  const [showLegend, setShowLegend] =
  useState(false);
  const [
    sameRiskRoutes,
    setSameRiskRoutes,
  ] = useState(false);
  const [showFloodModal, setShowFloodModal] =
  useState(false);
  const [alternativeRoutes, setAlternativeRoutes] =
  useState<any[]>([]);
  const [isExpanded, setIsExpanded] =
  useState(false);
  const [
    selectedRoute,
    setSelectedRoute,
  ] = useState<any>(null);

  const [
    routePreference,
    setRoutePreference,
  ] = useState<
    "flood" |
    "transport" |
    "private"

    
  >("flood");

  const [
    isFloodMode,
    setIsFloodMode,
  ] = useState(true);



  // =========================================
// TRACKING MODE STATES
// =========================================

type TrackingSheetState =
| "peek"
| "half"
| "full";

const [isNavigating, setIsNavigating] =
useState(false);


const [
  trackingState,
  setTrackingState,
] = useState<TrackingSheetState>(
  "full"
);


  const handleRouteSelect = (route: any) => {
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
    setIsExpanded(false);
  
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
   
    //setHasViewedAlternatives(false);

    
   
  };


// =========================================
// NAVIGATION LIFECYCLE
// =========================================

const handleStartNavigation = () => {
  setTrackingState("peek");

  setIsNavigating(true);

  // Future:
  // fit map
  // ETA updates
  // rerouting
};

const handleEndNavigation = () => {
  setIsNavigating(false);

  setShowFloodModal(false);

  setHasViewedAlternatives(false);

  setIsExpanded(false);

  setTrackingState("peek");

  setSelectedRoute(null);

  setRecommendedRoute(null);

  setAlternativeRouteRisks([]);

  setAlternativeRoutes([]);

  setSelectedRouteCoordinates([]);

  setRouteCoordinates([]);

  setIsLiveSharing(false);
};

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
    
    console.log(
      "FETCHING ALTERNATIVE ROUTES"
    );

    const {
      analyzedRoutes: analyzed,
      recommendedRoute,
      sameRiskRoutes,
    } = analyzeRoutes(
      data.routes,
      markers
    );

    const isFlood =
  analyzed.every(
    route => route.risk !== "Safe"
  );

setIsFloodMode(isFlood);

console.log(
  "OPERATING MODE:",
  isFlood
    ? "FLOOD MODE"
    : "NORMAL MODE"
);

    
    console.log(
      "ANALYZED ROUTES:",
      analyzed
    );
    
    setAlternativeRouteRisks(
      analyzed
    );
    
    setStoredAnalyzedRoutes(
      analyzed
    );
    setSameRiskRoutes(
      sameRiskRoutes
    );
    
    setRecommendedRoute(
      recommendedRoute
    );

    setShowFloodModal(true);





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
    console.log(
      "ANALYSIS EFFECT RUNNING",
      routeCoordinates.length,
      markers.length
    );
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
      console.log(
        "OLD ROUTE ANALYSIS DETECTED:",
        highestRisk
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
    if (
      location &&
      destination &&
      markers.length > 0
    ) {
      fetchAlternativeRoutes();
    }
  }, [
    location,
    destination,
    markers,
  ]);
 
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
  console.log(
    "SHOW FLOOD MODAL STATE:",
    showFloodModal
  );

  useEffect(() => {
    if (storedAnalyzedRoutes.length === 0) {
      return;
    }
  
    const {
      routes,
      recommendedRoute,
    } = rerankRoutes(
      storedAnalyzedRoutes,
      routePreference,
      isFloodMode
    );
    setAlternativeRouteRisks(
      routes
    );
  
    setRecommendedRoute(
      recommendedRoute
    );
  
  }, [
    routePreference,
    storedAnalyzedRoutes,
    isFloodMode,
  ]);
  
  return (
    <View style={styles.container}>
     


        <NavigationSearchBar
        
  onPlaceSelected={(newDestination) => {
    setDestination(newDestination);

    setSelectedRoute(null);
    
    setSelectedRouteCoordinates([]);
    
    setRouteCoordinates([]);
    
    setAlternativeRoutes([]);
    
    setAlternativeRouteRisks([]);
    
    setRecommendedRoute(null);
    
    setSameRiskRoutes(false);
    
    setHasViewedAlternatives(true);
    
    setIsExpanded(true);
  
    mapRef.current?.animateToRegion({
      latitude: newDestination.latitude,
      longitude: newDestination.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  }}
    />

  

      
  
  <MapView
  ref={mapRef}
  style={styles.map}
  showsUserLocation={true}
  followsUserLocation={false}

  
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
        console.log(
          "MAPVIEW DIRECTIONS READY"
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
})}</MapView>

<TouchableOpacity
  style={styles.legendButton}
  onPress={() =>
    setShowLegend(prev => !prev)
  }
>
  <Text style={styles.legendButtonText}>
    ⓘ Legend
  </Text>
</TouchableOpacity>


{showLegend && (
  <View style={styles.legendContainer}>
    <Text style={styles.legendTitle}>
      Map Legend
    </Text>

    <Text style={styles.legendItem}>
      🔵 User Location
    </Text>

    <Text style={styles.legendItem}>
      🟢 Safe
    </Text>

    <Text style={styles.legendItem}>
      🟡 Alert
    </Text>

    <Text style={styles.legendItem}>
      🟠 Warning
    </Text>

    <Text style={styles.legendItem}>
      🔴 Critical
    </Text>

    <Text style={styles.legendItem}>
      📍 Destination
    </Text>
  </View>
)}


<SensorInfoCard
  selectedMarker={selectedMarker}
/>

<RouteBottomSheet
  visible={showFloodModal}
  routeRisk={routeRisk}
  sameRiskRoutes={sameRiskRoutes}
  recommendedRoute={recommendedRoute}
  alternativeRouteRisks={alternativeRouteRisks}
  selectedRoute={selectedRoute}
  selectedMarker={selectedMarker}
  hasViewedAlternatives={hasViewedAlternatives}
  isExpanded={isExpanded}
  onClose={() =>
    setShowFloodModal(false)
  }
  onViewAlternatives={() => {
    fetchAlternativeRoutes();

    setHasViewedAlternatives(true);

    setIsExpanded(true);
  }}
  onRouteSelect={handleRouteSelect}
  onChangeRoute={() => {
    setIsNavigating(false);
  
    setShowFloodModal(true);
  
    setHasViewedAlternatives(true);
  
    setIsExpanded(true);
  
    setTrackingState("peek");
  }}

  // NEW
  isNavigating={isNavigating}
  trackingState={trackingState}
  onTrackingStateChange={setTrackingState}
  onStartNavigation={
    handleStartNavigation
  }
  onEndNavigation={
    handleEndNavigation
  }

  isLiveSharing={isLiveSharing}
setIsLiveSharing={setIsLiveSharing}

routePreference={routePreference}
setRoutePreference={
  setRoutePreference
}
isFloodMode={isFloodMode}
/>

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
  legendButton: {
    position: "absolute",
  
    top: 120,
  
    right: 16,
  
    backgroundColor: "#FFFFFF",
  
    paddingHorizontal: 14,
  
    paddingVertical: 10,
  
    borderRadius: 20,
  
    elevation: 6,
  
    zIndex: 99999,
  },
  
  legendButtonText: {
    fontWeight: "700",
  
    color: "#374151",
  },
  
  legendContainer: {
    position: "absolute",
  
    top: 170,
  
    right: 16,
  
    backgroundColor: "#FFFFFF",
  
    padding: 14,
  
    borderRadius: 12,
  
    elevation: 6,
  
    zIndex: 99999,
  
    minWidth: 170,
  },
  
  legendTitle: {
    fontWeight: "700",
  
    fontSize: 16,
  
    marginBottom: 10,
  
    color: "#111827",
  },
  
  legendItem: {
    fontSize: 14,
  
    marginBottom: 6,
  
    color: "#374151",
  },
  
});