import React from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import AppText from "@/components/AppText";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "@/app/TouchableOpacity";

const { width } = Dimensions.get("window");

export default function NoLiveOrder() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      {/* 1. Illustration Area */}
      <View style={styles.illustrationContainer}>
        <Image 
          // You can use a local asset here like require('@/assets/no-orders.png')
          // Using a high-quality CDN image for the demo (Relaxing/Empty State)
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/11329/11329060.png" }} 
          style={styles.image}
        />
        <View style={styles.blob} />
      </View>

      {/* 2. Text Content */}
      <View style={styles.content}>
        <AppText variant="h2" style={styles.title}>No live orders</AppText>
        <AppText variant="small" style={styles.subtitle}>
          You don't have any ongoing orders at the moment. cravings kicking in?
        </AppText>
      </View>

      {/* 3. Action Buttons */}
      <View style={styles.actions}>
        
        {/* Primary: Go to Home */}
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={() => router.replace("/user/dashboard/dash")}
          activeOpacity={0.8}
        >
          <AppText variant="small" style={styles.primaryText}>Browse Food</AppText>
          <MaterialIcons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Secondary: View History */}
        <TouchableOpacity 
          style={styles.secondaryBtn}
          onPress={() => router.push("/user/order/reorder-page")} // Points to your History/Orders tab
          activeOpacity={0.6}
        >
          <Ionicons name="receipt-outline" size={18} color="#64748b" />
          <AppText variant="small" style={styles.secondaryText}>View Past Orders</AppText>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  
  // Illustration
  illustrationContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  image: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: "contain",
    zIndex: 2,
  },
  blob: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: "#fff7ed", // Very light orange bg
    borderRadius: width, // Circle
    bottom: -20,
    zIndex: 1,
  },

  // Content
  content: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    color: "#1e293b",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: "80%",
  },

  // Buttons
  actions: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  primaryBtn: {
    backgroundColor: "#fd731dff", // Your App Theme Orange
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 4,
    shadowColor: "#fd731dff",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryText: {
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
  },
  secondaryText: {
    color: "#64748b",
    fontSize: 15,
  },
});