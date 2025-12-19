import React from "react";
import { View, Modal, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import LottieView from "lottie-react-native";
import AppText from "@/components/AppText"; // Your text component
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function DeliverySuccessModal({ visible, earnings, distance, duration, onHomePress }) {
  
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        
        {/* Main Card */}
        <View style={styles.card}>
          
          {/* 1. Celebration Animation */}
          <View style={styles.lottieContainer}>
            <LottieView
              source={require("@/assets/Delivery-Success.json")} // ✅ Add a confetti JSON here
              autoPlay
              loop={false}
              style={{ width: 150, height: 150 }}
            />
          </View>
          <View style={{ position: "absolute" }}>
            <LottieView
              source={require("@/assets/Confetti.json")} // ✅ Add a confetti JSON here
              autoPlay
              loop={true}
              style={{ width: 200, height: 200 }}
            />
          </View>

          {/* 2. Success Title */}
          <AppText variant="small" style={styles.title}>Delivery Completed!</AppText>
          <AppText variant="small" style={styles.subtitle}>Great job! You delivered a smile.</AppText>

          {/* 3. The "Hero" Earnings Box */}
          <View style={styles.rewardBox}>
            <AppText variant="small" style={styles.rewardLabel}>YOU EARNED</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -10 }}>
                <MaterialIcons name="currency-rupee" size={32} color="#16A34A" />
                <AppText variant="small" style={styles.earningsText}>{earnings}</AppText>
            </View>
            <View style={styles.pill}>
                <AppText variant="small" style={styles.pillText}>+ ₹10 Bonus included</AppText>
            </View>
          </View>

          {/* 4. Trip Stats (Swiggy Style) */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <Ionicons name="time-outline" size={20} color="#64748b" />
                <AppText style={styles.statValue}>{duration || "25"} min</AppText>
                <AppText style={styles.statLabel}>Time</AppText>
            </View>
            <View style={styles.verticalLine} />
            <View style={styles.statItem}>
                <Ionicons name="speedometer-outline" size={20} color="#64748b" />
                <AppText style={styles.statValue}>{distance || "4.2"} km</AppText>
                <AppText style={styles.statLabel}>Distance</AppText>
            </View>
          </View>

          {/* 5. Primary Action Button */}
          <TouchableOpacity style={styles.homeBtn} onPress={onHomePress}>
            <AppText style={styles.btnText}>Find Next Order</AppText>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{marginLeft: 8}}/>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#16A34A", // Green Background for full immersion
    justifyContent: "flex-end", // Slide up from bottom
  },
  card: {
    backgroundColor: "#fff",
    height: "85%", // Covers most of screen
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
    padding: 24,
    elevation: 20,
  },
  lottieContainer: {
    position: "relative",
    marginTop: -80, // Pulls animation up out of the card
    backgroundColor: "#fff",
    borderRadius: 100,
    padding: 5,
    elevation: 10,
    marginBottom: 20,
  },
  title: {marginTop: 30, fontSize: 27, color: "#0f172a", marginBottom: 2 },
  subtitle: {fontSize: 15, color: "#64748b", textAlign: "center", marginBottom: 30 },
  
  rewardBox: {
    width: "100%",
    backgroundColor: "#f0fdf4", // Light green bg
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  rewardLabel: { color: "#16A34A", letterSpacing: 1 },
  earningsText: { fontSize: 48, color: "#0f172a" },
  pill: { backgroundColor: "#16A34A", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 , top: -5 },
  pillText: { color: "#fff", fontSize: 10 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 40,
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 18, color: "#0f172a" },
  statLabel: { fontSize: 12, color: "#94a3b8", marginTop: -5 },
  verticalLine: { width: 1, height: "80%", backgroundColor: "#e2e8f0" },

  homeBtn: {
    width: "100%",
    backgroundColor: "#0f172a",
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  btnText: { color: "#fff", fontSize: 18 },
});