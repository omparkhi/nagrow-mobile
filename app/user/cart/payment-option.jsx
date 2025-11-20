import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CreditCard, Smartphone, Wallet, BadgeIndianRupee } from "lucide-react-native";
import AppText from "@/components/AppText";

export default function PaymentOptions({ method, setMethod, onPayOnline, onPayCOD }) {
  return (
    <View style={styles.container}>
      <AppText variant="small" style={styles.heading}>SELECT PAYMENT OPTIONS</AppText>

      {/* ONLINE PAYMENT */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => setMethod("online")}
      >
        <View style={styles.leftIconBoxBlue}>
          <CreditCard size={18} color="#fff" />
        </View>

        <View style={styles.labelContainer}>
          <View style={styles.labelRow}>
            <AppText variant="small" style={styles.label}>Online</AppText>

            <Smartphone size={22} color="#7e3af2" />
            <AppText variant="small" style={styles.separator}>/</AppText>
            <Wallet size={22} color="#4f46e5" />
            <AppText variant="small" style={styles.separator}>/</AppText>
            <CreditCard size={22} color="#16a34a" />
          </View>
        </View>

        <TouchableOpacity onPress={() => setMethod("online")}>
          <View style={[styles.radioOuter, method === "online" && styles.radioOuterActive]}>
            {method === "online" && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* CASH ON DELIVERY */}
      <TouchableOpacity
        style={[styles.row, styles.borderTop]}
        onPress={() => setMethod("cod")}
      >
        <View style={styles.leftIconBox}>
          <BadgeIndianRupee size={25} color="#16a34a" />
        </View>

        <View style={styles.labelContainer}>
          <AppText variant="small" style={styles.label}>Cash on Delivery</AppText>
        </View>

        <TouchableOpacity onPress={() => setMethod("cod")}>
          <View style={[styles.radioOuter, method === "cod" && styles.radioOuterActive]}>
            {method === "cod" && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* BUTTONS */}
      <View style={styles.buttonWrapper}>
        {method === "online" ? (
          <TouchableOpacity style={styles.payButton} onPress={onPayOnline}>
            <AppText variant="small" style={styles.payText}>Pay Online</AppText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.payButton} onPress={onPayCOD}>
            <AppText variant="small" style={styles.payText}>Place COD Order</AppText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  heading: {
    fontSize: 13,
    color: "#6b6b6b",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 12,
  },
  leftIconBox: {
    padding: 4,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  leftIconBoxBlue: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  labelContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: "#121212",
  },
  separator: {
    fontSize: 16,
    color: "#444",
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: {
    borderColor: "#16a34a",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#16a34a",
  },
  buttonWrapper: {
    marginTop: 18,
  },
  payButton: {
    backgroundColor: "#ff5733",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  payText: {
    color: "#fff",
    fontSize: 15,
  },
});
