import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  recommendedRoute: any;
};

export default function RecommendedRoute({
  recommendedRoute,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.badge}>
        🏆 Recommended Route
      </Text>

      <Text style={styles.routeName}>
        {recommendedRoute.summary}
      </Text>

      <Text style={styles.routeRisk}>
        Risk Level: {recommendedRoute.risk}
      </Text>

      {recommendedRoute.safetyScore !== undefined && (
        <Text style={styles.safetyScore}>
          Safety Score:{" "}
          {recommendedRoute.safetyScore}/100
        </Text>
      )}

      {recommendedRoute.reasons?.length > 0 && (
        <View style={styles.reasonBox}>
          <Text style={styles.reasonTitle}>
            Why this route?
          </Text>

          {recommendedRoute.reasons.map(
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
    </View>
  );

  
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },

  badge: {
    color: "#D97706",
    fontWeight: "700",
    marginBottom: 10,
  },

  routeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  routeRisk: {
    color: "#6B7280",
  },

  safetyScore: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#1976D2",
  },

  reasonBox: {
    marginTop: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  reasonTitle: {
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  reasonText: {
    color: "#4B5563",
    marginBottom: 4,
    fontSize: 13,
  },
});