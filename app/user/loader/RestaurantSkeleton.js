import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Skeleton from "./skeleton";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

// --- 1. Reusable Shimmer Block ---
const SkeletonBlock = ({ width, height, style }) => {
  const translateX = useSharedValue(-width);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(width, { duration: 1500 }), // Smooth 1.5s sweep
      -1, // Infinite
      false // Do not reverse, restart from left
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        {
          width: width,
          height: height,
          backgroundColor: "#dddddd99", // Base Gray
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View style={[{ width: "100%", height: "100%" }, animatedStyle]}>
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.5)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

// --- 2. Main Card Skeleton ---
export const RestaurantSkeleton = () => {
  return (
    <View style={[styles.card, { width: CARD_WIDTH }]}>
      
      {/* A. Hero Image Placeholder */}
      <SkeletonBlock width={CARD_WIDTH} height={160} style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />

      {/* B. Content Area */}
      <View style={{ padding: 12 }}>
        
        {/* Title & Rating Row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          {/* Restaurant Name (Longer bar) */}
          <Skeleton width={180} height={20} style={{ borderRadius: 4 }} />
          {/* Rating Badge (Small square) */}
          <Skeleton width={40} height={20} style={{ borderRadius: 4 }} />
        </View>

        {/* Separator Line */}
        <View style={{ height: 1, backgroundColor: "#eee", marginBottom: 10 }} />

        {/* Address & Time Row */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          {/* Star Icon Circle */}
          <Skeleton width={20} height={20} style={{ borderRadius: 10, marginRight: 8 }} />
          {/* Address Line */}
          <Skeleton width={120} height={14} style={{ borderRadius: 4 }} />
          {/* Dot */}
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#ccc", marginHorizontal: 6 }} />
          {/* Distance */}
          <Skeleton width={60} height={14} style={{ borderRadius: 4 }} />
        </View>

        {/* Dish Subtitle Row */}
        <View style={{ marginTop: 4 }}>
          <Skeleton width={150} height={14} style={{ borderRadius: 4 }} />
        </View>

      </View>

      {/* C. Floating Absolute Elements (Like your Favorites/Time) */}
      {/* Favorite Icon Top Right */}
      <View style={styles.topRight}>
         <Skeleton width={32} height={32} style={{ borderRadius: 16 }} />
      </View>
      
      {/* Delivery Time Badge (Bottom Right of Image) */}
      <View style={styles.deliveryTime}>
         <SkeletonBlock width={60} height={20} style={{ borderRadius: 4 }} />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    alignSelf: "center",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f5f5f5",
    overflow: "hidden", // Important for corner radius
    elevation: 2, // Slight shadow for depth even in skeleton state
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  topRight: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  deliveryTime: {
    position: "absolute",
    top: 130, // Matches your real card
    right: 8,
  },
});