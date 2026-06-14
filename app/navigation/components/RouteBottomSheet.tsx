import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const { height: SCREEN_HEIGHT } =
  Dimensions.get("window");

const TRACKING_PEEK_HEIGHT = 220;

const TRACKING_HALF_HEIGHT = 320;

const TRACKING_FULL_HEIGHT =
  SCREEN_HEIGHT * 0.85;

  const FLOOD_PEEK_HEIGHT = 220;

const FLOOD_HALF_HEIGHT = 380;

const FLOOD_FULL_HEIGHT =
  SCREEN_HEIGHT * 0.80;

import RecommendedRoute from "./RecommendedRoute";
import RouteCard from "./RouteCard";

type TrackingSheetState =
  | "peek"
  | "half"
  | "full";

  type FloodSheetState =
  | "peek"
  | "half"
  | "full";

type Props = {
  visible: boolean;

  routeRisk: string;

  sameRiskRoutes: boolean;

  recommendedRoute: any;

  alternativeRouteRisks: any[];

  selectedRoute: any;
  selectedMarker: any;

  hasViewedAlternatives: boolean;

  isExpanded: boolean;

  
  isNavigating: boolean;

  trackingState: TrackingSheetState;
  onTrackingStateChange: (
    state: TrackingSheetState
  ) => void;
  isFloodMode: boolean;
  onStartNavigation: () => void;

  onEndNavigation: () => void;

  onClose: () => void;

  onViewAlternatives: () => void;

  onRouteSelect: (route: any) => void;

  onChangeRoute: () => void;

  isLiveSharing: boolean;

setIsLiveSharing:
  React.Dispatch<
    React.SetStateAction<boolean>


  >;

  routePreference:
  | "flood"
  | "transport"
  | "private";

setRoutePreference: (
  value:
    | "flood"
    | "transport"
    | "private"
) => void;
};


