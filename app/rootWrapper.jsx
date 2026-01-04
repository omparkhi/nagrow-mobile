import React, { useEffect } from "react";
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar"; // Import this

export default function RootWrapper({ 
  children, 
  bg = "#fff", 
  barStyle = "dark", 
  topSafeAreaColor = "transparent", 
  bottomSafeAreaColor = "transparent",
}) {
  const insets = useSafeAreaInsets();

  // Handle Android Bottom Navigation Bar Colors
  useEffect(() => {
    if (Platform.OS === 'android') {
      // 1. Set the background color of the system navigation bar to match your prop
      NavigationBar.setBackgroundColorAsync(bottomSafeAreaColor);
      
      // 2. logic to set the icons (back/home buttons) to dark or light
      // If the bottom bar is white (or light), we generally want "dark" buttons.
      // If the bottom bar is black, we want "light" buttons.
      // You can make this smarter, but for "White Bottom", use "dark".
      const buttonStyle = bottomSafeAreaColor === "white" || bottomSafeAreaColor === "#fff" 
        ? "dark" 
        : "light";
        
      NavigationBar.setButtonStyleAsync(buttonStyle);
    }
  }, [bottomSafeAreaColor]);

  return (
    <View style={{ flex: 1 }}>
      {/* 1. Status Bar Configuration */}
      <StatusBar 
        style={barStyle} 
        backgroundColor="transparent"
        translucent={true}
      />

      {/* 2. Top Safe Area Spacer */}
      <View 
        style={{ 
          height: insets.top, 
          backgroundColor: topSafeAreaColor 
        }} 
      />

      {/* 3. Main Content Area */}
      <View style={{ flex: 1, backgroundColor: bg }}>
        {children}
      </View>

      {/* 4. Bottom Safe Area Spacer */}
      <View 
        style={{ 
          height: insets.bottom, 
          backgroundColor: bottomSafeAreaColor 
        }} 
      />
    </View>
  );
}