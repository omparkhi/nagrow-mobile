import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function RootWrapper({ children, bg = "#fff", barStyle = "dark" }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bg,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={barStyle} backgroundColor={bg} />
      {children}
    </View>
  );
}