export default function RouteBottomSheet({
  visible,
  routeRisk,
  sameRiskRoutes,
  recommendedRoute,
  alternativeRouteRisks,
  selectedRoute,
  selectedMarker,
  hasViewedAlternatives,

  isExpanded,
  
  isNavigating,
  trackingState,
  onTrackingStateChange,
  
  
  onStartNavigation,
  onEndNavigation,
  
  onClose,

  onViewAlternatives,
  onRouteSelect,
  onChangeRoute,
  
  isLiveSharing,
  setIsLiveSharing,
  routePreference,
setRoutePreference,
isFloodMode,
  }: Props){

    const animatedHeight = useRef(
      new Animated.Value(
        TRACKING_PEEK_HEIGHT
      )
    ).current;

    const dragStartHeight =
  useRef(TRACKING_PEEK_HEIGHT);



    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (
          _,
          gestureState
        ) => {
          return (
            Math.abs(gestureState.dy) > 10
          );
        },

        onPanResponderGrant: () => {
          dragStartHeight.current =
            (animatedHeight as any).__getValue();
        },
    
        

        


    
        onPanResponderMove: (
          _,
          gestureState
        ) => {
          const baseHeight =
          dragStartHeight.current;

      
       
          const nextHeight =
          baseHeight - gestureState.dy;
          const clampedHeight =


            Math.max(
              TRACKING_PEEK_HEIGHT,
              Math.min(
                nextHeight,
                TRACKING_FULL_HEIGHT
              )
            );
  
          animatedHeight.setValue(
            clampedHeight
          );
        },
        onPanResponderRelease: (
          _,
          gestureState
        ) => {
          const dragThreshold = 50;
        
          if (trackingState === "peek") {
            if (gestureState.dy < -dragThreshold) {
              onTrackingStateChange("half");
            }
        
            return;
          }
        
          if (trackingState === "half") {
            if (gestureState.dy < -dragThreshold) {
              onTrackingStateChange("full");
            } else if (
              gestureState.dy > dragThreshold
            ) {
              onTrackingStateChange("peek");
            }
        
            return;
          }
        
          if (trackingState === "full") {
            if (gestureState.dy > dragThreshold) {
              onTrackingStateChange("half");
            }
        
            return;
          }
        },
      })
    ).current;

   

    

    useEffect(() => {
      let targetHeight;
    
      if (trackingState === "peek") {
        targetHeight =
          TRACKING_PEEK_HEIGHT;
      } else if (
        trackingState === "half"
      ) {
        targetHeight =
          TRACKING_HALF_HEIGHT;
      } else {
        targetHeight =
          TRACKING_FULL_HEIGHT;
      }
    
      Animated.spring(
        animatedHeight,
        {
          toValue: targetHeight,
      
          damping: 22,
      
          stiffness: 220,
      
          mass: 0.9,
      
          useNativeDriver: false,
        }
      ).start();



    }, [trackingState]);
    
    const [
      floodSheetState,
      setFloodSheetState,
    ] = useState<FloodSheetState>("half");

    const floodAnimatedHeight =
  useRef(
    new Animated.Value(
      FLOOD_HALF_HEIGHT
    )
  ).current;

  const floodDragStartHeight =
  useRef(FLOOD_HALF_HEIGHT);

  const floodPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (
        _,
        gestureState
      ) => {
        return (
          Math.abs(gestureState.dy) > 10
        );
      },

      onPanResponderGrant: () => {
        floodDragStartHeight.current =
          (floodAnimatedHeight as any).__getValue();
      },

  
  
      onPanResponderMove: (
        _,
        gestureState
      ) => {
        const baseHeight =
        floodDragStartHeight.current;
          const nextHeight =
            baseHeight - gestureState.dy;
          
          const clampedHeight =
            Math.max(

            FLOOD_PEEK_HEIGHT,
            Math.min(
              nextHeight,
              FLOOD_FULL_HEIGHT
            )
          );
          
          
  
        floodAnimatedHeight.setValue(
          clampedHeight
        );
      },
  
      onPanResponderRelease: (
        _,
        gestureState
      ) => {
        const dragThreshold = 50;
  
        if (floodSheetState === "peek") {
          if (
            gestureState.dy <
            -dragThreshold
          ) {
            setFloodSheetState(
              "half"
            );
          }
  
          return;
        }
  
        if (floodSheetState === "half") {
          if (
            gestureState.dy <
            -dragThreshold
          ) {
            setFloodSheetState(
              "full"
            );
          } else if (
            gestureState.dy >
            dragThreshold
          ) {
            setFloodSheetState(
              "peek"
            );
          }
  
          return;
        }
  
        if (floodSheetState === "full") {
          if (
            gestureState.dy >
            dragThreshold
          ) {
            setFloodSheetState(
              "half"
            );
          }
  
          return;
        }
      },
    })
  ).current;




/*
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 150) {
          Animated.timing(translateY, {
            toValue: 400,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            translateY.setValue(0);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
*/


if (!visible) return null;
const getRiskColor = (
  risk: string
) => {
  switch (risk) {
    case "Safe":
      return "#4CAF50";

    case "Alert":
      return "#FFD54F";

    case "Warning":
      return "#FF9800";

    case "Critical":
      return "#F44336";

    default:
      return "#9CA3AF";
  }
};


