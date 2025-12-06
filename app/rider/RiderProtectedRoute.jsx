import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { useRouter } from "expo-router";

export default function RiderProtectedRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userType = await AsyncStorage.getItem("userType");
        const riderIdFromStorage = await AsyncStorage.getItem("riderId");

        // 🔥 Must be token + correct userType
        if (!token || userType !== "rider") {
          setAuthorized(false);
          router.replace("/rider-login");
          return;
        }

        // 🔥 Decode JWT
        const decoded = jwtDecode(token);
        const riderId = decoded.id || decoded._id;

        // 🔥 ID mismatch (possible tampering)
        if (riderId !== riderIdFromStorage) {
          setAuthorized(false);
          router.replace("/rider-login");
          return;
        }

        setAuthorized(true);
      } catch (err) {
        console.error("Rider protected route error:", err);
        router.replace("/rider-login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#32cd32" />
      </View>
    );
  }

  return authorized ? children : null;
}
