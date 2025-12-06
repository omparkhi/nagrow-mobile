import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import AppText from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function SlideToAct({ label, onComplete }) {
  const sliderWidth = width-10;
  const knobSize = 60;

  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = Math.min(
        sliderWidth - knobSize,
        Math.max(0, event.translationX)
      );
    })
    .onEnd(() => {
      const limit = sliderWidth - knobSize -20;
      if (translateX.value > limit) {
        runOnJS(onComplete)();
        translateX.value = withTiming(0);
      } else {
        translateX.value = withTiming(0);
      }
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, { width: sliderWidth }]}>
      <AppText variant="small" style={styles.label}>{label}</AppText>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.knob, knobStyle]}>
          <View style={styles.arrow}>
          <Ionicons name="arrow-forward" size={30} color="#fff" />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: "#ffffffff",
    borderRadius: 20,
    justifyContent: "center",
    overflow: "hidden",
    alignItems: "center",
    position: "relative",
    alignSelf: "center",
    elevation: 6,
    shadowOpacity: 0.1,
    padding: 35
  },
  label: {
    color: "#0f172a",
    fontSize: 18,
    position: "absolute",
    zIndex: 1,
  },
  knob: {
    height: 60,
    width: 60,
    backgroundColor: "#111",
    borderRadius: 20,
    position: "absolute",
    marginLeft: 5,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    
    color: "white",
    fontSize: 22,

  },
});
