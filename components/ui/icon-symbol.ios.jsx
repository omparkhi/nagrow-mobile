import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // or any icon set you prefer

export function IconSymbol({ name, size = 24, color = "#000", style, weight = "regular" }) {
  // The "weight" prop won’t matter here unless you choose icons that support it
  return (
    <View style={[styles.iconContainer, { width: size, height: size }, style]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
