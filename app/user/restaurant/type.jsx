import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "@/components/AppText";
import { Leaf, Drumstick, UtensilsCrossed } from "lucide-react-native";

export default function RestaurantDietBadge({ type }) {
    const dietType = type?.toLowerCase();
    let config;


    if (dietType === "veg" || dietType === "pure veg") {
        config = {
            label: "Pure Veg",
            icon: <Leaf size={14} color="#059669" strokeWidth={2.5} />, // Emerald Green
            bgColor: "#ecfdf5", // Very Light Green
            textColor: "#047857", // Deep Green
            borderColor: "#a7f3d0",
        };
    } else {
            config = {
            label: "Veg & Non-Veg",
            icon: <UtensilsCrossed size={14} color="#b91c1c" strokeWidth={2.5} />,
            bgColor: "#fef2f2", // Light Gray (Neutral)
            textColor: "#b91c1c", // Dark Gray
            borderColor: "#fecaca",
        };
    }

    return (
        <View style={[styles.badge, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
            {config.icon}
            <AppText style={[styles.text, { color: config.textColor }]}>
                {config.label}
            </AppText>
        </View>
    )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start", // Shrinks to fit content
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4, // Spacing between icon and text
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase", // Makes it look premium
  },
});