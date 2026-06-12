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
        Risk Level:{" "}
        {recommendedRoute.risk}
      </Text>
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
});