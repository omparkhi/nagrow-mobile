import React from "react";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

export function HapticTab(props) {
  const handlePressIn = (event) => {
    // Trigger light haptic feedback only on iOS
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (props.onPressIn) {
      props.onPressIn(event);
    }
  };

  return <PlatformPressable {...props} onPressIn={handlePressIn} />;
}
