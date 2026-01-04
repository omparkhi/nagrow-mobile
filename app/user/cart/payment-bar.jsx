import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CreditCard, Smartphone, Wallet, BadgeIndianRupee } from "lucide-react-native";
import AppText from "@/components/AppText";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "@/app/TouchableOpacity";

export default function PaymentBar({ method, onPayOnline, onPayCOD, grandTotal }) {
  return (
    <LinearGradient
        colors={['#d8f8d8ff', 'rgba(255,255,255,0)']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 0.95, y: 0 }}
        style={styles.container}>
      <View >
        <AppText variant="small" style={{ fontSize: 20, color: "#202020ff" }}> ₹ {grandTotal}</AppText>
        <AppText variant="small" style={styles.text}>{method === "cod" ? "pay on Delivery" : "Pay via online" }</AppText>
      </View>

      {/* BUTTONS */}
      <View style={styles.buttonWrapper}>
        {method === "online" ? (
          <TouchableOpacity style={styles.payButton} onPress={onPayOnline}>
            <AppText variant="small" style={styles.payText}>Proceed To Pay</AppText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.payButton} onPress={onPayCOD}>
            <AppText variant="small" style={styles.payText}>Place COD Order</AppText>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // width: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#7c7c7cff"
  },
  text: {
    fontSize: 12,
    color: "#5e5e5eff", 
    marginTop: -4, 
    marginLeft: 7,
    textTransform: "uppercase",
  },
//   buttonWrapper: {
//     marginTop: 18,
//   },
  payButton: {
    backgroundColor: "#01a322ff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  payText: {
    color: "#fff",
    fontSize: 15,
  },
});
