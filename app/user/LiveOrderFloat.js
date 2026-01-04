import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import AppText from "@/components/AppText";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { TouchableOpacity } from "@/app/TouchableOpacity";

export default function LiveOrderFloat() {
  const router = useRouter();
  // Ensure we are looking at the correct Redux slice
  const { currentOrder } = useSelector((state) => state.userOrder);
  
  // Animation Value
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Check if order is truly "Live" (not delivered or cancelled)
  const isLive = currentOrder && 
                 currentOrder.status !== "delivered" && 
                 currentOrder.status !== "cancelled";

  useEffect(() => {
    let animation;
    if (isLive) {
      // Pulse Animation
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    }
    return () => animation?.stop();
  }, [isLive]);

  if (!isLive) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push({
             pathname: `/user/order/${currentOrder._id}`,
             params: { orderId: currentOrder._id }
        })}
      >
        <View style={styles.iconBox}>
           <MaterialIcons name="delivery-dining" size={24} color="#fff" />
        </View>
        <View style={styles.content}>
           <AppText style={styles.title}>Live Order</AppText>
           <AppText style={styles.status}>{currentOrder.status}...</AppText>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    // Adjust this depending on your CartBar height (usually 70-80px)
    bottom: 90, 
    right: 16,
    zIndex: 1000, // Higher than CartBar
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414", // Dark Swiggy/Zomato Theme
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 30,
    elevation: 6,
    shadowColor: "#e11d48",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#e11d48", // Red pulsing border
  },
  iconBox: {
    backgroundColor: "#e11d48",
    padding: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  content: { marginRight: 8 },
  title: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  status: { color: "#ccc", fontSize: 10, textTransform: "capitalize" },
});