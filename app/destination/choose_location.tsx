import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import * as Location from "expo-location";
import { router } from "expo-router";

export default function ChooseLocation() {
  const [destination, setDestination] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [places, setPlaces] = useState<any[]>([]);



 


  const handleCurrentLocation = async () => {
    alert("Function Started");
  
    try {
      alert("Requesting Permission");
  
      const { status } =
        await Location.requestForegroundPermissionsAsync();
  
      alert(`Permission Status: ${status}`);
  
      if (status !== "granted") {
        alert("Location permission denied");
        return;
      }
  
      alert("Getting Location");
  
      const location =
        await Location.getCurrentPositionAsync();
  
      alert("Location Retrieved");
  
      console.log(location);
  
      const coords =
      `${location.coords.latitude}, ${location.coords.longitude}`;
    
    setCurrentLocation(coords);
    setDestination("Current GPS Location");
  
    } catch (error) {
      console.log(error);
      alert(`Error: ${JSON.stringify(error)}`);
    }
  };
  const handleSearch = async (text: string) => {
    setDestination(text);
  
    if (text.length < 3) {
      setPlaces([]);
      return;
    }
  
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": "AIzaSyAw_KSanfyBRyW8h7RGJa28catfm0xPcrM",
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress",
        },
        body: JSON.stringify({
          textQuery: text,
        }),
      }
    );
  
    const data = await response.json();
  
    setPlaces(data.places || []);
  };
  
  
  const handleAnalyzeRoute = () => {
    if (!destination.trim()) return;

    console.log("Destination:", destination);

    router.push("/loading/loading");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Choose Destination</Text>

          <Text style={styles.description}>
            Select a destination to analyze flood
            conditions and generate the safest route.
          </Text>
        </View>

        <TouchableOpacity
  style={styles.locationButton}
  onPress={handleCurrentLocation}
>
  <Text style={styles.locationButtonText}>
    📍 Use Current Location
  </Text>
</TouchableOpacity>

        {currentLocation !== "" && (
  <View style={styles.selectedContainer}>
    <Text style={styles.selectedLabel}>
      Current Coordinates
    </Text>

    <Text style={styles.selectedText}>
      {currentLocation}
    </Text>
  </View>
)}

        <TextInput
          style={styles.input}
          placeholder="Search destination..."
          placeholderTextColor="#999"
          value={destination}
          onChangeText={handleSearch}
        />

        <Text style={styles.sectionTitle}>
          Suggested Locations
        </Text>

        <View style={styles.suggestionsContainer}>
  {places.map((place, index) => (
    <TouchableOpacity
      key={index}
      style={styles.locationCard}
      onPress={() => {
        setDestination(place.displayName.text);
        setPlaces([]);
      }}
    >
      <Text style={styles.locationTitle}>
        {place.displayName.text}
      </Text>

      <Text style={styles.locationSubtitle}>
        {place.formattedAddress}
      </Text>
    </TouchableOpacity>
  ))}
</View>

        {destination !== "" && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedLabel}>
              Selected Destination
            </Text>

            <Text style={styles.selectedText}>
              {destination}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.analyzeButton,
            !destination && styles.disabledButton,
          ]}
          disabled={!destination}
          onPress={handleAnalyzeRoute}
        >
          <Text style={styles.analyzeButtonText}>
            Analyze Route
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1EA",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  header: {
    marginTop: 10,
    marginBottom: 25,
  },

  title: {
    fontSize: 30,
    textAlign: "center",
    fontFamily: "Roboto_700Bold",
    color: "#2F4A3E",
    marginBottom: 10,
  },

  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
    fontFamily: "Roboto_400Regular",
  },

  locationButton: {
    borderWidth: 2,
    borderColor: "#8EF0E6",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 18,
  },

  locationButtonText: {
    color: "#0F3D4C",
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 18,
    color: "#2F4A3E",
    fontFamily: "Roboto_700Bold",
    marginBottom: 14,
  },

  suggestionsContainer: {
    gap: 12,
  },

  locationCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },

  locationTitle: {
    fontSize: 16,
    color: "#2F4A3E",
    fontFamily: "Roboto_700Bold",
    marginBottom: 4,
  },

  locationSubtitle: {
    fontSize: 13,
    color: "#888",
    fontFamily: "Roboto_400Regular",
  },

  selectedContainer: {
    marginTop: 25,
    backgroundColor: "#DFFBF7",
    borderRadius: 16,
    padding: 16,
  },

  selectedLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },

  selectedText: {
    fontSize: 17,
    color: "#0F3D4C",
    fontFamily: "Roboto_700Bold",
  },

  analyzeButton: {
    marginTop: 25,
    backgroundColor: "#5AA8FF",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.4,
  },

  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
  },
});