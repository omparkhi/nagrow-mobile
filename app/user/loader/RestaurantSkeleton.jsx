import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import Skeleton from "./skeleton";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

// const SkeletonItem = ({ width, height, borderRadius, style }) => {
//   const opacity = useRef(new Animated.Value(0.3)).current;

//   useEffect(() => {
//     const animation = Animated.loop(
//       Animated.sequence([
//         Animated.timing(opacity, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.timing(opacity, {
//           toValue: 0.3,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//       ])
//     );
//     animation.start();
//     return () => animation.stop();
//   }, [opacity]);

//   return (
//     <Animated.View
//       style={[
//         { opacity, width, height, backgroundColor: "#E1E9EE", borderRadius },
//         style,
//       ]}
//     />
//   );
// };

export const RestaurantSkeleton = () => {
  return (
    <View style={skeletonStyles.card}>
      {/* Image Placeholder */}
      <Skeleton width="100%" height={140} borderRadius={0} />

      {/* Top Right Floating Buttons (Mimic real UI) */}
      <View style={skeletonStyles.topRight}>
        <Skeleton width={28} height={28} borderRadius={14} style={{ marginLeft: 8 }} />
        <Skeleton width={28} height={28} borderRadius={14} style={{ marginLeft: 8 }} />
      </View>

      {/* Bottom Floating Pills (Distance/Time) */}
      <View style={skeletonStyles.deliveryTime}>
        <Skeleton width={60} height={16} borderRadius={4} />
      </View>
      <View style={skeletonStyles.distance}>
        <Skeleton width={50} height={16} borderRadius={4} />
      </View>

      {/* Content Area */}
      <View style={skeletonStyles.content}>
        {/* Title and Rating Row */}
        <View style={skeletonStyles.row}>
          <Skeleton width="60%" height={24} borderRadius={4} />
          <Skeleton width={40} height={20} borderRadius={6} />
        </View>

        {/* Address Row */}
        <View style={{ marginTop: 8 }}>
          <Skeleton width="80%" height={16} borderRadius={4} />
        </View>

        {/* Dish/Category Row */}
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
          <Skeleton width="40%" height={16} borderRadius={4} />
          <Skeleton width={10} height={10} borderRadius={5} style={{marginHorizontal: 5}}/>
          <Skeleton width="20%" height={16} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    alignSelf: "center",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    // Match your main card shadow
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0"
  },
  content: { padding: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topRight: { position: "absolute", top: 8, right: 8, flexDirection: "row" },
  deliveryTime: { position: "absolute", top: 111, right: 8 },
  distance: { position: "absolute", top: 111, left: 8 },
});