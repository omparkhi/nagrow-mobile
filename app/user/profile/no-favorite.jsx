import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import AppText from "@/components/AppText";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Using Expo Icons

const { height } = Dimensions.get("window");

export default function EmptyFavorites() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 1. Visual Icon or Image */}
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="food-off" size={100} color="#e0e0e0" />
        <View style={styles.heartBadge}>
            <Ionicons name="heart-dislike" size={24} color="#ff4d4d" />
        </View>
      </View>

      {/* 2. Engaging Copy */}
      <AppText style={styles.title}>Where is the love?</AppText>
      <AppText style={styles.subTitle}>
        You haven't saved any food items yet.{"\n"}
        Explore the menu and find your next craving!
      </AppText>

      {/* 3. Call to Action Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push("/user/dashboard/dash")} // Or wherever your restaurant list is
      >
        <AppText style={styles.buttonText}>Find Food Now</AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: height * 0.1, // Push it down a bit
  },
  iconContainer: {
    marginBottom: 20,
    position: "relative",
  },
  heartBadge: {
    position: "absolute",
    right: -10,
    top: -10,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 22,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#00c569", // Your app's primary green
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
    shadowColor: "#00c569",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});