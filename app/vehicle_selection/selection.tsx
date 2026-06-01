import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

export default function HomeScreen() {
  const vehicles = [
    "Sedan",
    "SUV",
    "Truck",
    "Motorcycle",
    "Van",
    "Bus",
    "Pedestrian",
    "Other",
  ];

  const [selectedVehicle, setSelectedVehicle] =
    useState("Select Vehicle");

  const [isOpen, setIsOpen] = useState(false);

  const [customVehicle, setCustomVehicle] =
    useState("");

    const handleContinue = () => {
      const vehicle =
        selectedVehicle === "Other"
          ? customVehicle
          : selectedVehicle;
    
      console.log("Selected Vehicle:", vehicle);
    
      router.push("/destination/choose_location");
    };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Choose Your Vehicle
        </Text>

        <Text style={styles.subtitle}>
          Select your vehicle type to calculate
          safe routes based on flood depth limits.
        </Text>

        {/* Dropdown Button */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsOpen(!isOpen)}
        >
          <Text style={styles.dropdownText}>
            {selectedVehicle}
          </Text>

          <Text style={styles.arrow}>
            {isOpen ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        
        {isOpen && (
          <View style={styles.dropdownMenu}>
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle}
                style={styles.option}
                onPress={() => {
                  setSelectedVehicle(vehicle);
                  setIsOpen(false);
                }}
              >
                <Text style={styles.optionText}>
                  {vehicle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}


        {selectedVehicle === "Other" && (
          <TextInput
            style={styles.input}
            placeholder="Enter vehicle type"
            value={customVehicle}
            onChangeText={setCustomVehicle}
          />
        )}

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1EA",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 30,
    textAlign: "center",
    fontFamily: "Roboto_700Bold",
    color: "#2F4A3E",
    marginBottom: 12,
  },

  subtitle: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    fontFamily: "Roboto_400Regular",
    marginBottom: 30,
  },

  dropdownButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#8EF0E6",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dropdownText: {
    fontSize: 16,
    color: "#2F4A3E",
    fontFamily: "Roboto_400Regular",
  },

  arrow: {
    fontSize: 16,
    color: "#5AA8FF",
  },

  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 10,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#D9F7F4",
  },

  option: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  optionText: {
    fontSize: 16,
    color: "#2F4A3E",
    fontFamily: "Roboto_400Regular",
  },

  input: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#8EF0E6",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },

  continueButton: {
    marginTop: 30,
    backgroundColor: "#5AA8FF",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
  },
});