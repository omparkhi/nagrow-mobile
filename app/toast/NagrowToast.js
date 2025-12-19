import React from "react";
import { View, StyleSheet, Image, Platform, TouchableOpacity } from "react-native";
import NaGrow from "@/assets/NaGrow.png"; 
import AppText from "@/components/AppText"; 

const NagrowToast = ({ 
  text1 = "Order Update", 
  text2 = "Your order is delivered!", 
  onPress 
}) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress} 
      style={styles.container}
    >
      {/* Accent Bar */}
      <View style={styles.accentBar} />

      <View style={styles.contentContainer}>
        {/* Logo */}
        <View style={styles.iconContainer}>
          <Image source={NaGrow} style={styles.logo} resizeMode="cover" />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <AppText variant="small" style={styles.title} numberOfLines={1}>
              {text1.toUpperCase()}
            </AppText>
            <AppText style={styles.timeText}>Now</AppText>
          </View>
          
          <AppText variant="small" style={styles.message} numberOfLines={2}>
            {text2}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "92%", 
    alignSelf: "center",
    backgroundColor: "#FFFFFF", 
    borderRadius: 16, 
    // Increased shadow for that "floating" look
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12, // Slightly softer opacity
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
    flexDirection: "row",
    overflow: "hidden", 
    minHeight: 70, // Ensures consistency
  },
  accentBar: {
    width: 5, // Slightly thinner looks cleaner
    height: "100%",
    backgroundColor: "#FF6D2D", 
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14, // Little more breathing room
    gap: 12,
  },
  iconContainer: {
    width: 44, // Square dimensions are better
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFF5F0", 
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE0D0",
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center", 
    // Removed specific heights to let Flexbox handle content
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2, // Tight gap between title and message
  },
  title: {
    color: "#1F2937", 
    fontSize: 15,
    flex: 1, // Allows title to take space before the 'Now' text
    marginRight: 8,
  },
  timeText: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  message: {
    fontSize: 13,
    color: "#6B7280",
    top: -7,
    lineHeight: 18, // Line height fixes the cramping, no need for top: -7
  },
});

export default NagrowToast;