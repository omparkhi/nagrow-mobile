import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import AppText from "@/components/AppText";
import { useSelector } from "react-redux";
import Header from "../header";
import { router } from "expo-router";
export default function GetOrder() {
  const { list, loadingList } = useSelector((state) => state.orders);


  if (loadingList) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!list || list.length === 0) {
    return (
      <View
        style={{
          backgroundColor: "white",
          padding: 16,
          borderRadius: 14,
          marginHorizontal: 16,
          marginTop: 12,
        }}
      >
        <AppText style={{ fontSize: 18 }}>Orders</AppText>
        <AppText style={{ color: "#777", marginTop: 6 }}>No orders found</AppText>
      </View>
    );
  }

  const statusColor = (status) => {
    switch (status) {
      case "placed":
        return "#4169E1";
      case "accepted":
        return "#008000";
      case "preparing":
        return "#FF8C00";
      case "ready":
        return "#1E90FF";
      case "on the way":
        return "#8A2BE2";
      case "delivered":
        return "#0FA958";
      case "cancelled":
        return "#D63031";
      default:
        return "#333";
    }
  };

  return (
    <>
    <View style={{ marginHorizontal: 16, marginTop: 12 }}>
      <AppText style={{ fontSize: 18, marginBottom: 10 }}>All Orders</AppText>

      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/restaurant/order/${item._id}`)}
            style={{
              backgroundColor: "white",
              padding: 16,
              borderRadius: 14,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <AppText variant="small" >
                Order - {item.orderNo}
              </AppText>

              <View
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                  backgroundColor: statusColor(item.status),
                }}
              >
                <AppText variant="small" style={{ color: "white", fontSize: 12 }}>
                  {item.status.toUpperCase()}
                </AppText>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center",justifyContent: "space-between"}}>
              <AppText variant="small" style={{ color: "#666", fontSize: 14 }}>
              {item.items?.length} items · ₹{item.totalAmount}
            </AppText>

            <AppText style={{ marginTop: 4, color: "#999", fontSize: 13 }}>
              {new Date(item.createdAt).toLocaleString()}
            </AppText>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
    </>
  );
}
