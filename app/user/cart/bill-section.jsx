import React, { useState } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager, StyleSheet } from "react-native";
import { Receipt, ChevronRight } from "lucide-react-native";
import AppText from "@/components/AppText";


// Enable animation for Android
// if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

export default function BillSection({
  subtotal,
  deliveryFee,
  distanceKm,
  grandTotal,
  backendTotals,
  tip,
}) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };

  return (
    <View style={{ backgroundColor: "white", padding: 16, borderRadius: 12, marginTop: 12 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ backgroundColor: "#16A34A", padding: 4, borderRadius: 6 }}>
          <Receipt size={18} color="white" />
        </View>

        <View style={{ flex: 1, marginLeft: 12, flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <AppText variant="small" style={{  fontSize: 14 }} >
              To Pay ₹{grandTotal}
            </AppText>
            <AppText variant="small" style={{ fontSize: 12, color: "#6b7280" }}>
              incl. all taxes & charges
            </AppText>
          </View>

          <TouchableOpacity onPress={toggle}>
            <ChevronRight
              size={22}
              style={{
                transform: [{ rotate: open ? "270deg" : "90deg" }],
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Section */}
      {open && (
        <View style={{ marginTop: 16, borderTopWidth: 1, borderColor: "#0f172a", paddingTop: 10 }}>

          {/* Item Total */}
          <View style={styles.row}>
            <AppText variant="small" style={styles.label}>Item Total</AppText>
            <AppText variant="small" style={styles.value}>₹{subtotal}</AppText>
          </View>

          {/* Delivery Fee */}
          <View style={styles.row}>
            <AppText style={styles.label}>Delivery Fee | {distanceKm} kms</AppText>
            <AppText style={styles.value}>₹{deliveryFee}</AppText>
          </View>

          {/* Tip */}
          <View style={[styles.row, { marginTop: 6, borderTopWidth: 1, borderColor: "#656565ff", borderStyle: "dashed"  }]}>
            <AppText style={[styles.label, { marginTop: 10 }]}>Delivery Tip</AppText>
            <AppText style={[styles.value, { marginTop: 10, color: "#EA580C" }]}>
              {tip ? `₹${tip}` : "Add tip"}
            </AppText>
          </View>

          {/* GST */}
          <View style={styles.row}>
            <AppText style={styles.label}>GST & Other Charges</AppText>
            <AppText style={styles.value}>₹0.00</AppText>
          </View>

          {/* Grand Total */}
          <View style={[styles.row, { marginTop: 10, borderTopWidth: 1, borderColor: "#656565ff", borderStyle: "dashed", paddingTop: 10 }]}>
            <AppText style={[styles.label, { color: "#0f172a" }]}>To Pay</AppText>
            <AppText style={[styles.value, { color: "#0f172a", fontWeight: "bold" }]}>
              ₹{grandTotal}
            </AppText>
          </View>

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  label: {
    
    fontSize: 14,
    color: "#374151",
    lineHeight: 15,
  },
  value: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 10,
  },
});
