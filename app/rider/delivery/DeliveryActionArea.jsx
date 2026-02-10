import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import SlideToAct from "../slide-button";

export default function DeliveryActionArea({ status, loading, onUpdateStatus, orderNo, onVerifyPress, isVerifyPage=false }) {
    if (loading) {
    return (
      <View style={styles.loadingContainer}>
         <ActivityIndicator size="large" color="#000" />
         <AppText variant="small" style={{ marginTop: 5, color: "#666" }}>Updating...</AppText>
      </View>
    );
  } 

    if (status === "ready") {
      if (!isVerifyPage) {
        return (
          <TouchableOpacity style={styles.verifyBtn} onPress={onVerifyPress}>
            <AppText style={styles.verifyBtnText}>Verify Order</AppText>
          </TouchableOpacity>
        );
      }

      return (
        <SlideToAct 
          label="Slide to Pick Up"
          onComplete={() => onUpdateStatus("pick_up_by_rider")}
        />
      );
    }
  
    if (status === "pick_up_by_rider") {
      return (
        <SlideToAct 
          label="Slide to Start Delivery"
          onComplete={() => onUpdateStatus("on the way")}
        />
      );
    }
  
    if (status === "on the way") {
      return (
        <SlideToAct 
          label="Slide to Mark Delivered"
          onComplete={() => onUpdateStatus("delivered")}
        />
      );
    }

    return null;
}

const styles = StyleSheet.create({
    loadingContainer: {
        height: 60, // Match your SlideToAct height
        width: "100%", // Match slider width behavior
        backgroundColor: "#ffffff",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        elevation: 6, // Match slider shadow
        shadowOpacity: 0.1,
        flexDirection: "row", // Optional: if you want text next to loader
        gap: 10
    },

    // New Styles for the Verify Button
  verifyBtn: {
    width: "100%",
    backgroundColor: "#16A34A", // Green color
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 5
  },
  verifyBtnText: {
    color: "#fff",
    fontSize: 18
  }
})