if (isNavigating) {
  const risk =
  selectedRoute?.risk ?? "Safe";
  const leg =
  selectedRoute?.routeData?.legs?.[0];

const isCalculating = !selectedRoute;

const durationText = isCalculating
  ? "Calculating route..."
  : leg?.duration?.text ?? "";

const distanceText = isCalculating
  ? "Getting ETA and distance..."
  : `${leg?.distance?.text ?? ""} remaining`;

const summary = isCalculating
  ? "Preparing navigation..."
  : selectedRoute.summary;


return (
  <Animated.View
    style={[
      styles.sheet,
      {
        height: animatedHeight,
      }
    ]}
    
  >


    <View
  style={styles.handleContainer}
  {...panResponder.panHandlers}
>
  <View style={styles.handle} />
</View>


    <View style={styles.trackingHeader}>
      <View>
        <Text style={styles.trackingEta}>
          {durationText}
        </Text>

        <Text style={styles.trackingDistance}>
          {distanceText} remaining
        </Text>
      </View>

      <View
        style={[
          styles.badge,
          {
            backgroundColor:
              getRiskColor(risk),
          },
        ]}
      >
        <Text style={styles.badgeText}>
          {risk}
        </Text>
      </View>
    </View>

    <Text
      style={styles.trackingSummary}
      numberOfLines={1}
    >

      {summary}

    </Text>
{/* ALWAYS SHOW ACTIONS */}
<View style={styles.buttonRow}>
  <TouchableOpacity
    style={[
      styles.secondaryButton,
      styles.flexButton,
    ]}
    onPress={onEndNavigation}
  >
    <Text style={styles.buttonText}>
      End Navigation
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.primaryButton,
      styles.flexButton,
    ]}
    onPress={onChangeRoute}
  >
    <Text style={styles.buttonText}>
      Change Route
    </Text>
  </TouchableOpacity>
</View>
<TouchableOpacity
  style={styles.liveShareButton}
  onPress={() =>
    setIsLiveSharing(prev => !prev)
  }
>
  <Text style={styles.liveShareText}>
    {isLiveSharing
      ? "🟢 Live Share ON"
      : "🔴 Live Share OFF"}
  </Text>
</TouchableOpacity>




  {trackingState === "full" && (

<ScrollView
  showsVerticalScrollIndicator={false}
  style={{
    marginTop: 20,
    flex: 1,
  }}
  contentContainerStyle={{
    paddingBottom: 40,
  }}
>

    <Text style={styles.sectionTitle}>
      Currently Selected Route
    </Text>

    {selectedRoute && (
      <RecommendedRoute
        recommendedRoute={selectedRoute}
      />
    )}

<View style={styles.preferenceContainer}>
  <Text style={styles.preferenceTitle}>
    Preferred Route Type
  </Text>

  <View style={styles.preferenceRow}>

    <TouchableOpacity
      style={[
        styles.preferenceButton,
        routePreference === "flood" &&
          styles.preferenceButtonActive,
      ]}
      onPress={() =>
        setRoutePreference("flood")
      }
    >
      <Text
        style={[
          styles.preferenceText,
          routePreference === "flood" &&
            styles.preferenceTextActive,
        ]}
      >
        🔵 Flood Safest
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.preferenceButton,
        routePreference ===
          "transport" &&
          styles.preferenceButtonActive,
      ]}
      onPress={() =>
        setRoutePreference(
          "transport"
        )
      }
    >
      <Text
        style={[
          styles.preferenceText,
          routePreference ===
            "transport" &&
            styles.preferenceTextActive,
        ]}
      >
        🚌 Public
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.preferenceButton,
        routePreference ===
          "private" &&
          styles.preferenceButtonActive,
      ]}
      onPress={() =>
        setRoutePreference(
          "private"
        )
      }
    >
      <Text
        style={[
          styles.preferenceText,
          routePreference ===
            "private" &&
            styles.preferenceTextActive,
        ]}
      >
        🚗 Private
      </Text>
    </TouchableOpacity>

  </View>
</View>

{selectedRoute?.reasons?.length > 0 && (
  <View style={styles.whyBox}>
    <Text style={styles.whyTitle}>
      Algorithm Reasoning
    </Text>

    <Text style={styles.whyText}>
      Safety Score: {selectedRoute.safetyScore}/100
    </Text>

    {selectedRoute.reasons.map(
      (
        reason: string,
        index: number
      ) => (
        <Text
          key={index}
          style={styles.whyText}
        >
          ✓ {reason}
        </Text>
      )
    )}
  </View>
)}

    <Text style={styles.sectionTitle}>
      Sensor Information
    </Text>

    {selectedMarker ? (
      <View style={styles.inlineSensorBox}>
        <Text style={styles.trackingSummary}>
          {selectedMarker.title}
        </Text>

        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                getRiskColor(
                  selectedMarker.risk_tier
                ),

              alignSelf: "flex-start",

              marginTop: 4,

              marginBottom: 8,
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {selectedMarker.risk_tier}
          </Text>
        </View>

        <Text style={styles.whyText}>
          Water Rise:{" "}
          {(
            selectedMarker.water_rise_m * 100
          ).toFixed(0)} cm
        </Text>

        <Text style={styles.whyText}>
          Alert Level:{" "}
          {selectedMarker.alert_level}
        </Text>
      </View>
    ) : (
      <Text style={styles.description}>
        Tap a sensor on the map
        to view live telemetry.
      </Text>
    )}

   
  </ScrollView>
)}
   



   </Animated.View>
  
);

}




