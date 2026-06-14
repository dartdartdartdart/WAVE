import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  route: any;
  index: number;
  isSelected?: boolean;
  onSelect: () => void;
};
export default function RouteCard({
  route,
  index,
  isSelected,
  onSelect,
}: Props) {
  const leg = route?.routeData?.legs?.[0];

  const getRiskColor = () => {
    switch (route.risk) {
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

  return (
    
    <TouchableOpacity
    style={[
      styles.card,
      isSelected &&
        styles.selectedCard,
    ]}
    onPress={onSelect}
    activeOpacity={0.8}
  >
      <View style={styles.header}>
      <Text style={styles.title}>
      Route {index + 1}

{isSelected && " • Selected"}
</Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                getRiskColor(),
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {route.risk}
          </Text>
        </View>
      </View>

      <Text style={styles.summary}>
  {route.summary}
</Text>

{route.safetyScore !== undefined && (
  <Text style={styles.safetyScore}>
    Safety Score: {route.safetyScore}/100
  </Text>
)}

{route.reasons?.length > 0 && (
  <View style={styles.reasonContainer}>
    {route.reasons
      .slice(0, 2)
      .map(
        (
          reason: string,
          index: number
        ) => (
          <Text
            key={index}
            style={styles.reasonText}
          >
            ✓ {reason}
          </Text>
        )
      )}
  </View>
)}

      {leg && (
        <>
          <Text style={styles.info}>
            📍 Distance: {leg.distance?.text}
          </Text>

          <Text style={styles.info}>
            ⏱ Duration: {leg.duration?.text}
          </Text>
        </>
      )}

     {/*
<TouchableOpacity
  style={styles.button}
  onPress={onSelect}
>
  <Text style={styles.buttonText}>
    Select Route
  </Text>
</TouchableOpacity>
*/}
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
  },

  summary: {
    color: "#6B7280",
    marginBottom: 10,
  },

  info: {
    color: "#374151",
    marginBottom: 4,
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

  button: {
    marginTop: 12,
    backgroundColor: "#1976D2",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "700",
  },
  selectedCard: {
    borderColor: "#1976D2",
    borderWidth: 2,
    backgroundColor: "#F0F7FF",
  },
  safetyScore: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: "700",
    color: "#1976D2",
  },
  
  reasonContainer: {
    marginBottom: 10,
  },
  
  reasonText: {
    color: "#4B5563",
    fontSize: 12,
    marginBottom: 2,
  },
});