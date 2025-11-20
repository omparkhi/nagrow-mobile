import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Map iOS-style names to MaterialIcons equivalents
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
};

export function IconSymbol({ name, size = 24, color = "#000", style }) {
  const iconName = MAPPING[name] || "help-outline"; // fallback if not mapped

  return <MaterialIcons name={iconName} size={size} color={color} style={style} />;
}