const isInitialState =
  !hasViewedAlternatives;

const isExpandedState =
  hasViewedAlternatives &&
  isExpanded;


const isCollapsedState =
hasViewedAlternatives &&
!isExpanded;


    
    const leg =
    selectedRoute?.routeData?.legs?.[0];
return (
  <Animated.View
  style={[
    styles.sheet,
    {
      height: floodAnimatedHeight,
    },
  ]}
>

<View
  style={styles.handleContainer}
  {...floodPanResponder.panHandlers}
>
  <View style={styles.handle} />
</View>
<ScrollView
  showsVerticalScrollIndicator={false}
  scrollEnabled={!isCollapsedState}
>
      {isInitialState && (
  <>
   <Text style={styles.title}>
  {isFloodMode
    ? "Flood Risk Detected"
    : "Available Routes"}
</Text>

{isFloodMode && (
  <Text style={styles.risk}>
    Risk Level: {routeRisk}
  </Text>
)}

<Text style={styles.description}>
  {isFloodMode
    ? "Review safer route options below."
    : "Choose your preferred route type."}
</Text>
  </>
)}

       
       
{isFloodMode &&
 recommendedRoute?.reasons?.length > 0 && (
  <View style={styles.whyBox}>
    <Text style={styles.whyTitle}>
      Algorithm Reasoning
    </Text>

    <Text style={styles.whyText}>
      Safety Score:{" "}
      {recommendedRoute.safetyScore}/100
    </Text>

    {recommendedRoute.reasons.map(
      (
        reason: string,
        index: number
      ) => (
        <Text
          key={index}
          style={styles.whyText}
        >
          ✓ {reason}
        </Text>
      )
    )}
  </View>
)}





{isExpandedState && selectedRoute && (
  <>
    <Text style={styles.sectionTitle}>
      Selected Route
    </Text>

    <RecommendedRoute
      recommendedRoute={selectedRoute}
    />
  </>
)}

{isFloodMode &&
 isExpandedState &&
 sameRiskRoutes && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              All generated routes have
              similar flood risks.
            </Text>
          </View>
        )}

{!hasViewedAlternatives && (
  <TouchableOpacity
    style={styles.primaryButton}
    onPress={onViewAlternatives}
  >
    <Text style={styles.buttonText}>
      View Alternatives
    </Text>
  </TouchableOpacity>
)}
{isExpandedState &&
  alternativeRouteRisks.length > 0 && (
    <>
      <Text style={styles.sectionTitle}>
        Generated Routes
      </Text>

      {alternativeRouteRisks.map(
        (route, index) => (
          <RouteCard
            key={
              route.routeData
                ?.overview_polyline?.points
            }
            route={route}
            index={index}
            isSelected={
              selectedRoute?.routeData
                ?.overview_polyline?.points ===
              route.routeData
                ?.overview_polyline?.points
            }
            onSelect={() =>
              onRouteSelect(route)
            }
          />
        )
      )}
    </>
)}

