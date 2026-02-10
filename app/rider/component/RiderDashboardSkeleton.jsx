import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// Reusable Shimmer Component
const SkeletonItem = ({ width, height, borderRadius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        { backgroundColor: "#cbd5e1", width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

export default function RiderDashboardSkeleton() {
  return (
    <View style={styles.container}>
      
      {/* 1. INCOMING ORDERS CARD SKELETON */}
      <View style={styles.card}>
        {/* Header Row */}
        <View style={styles.rowBetween}>
          <SkeletonItem width={180} height={20} />
          <SkeletonItem width={60} height={24} borderRadius={12} />
        </View>

        {/* Content Area (Imitating the Searching/Order View) */}
        <View style={styles.contentArea}>
          {/* Left: Text Lines */}
          <View style={{ flex: 1, gap: 10 }}>
            <SkeletonItem width={140} height={20} />
            <SkeletonItem width={100} height={14} />
            <SkeletonItem width={180} height={14} />
          </View>
          {/* Right: Circle Icon */}
          <SkeletonItem width={80} height={80} borderRadius={40} />
        </View>
      </View>

      {/* 2. SHIFT STATUS CARD SKELETON */}
      <View style={styles.card}>
        <SkeletonItem width={120} height={20} style={{ marginBottom: 15 }} />

        {/* Rows x3 */}
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.rowBetween, { marginBottom: 12 }]}>
            <SkeletonItem width={100} height={16} />
            <SkeletonItem width={60} height={16} />
          </View>
        ))}
      </View>

      {/* 3. BUTTON SKELETON */}
      <SkeletonItem width="100%" height={50} borderRadius={10} style={{ marginTop: 10 }} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -30, // Matches your real dashboard negative margin
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contentArea: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    justifyContent: "space-between",
  }
});