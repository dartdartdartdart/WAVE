import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { liveSharingSupabase }
  from "../../../lib/liveSharingSupabase";

  type Props = {
    isLiveSharing: boolean;
  
    setIsLiveSharing:
      React.Dispatch<
        React.SetStateAction<boolean>
      >;
  
    shareCode: string;
  
    setShareCode:
      React.Dispatch<
        React.SetStateAction<string>
      >;
  
    liveSessionId: string | null;
  
    setLiveSessionId:
      React.Dispatch<
        React.SetStateAction<
          string | null
        >
      >;
  
    destination: {
      latitude: number;
      longitude: number;
    } | null;
  
    selectedRoute: any;
  };
export default function LiveSharing({
    isLiveSharing,
    setIsLiveSharing,
  
    shareCode,
    setShareCode,
  
    liveSessionId,
    setLiveSessionId,
  
    destination,
    selectedRoute,
  }: Props) { 


   
  const generateShareCode = () => {
    return Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
  };

  const startLiveSharing = async () => {
    try {
      const code =
        generateShareCode();

      const encodedPolyline =
        selectedRoute?.routeData
          ?.overview_polyline?.points ??
        null;

      const { data, error } =
        await liveSharingSupabase
          .from("live_sessions")
          .insert({
            share_code: code,

            destination_lat:
              destination?.latitude,

            destination_lng:
              destination?.longitude,

            encoded_polyline:
              encodedPolyline,

            active: true,
          })
          .select()
          .single();

      if (error) {
        console.log(
          "LIVE SESSION ERROR:",
          error
        );

        return;
      }

      console.log(
        "LIVE SESSION CREATED:",
        data
      );

      setShareCode(code);

      setLiveSessionId(data.id);

      setIsLiveSharing(true);

    } catch (err) {
      console.log(
        "LIVE SHARE CRASH:",
        err
      );
    }
  };

  const stopLiveSharing = async () => {
    try {
        if (!liveSessionId) {
        setIsLiveSharing(false);
        return;
      }

      const { error } =
        await liveSharingSupabase
          .from("live_sessions")
          .update({
            active: false,
          })
          .eq("id", liveSessionId);

      if (error) {
        console.log(
          "STOP SHARE ERROR:",
          error
        );
      }

      setShareCode("");

      setLiveSessionId(null);

      setIsLiveSharing(false);

      console.log(
        "LIVE SESSION CLOSED"
      );

    } catch (err) {
      console.log(
        "STOP SHARE CRASH:",
        err
      );
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (!isLiveSharing) {
            startLiveSharing();
          } else {
            stopLiveSharing();
          }
        }}
      >
        <Text style={styles.buttonText}>
          {isLiveSharing
            ? "🟢 Live Share ON"
            : "🔴 Live Share OFF"}
        </Text>
      </TouchableOpacity>

      {isLiveSharing &&
        shareCode !== "" && (
          <Text style={styles.code}>
            Share Code: {shareCode}
          </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,

    paddingVertical: 12,

    borderRadius: 12,

    alignItems: "center",

    backgroundColor: "#F3F4F6",

    borderWidth: 1,

    borderColor: "#E5E7EB",
  },

  buttonText: {
    fontSize: 15,

    fontWeight: "700",

    color: "#374151",
  },

  code: {
    marginTop: 10,

    textAlign: "center",

    fontWeight: "700",

    color: "#1976D2",
  },
});