import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  selectedMarker: any;
};

export default function SensorInfoCard({
  selectedMarker,
}: Props) {
  const getRiskColor = (risk: string) => {
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

  return (
    <View style={styles.infoCard}>
      {selectedMarker ? (
        <>
          <View style={styles.header}>
            <Text style={styles.routeTitle}>
              {selectedMarker.title}
            </Text>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor: getRiskColor(
                    selectedMarker.risk_tier
                  ),
                },
              ]}
            >
              <Text style={styles.badgeText}>
                {selectedMarker.risk_tier}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Water Rise
            </Text>

            <Text style={styles.value}>
              {(
                selectedMarker.water_rise_m * 100
              ).toFixed(0)}{" "}
              cm
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Alert Level
            </Text>

            <Text style={styles.value}>
              {selectedMarker.alert_level}
            </Text>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.routeTitle}>
            W.A.V.E. Flood Monitoring
          </Text>

          <Text style={styles.emptyText}>
            Tap a sensor marker to view
            flood telemetry information.
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    position: "absolute",
    bottom: -500,
    left: 16,
    right: 16,

    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    padding: 18,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,

    elevation: 8,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  routeTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginRight: 10,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  value: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});