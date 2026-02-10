import React, { useEffect } from "react";
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar"; 

export default function RootWrapper({ 
  immersive = false, 
  barStyle = "dark", 
  bottombar = false,
  bottomSafeAreaColor = "white",
  children 
}) {
  const insets = useSafeAreaInsets();
  
useEffect(() => {
    if (Platform.OS === 'android') {
      // FORCE Android System Bar to match your color
      NavigationBar.setBackgroundColorAsync(bottomSafeAreaColor === "transparent" ? "#ffffff" : bottomSafeAreaColor);
      // Ensure icons are dark so they show up on the white background
      NavigationBar.setButtonStyleAsync("dark"); 
    }
  }, [bottomSafeAreaColor]);

  return (
    <View style={{ flex: 1, backgroundColor: bottomSafeAreaColor === "transparent" ? "#fff" : bottomSafeAreaColor }}>
      <StatusBar 
        translucent 
        style={barStyle} 
        backgroundColor="transparent" 
      />
      
      {/* Top Spacer (Only if NOT immersive) */}
      {!immersive && <View style={{ height: insets.top, backgroundColor: "white" }} />}
      
      {/* Main Content */}
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {children}
      </View>

      {/* Bottom Spacer */}
      {!bottombar && (
        <View style={{ 
          height: insets.bottom, 
          backgroundColor: bottomSafeAreaColor 
        }} />
      )}
    </View>
  );
}