import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "@/components/AppText";

export default function ActiveOrders({ activeOrders = [] }) {
  if (!activeOrders.length) {
    return (
      <View
        style={{
          padding: 12,
          borderRadius: 16,
          marginTop: 10,
          backgroundColor: "white",
          marginHorizontal: 16,
        }}
      >
        <AppText style={{ fontSize: 18, marginBottom: 8 }}>
          ACTIVE ORDERS
        </AppText>
        <AppText variant="small" style={{ color: "#666" }}>No active orders</AppText>
      </View>
    );
  }

  return (
    <View
      style={{
        padding: 12,
        borderRadius: 16,
        marginTop: 10,
        backgroundColor: "white",
        marginHorizontal: 16,
      }}
    >
      <AppText style={{ fontSize: 18, marginBottom: 12 }}>
        ACTIVE ORDERS
      </AppText>

      {activeOrders.map((o) => (
        <TouchableOpacity
          key={o._id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginVertical: 6,
          }}
        >
          <AppText variant="small" style={{ fontSize: 14, color: "#5b5959ff" }}>
            Order #{o.orderId}
          </AppText>

          <AppText variant="small" style={{ fontSize: 14, color: "#5b5959ff" }}>
            {o.status}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
}
