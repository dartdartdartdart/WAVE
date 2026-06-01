import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";

export default function MainLogo() {
  return (
    <View style={styles.container}>
      <Svg width="260" height="260" viewBox="0 0 260 260">
        <Defs>
          {/* Gradients remain exactly identical */}
          <LinearGradient
            id="cyanGrad"
            x1="-80"
            y1="0"
            x2="80"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#8EF0E6" />
            <Stop offset="100%" stopColor="#5AA8FF" />
          </LinearGradient>

          <LinearGradient
            id="purpleGrad"
            x1="0"
            y1="-80"
            x2="0"
            y2="80"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#6D5BFF" />
            <Stop offset="100%" stopColor="#4A22FF" />
          </LinearGradient>

          {/* Shadows are perfectly mapped to respect the 3px gaps. 
            The gradients start mathematically inside the empty gap space 
            so that they hit the ribbons at the correct attenuated opacity.
          */}
          <LinearGradient
            id="shadowTop"
            x1="0"
            y1="-40"
            x2="0"
            y2="-16"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </LinearGradient>

          <LinearGradient
            id="shadowBottom"
            x1="0"
            y1="40"
            x2="0"
            y2="16"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <G transform="translate(130, 130) rotate(45)">
          
          {/* ==========================================
              GROUP 1: PURPLE RIBBON (TOP & RIGHT)
              ========================================== */}
          <G id="purple-ribbon">
            {/* This arm controls the Top and Right.
              At the Bottom-Right intersection, it now ends cleanly at y = 37,
              leaving a precise 3-pixel gap before the Cyan ribbon begins.
            */}
            <Path
              d="
                M -80, -40
                A 40 40 0 0 1 -40, -80
                L 40, -80
                A 40 40 0 0 1 80, -40
                L 80, 37
                L 40, 37
                L 40, -40
                L -80, -40
                Z
              "
              fill="url(#purpleGrad)"
            />
            
            {/* Shadow cast upward by the Cyan ribbon onto the bottom of the Purple ribbon.
              It belongs in this group so it animates with the Purple ribbon later.
            */}
            <Rect x="40" y="16" width="40" height="21" fill="url(#shadowBottom)" />
          </G>

          {/* ==========================================
              GROUP 2: CYAN RIBBON (BOTTOM & LEFT)
              ========================================== */}
          <G id="cyan-ribbon">
            {/* This arm controls the Bottom and Left.
              At the Top-Left intersection, it now starts cleanly at y = -37,
              leaving a precise 3-pixel gap below the Purple ribbon.
            */}
            <Path
              d="
                M -80, -37
                L -80, 40
                A 40 40 0 0 0 -40, 80
                L 40, 80
                A 40 40 0 0 0 80, 40
                L 40, 40
                L -40, 40
                L -40, -37
                Z
              "
              fill="url(#cyanGrad)"
            />

            {/* Shadow cast downward by the Purple ribbon onto the top of the Cyan ribbon.
              It belongs in this group so it animates with the Cyan ribbon later.
            */}
            <Rect x="-80" y="-37" width="40" height="21" fill="url(#shadowTop)" />
          </G>

        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});