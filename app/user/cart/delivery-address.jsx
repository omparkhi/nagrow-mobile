import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { Home, MapPinPlus } from "lucide-react-native";
import AppText from "@/components/AppText";

export default function DeliveryAddress({ selectedAddress }) {
  return (
    <View style={styles.container}>
      <AppText variant="small" style={styles.heading}>YOUR DELIVERY ADDRESS</AppText>

      <TouchableOpacity style={styles.addressRow}>
        <Home size={20} color="#ff5733" />

        <View style={styles.addressTextWrapper}>
          <AppText variant="small" style={styles.addressText} numberOfLines={2}>
            {selectedAddress.formattedAddress}
          </AppText>
        </View>
      </TouchableOpacity>

      <View style={styles.changeRow}>
        <MapPinPlus size={20} strokeWidth={1.5} color="#ff5733" />
        <AppText variant="small" style={styles.changeText}>Change delivery address</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  heading: {
    fontSize: 13,
    color: "#6b6b6b",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  addressTextWrapper: {
    marginLeft: 12,
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: "#222",
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    marginTop: 10,
    paddingTop: 10,
  },
  changeText: {
    fontSize: 14,
    color: "#121212",
    marginLeft: 8,
  },
  errorText: {
    color: "red",
    padding: 10,
  },
  noAddress: {
    padding: 10,
    fontSize: 14,
    color: "#333",
  },
  loadingText: {
    marginTop: 6,
    color: "#555",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
});
