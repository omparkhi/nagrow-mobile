import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardMetricsRow() {
  
  const metrics = [
    {
      id: "1",
      title: "Live Orders",
      value: "3",
      desc: "Running right now",
      icon: "fast-food-outline",
      color: "#ff3d67"
    },
    {
      id: "2",
      title: "Today Revenue",
      value: "₹4350",
      desc: "Updated 2 mins ago",
      icon: "cash-outline",
      color: "#00a86b"
    },
    {
      id: "3",
      title: "Weekly",
      value: "₹22.4K",
      desc: "Tap to view chart",
      icon: "trending-up-outline",
      color: "#007bff"
    },
    {
      id: "4",
      title: "Rating",
      value: "4.2 ⭐",
      desc: "321 reviews",
      icon: "star",
      color: "#ffb300"
    }
  ];

  return (
    <View style={{ marginTop: 10 }}>
      <FlatList
        data={metrics}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.headerRow}>
              <Ionicons name={item.icon} size={22} color={item.color} />
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    width: 170,
    padding: 14,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginTop: 4,
  },
  desc: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },
});