{isCollapsedState &&
 selectedRoute && (
  <>
    <View style={styles.compactHeader}>
      <Text style={styles.title}>
        Selected Route
      </Text>

      <View
        style={[
          styles.badge,
          {
            backgroundColor:
              getRiskColor(
                selectedRoute.risk
              ),
          },
        ]}
      >
        <Text style={styles.badgeText}>
          {selectedRoute.risk}
        </Text>
      </View>
    </View>

    <Text style={styles.compactSummary}>
      {selectedRoute.summary}
    </Text>

    {leg && (
  <Text style={styles.compactInfo}>
    ⏱ {leg.duration.text}
    {" • "}
    📍 {leg.distance.text}
  </Text>
)}
    

    <View style={styles.buttonRow}>
      <TouchableOpacity
        style={[
          styles.secondaryButton,
          styles.flexButton,
        ]}
        onPress={onChangeRoute}
      >
        <Text style={styles.buttonText}>
          Change Route
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          styles.flexButton,
        ]}
        onPress={onStartNavigation}
      >
        <Text style={styles.buttonText}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  </>
)}

{!isCollapsedState && (
  <TouchableOpacity
    style={styles.primaryButton}
    onPress={onStartNavigation}
  >
    <Text style={styles.buttonText}>
      Continue Route
    </Text>
  </TouchableOpacity>
)}

      </ScrollView>
   
    </Animated.View> 
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    padding: 20,

    elevation: 20,
    zIndex: 99999,
  },

  handle: {
    width: 50,
    height: 5,

    borderRadius: 10,

    backgroundColor: "#D1D5DB",

    alignSelf: "center",

    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  risk: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
  },

  description: {
    marginTop: 10,
    marginBottom: 20,
    color: "#666",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 20,
  },

  notice: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
  },

  noticeText: {
    color: "#92400E",
    fontWeight: "600",
  },

  primaryButton: {
    backgroundColor: "#1976D2",

    paddingVertical: 14,

    borderRadius: 12,

    alignItems: "center",

    marginTop: 20,
  },
  handleContainer: {
    alignItems: "center",
  
    paddingTop: 20,
    paddingBottom: 20,
  
    minHeight: 50,
  
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "#6B7280",

    paddingVertical: 14,

    borderRadius: 12,

    alignItems: "center",

    marginTop: 15,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  sectionContainer: {
    marginTop: 15,
  },
  
  compactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  
  badgeText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 12,
  },
  
  compactSummary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  
  compactInfo: {
    color: "#6B7280",
    marginBottom: 15,
    fontSize: 14,
    fontWeight: "500",
  },
  
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  
  flexButton: {
    flex: 1,
    marginTop: 0,
  },
  whyBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  
  whyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  
  whyText: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 4,
  },
  trackingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  
  trackingEta: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1976D2",
  },
  
  trackingDistance: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 2,
  },
  
  trackingSummary: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 10,
  },
  inlineSensorBox: {
    backgroundColor: "#F9FAFB",
  
    borderWidth: 1,
  
    borderColor: "#E5E7EB",
  
    borderRadius: 12,
  
    padding: 12,
  
    marginTop: 5,
  },
  liveShareButton: {
    marginTop: 12,
  
    paddingVertical: 12,
  
    borderRadius: 12,
  
    alignItems: "center",
  
    backgroundColor: "#F3F4F6",
  
    borderWidth: 1,
  
    borderColor: "#E5E7EB",
  },
  
  liveShareText: {
    fontSize: 15,
  
    fontWeight: "700",
  
    color: "#374151",
  },
  preferenceContainer: {
    marginVertical: 12,
  },
  
  preferenceTitle: {
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  
  preferenceRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
  },
  
  preferenceButton: {
    flex: 1,
  
    paddingVertical: 10,
  
    marginHorizontal: 4,
  
    borderRadius: 12,
  
    borderWidth: 1,
  
    borderColor: "#D1D5DB",
  
    alignItems: "center",
  
    backgroundColor: "#FFF",
  },
  
  preferenceButtonActive: {
    backgroundColor: "#1976D2",
  
    borderColor: "#1976D2",
  },
  
  preferenceText: {
    fontSize: 12,
  
    color: "#374151",
  
    fontWeight: "600",
  },
  
  preferenceTextActive: {
    color: "#FFF",
  },
});