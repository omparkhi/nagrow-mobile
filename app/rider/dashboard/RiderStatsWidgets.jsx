import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "@/components/AppText";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

export default function StatsGrid({ orders, hours, rating }) {
  return (
    <View style={styles.gridContainer}>
      {/* CARD 1: ORDERS */}
      <View style={styles.statCard}>
        <View style={[styles.iconBox, { backgroundColor: "#e0f2fe" }]}>
          <MaterialCommunityIcons name="bike-fast" size={22} color="#0284c7" />
        </View>
        <View>
            <AppText variant="small" style={styles.statLabel}>Orders</AppText>
            <AppText style={styles.statValue}>{orders || 0}</AppText>
        </View>
      </View>

      {/* CARD 2: LOGIN HOURS */}
      <View style={styles.statCard}>
        <View style={[styles.iconBox, { backgroundColor: "#f3e8ff" }]}>
          <Ionicons name="time" size={22} color="#9333ea" />
        </View>
        <View>
            <AppText variant="small" style={styles.statLabel}>Login Hrs</AppText>
            <AppText style={styles.statValue}>{hours || "0h"}</AppText>
        </View>
      </View>

      {/* CARD 3: RATING */}
      <View style={styles.statCard}>
        <View style={[styles.iconBox, { backgroundColor: "#dcfce7" }]}>
          <Ionicons name="star" size={20} color="#16a34a" />
        </View>
        <View>
            <AppText variant="small" style={styles.statLabel}>Rating</AppText>
            <AppText style={styles.statValue}>{rating || "4.9"}</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    flexDirection: "row", // Horizontal layout inside card
    alignItems: "center",
    gap: 10
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: { color: "#64748b", fontSize: 11 },
  statValue: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
});