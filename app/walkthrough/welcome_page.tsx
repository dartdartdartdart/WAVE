import { Roboto_700Bold, useFonts } from "@expo-google-fonts/roboto";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import MainLogo from "../MainLogo";

export default function WelcomePage() {
  const [fontsLoaded] = useFonts({
    Roboto_700Bold,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/walkthrough/walkthrough1");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  
  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <MainLogo />

        <Text style={styles.appName}>
        W.A.V.E
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1EA",
  },

  logoWrapper: {
    position: "absolute",
    top: 240,
    left: 45,
    alignItems: "center",
  },

  appName: {
    marginTop: 12,
    fontSize: 32,
    fontFamily: "Roboto_700Bold",
    color: "#2F4A3E",
    letterSpacing: 4,
  },
}

);