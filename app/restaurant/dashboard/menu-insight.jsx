import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { useRouter } from "expo-router";

const MOCK_MENU_DATA = [
  { id: "1", dish: "Paneer", orders: 42, rating: 4.5 },
  { id: "2", dish: "Veg", orders: 67, rating: 4.7 },
  { id: "3", dish: "Cold", orders: 29,  rating: 4.2 },
];

export default function PopularMenuInsights({ onAdd, onManage, data = MOCK_MENU_DATA }) {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <AppText style={styles.heading}>POPULAR ITEMS</AppText>

      <View style={styles.headerRow}>
        <AppText style={styles.colTitle}>Dish</AppText>
        <AppText style={styles.colTitle}>Orders</AppText>
        {/* <AppText style={styles.colTitle}>Revenue</AppText> */}
        <AppText style={styles.colTitle}>Rating</AppText>
        <AppText style={styles.colTitle}>Action</AppText>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <AppText style={styles.text}>{item.dish}</AppText>
            <AppText style={styles.text}>{item.orders}</AppText>
            {/* <AppText style={styles.text}>₹{item.revenue}</AppText> */}
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <AppText style={[styles.text, { marginLeft: 3 }]}>{item.rating}</AppText>
            </View>
            <TouchableOpacity style={styles.actionBtn}>
              <AppText style={{ color: "#fff", fontSize: 12 }}>Edit</AppText>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.ctaRow}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/restaurant/menu/add-menu-item")}>
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={styles.primaryText}>Add New Item</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push("/restaurant/menu/CreateAddonScreen")}>
          <MaterialIcons name="restaurant-menu" size={18} color="#ff5733" />
          <Text style={styles.secondaryText}>Manage Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push("/restaurant/menu/CreateCategoryScreen")}>
          <MaterialIcons name="restaurant-menu" size={18} color="#ff5733" />
          <Text style={styles.secondaryText}>Manage Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#ffffffff", borderRadius: 16, marginTop: 16, marginHorizontal: 16 },
  heading: { fontSize: 18, color: "#000000ff", marginBottom: 12 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  colTitle: { color: "#5b5959ff", fontSize: 13, width: "20%", textAlign: "center" },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#222",
  },
  text: { color: "#000000ff", fontSize: 13,  textAlign: "center" },
  ratingBox: { flexDirection: "row", width: "20%", justifyContent: "center", alignItems: "center" },
  actionBtn: {
    backgroundColor: "#ff5733",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    width: "20%",
    alignItems: "center",
  },
  ctaRow: { flex: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  primaryBtn: {
    backgroundColor: "#ff5733",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    // width: "48%",
    justifyContent: "center",
  },
  primaryText: { color: "#ffffffff", fontSize: 14 },
  secondaryBtn: {
    borderColor: "#ff5733",
    borderWidth: 1.6,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    // width: "48%",
    justifyContent: "center",
  },
  secondaryText: { color: "#ff5733", fontSize: 14 },
});
