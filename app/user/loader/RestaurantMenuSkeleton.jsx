import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const SkeletonBlock = ({ style }) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-width, width]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.skeleton, style]}>
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
};

export default function RestaurantMenuSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      
      {/* -------- HEADER CARD -------- */}
      <View style={styles.headerCard}>
        <SkeletonBlock style={{ width: 120, height: 16, borderRadius: 6 }} />
        <SkeletonBlock style={{ width: "80%", height: 30, marginTop: 12 }} />
        <View style={{ flexDirection: "row", marginTop: 10, gap: 8 }}>
          <SkeletonBlock style={{ width: 60, height: 16 }} />
          <SkeletonBlock style={{ width: 100, height: 16 }} />
        </View>
      </View>

      {/* -------- SECTION HEADERS + ITEMS -------- */}
      {[1, 2, 3].map((_, sectionIdx) => (
        <View key={sectionIdx} style={{ marginTop: 25 }}>
          {/* Section title */}
          <SkeletonBlock
            style={{ width: 140, height: 20, marginLeft: 16 }}
          />

          {/* Food items */}
          {[1, 2].map((_, idx) => (
            <View key={idx} style={styles.foodRow}>
              <View style={{ flex: 1 }}>
                <SkeletonBlock style={{ width: 140, height: 16 }} />
                <SkeletonBlock
                  style={{ width: "90%", height: 12, marginTop: 8 }}
                />
                <SkeletonBlock
                  style={{ width: 60, height: 14, marginTop: 10 }}
                />
              </View>

              <SkeletonBlock style={styles.foodImage} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  headerCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#f6f6f6",
  },

  foodRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
    gap: 12,
  },

  foodImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },

  skeleton: {
    backgroundColor: "#e6e6e6",
    overflow: "hidden",
    borderRadius: 8,
  },

  shimmer: {
    width: "40%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.5)",
    opacity: 0.6,
  },
});
