import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { useRouter } from "expo-router";

export default function RestaurantProtectedRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userType = await AsyncStorage.getItem("userType");
        const restaurantIdFromStorage = await AsyncStorage.getItem("restaurantId");

        if (!token || userType !== "restaurant") {
          setAuthorized(false);
          router.replace("/restaurant-login");
          return;
        }

        const decoded = jwtDecode(token);
        const restaurantId = decoded.id || decoded._id;

        if (restaurantId !== restaurantIdFromStorage) {
          setAuthorized(false);
          router.replace("/restaurant-login");
          return;
        }

        setAuthorized(true);
      } catch (err) {
        console.error("Protected route check failed:", err);
        router.replace("/restaurant-login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff5733" />
      </View>
    );
  }

  return authorized ? children : null;
}
