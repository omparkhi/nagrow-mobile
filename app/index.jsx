import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function HomeRedirector() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userType = await AsyncStorage.getItem("userType");

        if (token && userType) {
          switch (userType) {
            case "user":
              router.replace("/user/dashboard/dash");
              break;
            case "restaurant":
              router.replace("/restaurant-home");
              break;
            case "rider":
              router.replace("/rider-home");
              break;
            default:
              router.replace("/home"); // fallback page
          }
        } else {
          router.replace("/home"); // fallback page
        }
      } catch (err) {
        console.error("Redirect failed:", err);
        router.replace("/home");
      }
    };

    checkUser();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#ff5733" />
    </View>
  );
}
