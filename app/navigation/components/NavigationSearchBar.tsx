import React, { useRef } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

type Props = {
  onPlaceSelected: (
    destination: {
      latitude: number;
      longitude: number;
    }
  ) => void;
};

export default function NavigationSearchBar({
  onPlaceSelected,
}: Props) {
  const searchRef = useRef<any>(null);

  return (
    <GooglePlacesAutocomplete
      ref={searchRef}
      placeholder="Where do you want to go?"
      fetchDetails={true}
      enablePoweredByContainer={false}
      keepResultsAfterBlur={false}
      keyboardShouldPersistTaps="handled"
      minLength={2}
      nearbyPlacesAPI="GooglePlacesSearch"

      onPress={(data, details = null) => {
        console.log("PLACE SELECTED");

        if (!details) return;

        const newDestination = {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
        };

        onPlaceSelected(newDestination);

        searchRef.current?.setAddressText("");
      }}

      onFail={(error) => {
        console.log("PLACES ERROR:", error);
      }}

      onNotFound={() => {
        console.log("PLACES NOT FOUND");
      }}

      textInputProps={{
        onFocus: () => {
          console.log("SEARCH FOCUSED");
        },

        onChangeText: (text: string) => {
          console.log("SEARCH TEXT:", text);
        },
      }}

      query={{
        key: "AIzaSyAw_KSanfyBRyW8h7RGJa28catfm0xPcrM",
        language: "en",
      }}
      styles={{
        container: {
          position: "absolute",
          top: 50,
          left: 16,
          right: 16,
      
         
      
          zIndex: 9999,
          elevation: 9999,
        },
      
        textInputContainer: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          borderBottomWidth: 0,
        },
      
        textInput: {
          height: 54,
          backgroundColor: "#FFFFFF",
          borderRadius: 28,
          paddingHorizontal: 20,
          fontSize: 15,
      
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 8,
        },
      
        listView: {
          marginTop: 8,
          borderRadius: 16,
          backgroundColor: "#FFFFFF",
          zIndex: 999999,
          elevation: 999999,
        },
      
        row: {
          backgroundColor: "#FFFFFF",
        },
      
        description: {
          color: "#111827",
        },
      }}
    />
  );
}