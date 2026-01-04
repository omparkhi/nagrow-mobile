import React, { useState } from "react";
import { View, Text, LayoutAnimation, Platform, UIManager, StyleSheet, Animated } from "react-native";
import { Receipt, ChevronRight } from "lucide-react-native";
import AppText from "@/components/AppText";
import { useRef } from "react";
import { TouchableOpacity } from "@/app/TouchableOpacity";


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
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.timing(rotateAnim, {
      toValue: open ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["90deg", "270deg"],
  });

  return (
    <View style={{ backgroundColor: "white", padding: 16, borderRadius: 12, marginTop: 17 }}>
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
            <AppText variant="small" style={{ fontSize: 12, color: "#16A34A" }}>
              incl. all taxes & charges
            </AppText>
          </View>

          <TouchableOpacity onPress={toggle}>
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <ChevronRight size={22} color="#000" />
            </Animated.View>
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
            <AppText variant="small" style={styles.label}>Delivery Fee | {distanceKm} kms</AppText>
            <AppText variant="small" style={styles.value}>₹{deliveryFee}</AppText>
          </View>

          {/* Tip */}
          <View style={[styles.row, { marginTop: 6, borderTopWidth: 1, borderColor: "#656565ff", borderStyle: "dashed"  }]}>
            <AppText variant="small" style={[styles.label, { marginTop: 10 }]}>Delivery Tip</AppText>
            <AppText variant="small" style={[styles.value, { marginTop: 10, color: "#EA580C" }]}>
              {tip ? `₹${tip}` : "Add tip"}
            </AppText>
          </View>

          {/* GST */}
          <View style={styles.row}>
            <AppText variant="small" style={styles.label}>GST & Other Charges</AppText>
            <AppText variant="small" style={styles.value}>₹0.00</AppText>
          </View>

          {/* Grand Total */}
          <View style={[styles.row, { marginTop: 10, borderTopWidth: 1, borderColor: "#656565ff", borderStyle: "dashed", paddingTop: 10 }]}>
            <AppText variant="small" style={[styles.label, { color: "#0f172a" }]}>To Pay</AppText>
            <AppText variant="small" style={[styles.value, { color: "#0f172a" }]}>
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
    paddingVertical: 7,
  },
  label: {
    
    fontSize: 14,
    color: "#374151",
    // lineHeight: 17,
  },
  value: {
    fontSize: 14,
    color: "#374151",
    // lineHeight: 10,
  },
});
