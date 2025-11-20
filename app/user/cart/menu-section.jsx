import React from "react";
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AppText from "@/components/AppText";
import { CookingPotIcon, PenIcon, PenLine, PenBoxIcon } from "lucide-react-native";

export default function MenuSection({ items, increment, decrement, handleAddItem, restaurantId }) {
    const router = useRouter();
  const renderItem = ({ item }) => (
    <View style={styles.row}>
      {item.image && (
        <View style={styles.rowLeft}>
          <View style={styles.dot} />
          <Image source={{ uri: item.image }} style={styles.image} />
        </View>
      )}

      <View style={styles.flex1}>
        <AppText variant="small" style={styles.name}>{item.name}</AppText>
      </View>

      <View style={styles.qtyContainer}>
        <View style={styles.counterBox}>
          <TouchableOpacity onPress={() => decrement(item.id)}>
            <AppText style={styles.btn}>−</AppText>
          </TouchableOpacity>

          <AppText style={styles.qtyText}>{item.quantity}</AppText>

          <TouchableOpacity onPress={() => increment(item.id)}>
            <AppText style={styles.btn}>+</AppText>
          </TouchableOpacity>
        </View>

        <AppText style={styles.price}>₹{item.price * item.quantity}</AppText>
      </View>
    </View>
  );



  return (
    <View style={styles.wrapper}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`user/restaurant/${restaurantId}`)}>
          <AppText variant="small" style={styles.actionText}>+ Add Items</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <AppText variant="small" style={styles.actionText}><PenLine size={10} /> Cooking requests</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginTop: 12,
    paddingVertical: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  dot: {
    width: 10,
    height: 10,
    backgroundColor: "green",
    borderRadius: 3,
  },

  image: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },

  flex1: {
    flex: 1,
    marginLeft: 10,
  },

  name: {
    fontSize: 14,
    color: "#333",
  },

  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  counterBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },

  btn: {
    fontSize: 14,
    color: "green",
    paddingHorizontal: 6,
  },

  qtyText: {
    fontSize: 12,
    color: "#444",
    paddingHorizontal: 4,
  },

  price: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },

  actionRow: {
    marginTop: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    gap: 12,
  },

  actionBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  actionText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
});