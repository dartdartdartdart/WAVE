import React, { useEffect } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { router } from "expo-router";

export default function LoadingScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/navigation/navigation");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#5AA8FF" />

        <Text style={styles.title}>
          Analyzing Route...
        </Text>

        <Text style={styles.subtitle}>
          Checking flood reports, road safety,
          and route conditions.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1EA",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    alignItems: "center",
    paddingHorizontal: 30,
  },

  title: {
    marginTop: 20,
    fontSize: 24,
    color: "#2F4A3E",
    fontFamily: "Roboto_700Bold",
  },

  subtitle: {
    marginTop: 12,
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    lineHeight: 24,
  },
});