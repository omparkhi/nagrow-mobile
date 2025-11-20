import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { useRouter } from "expo-router";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userType = await AsyncStorage.getItem("userType");
        const userIdFromStorage = await AsyncStorage.getItem("userId");

        if (!token || userType !== "user") {
          setAuthorized(false);
          router.replace("/user-login");
          return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded.id || decoded._id;

        if (userId !== userIdFromStorage) {
          setAuthorized(false);
          router.replace("/user-login");
          return;
        }

        setAuthorized(true);
      } catch (err) {
        console.error("Protected route check failed:", err);
        router.replace("/user-login");
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
