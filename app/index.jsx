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
        const lastPath = await AsyncStorage.getItem("lastVisitedPath");

        if (token && userType) {

          if (lastPath) {
             // 2. SECURITY CHECK: Ensure the path belongs to this user type!
             // Prevents a "User" from accidentally loading a "Rider" page
             if (lastPath.startsWith(`/${userType}`)) {
                 console.log(`🔄 Restoring Session: ${lastPath}`);
                 router.replace(lastPath);
                 return; // ✅ Stop here, we are done.
             }
          }

          console.log("⚠️ No history found. Going to Dashboard.");
          switch (userType) {
            case "user":
              router.replace("/user/dashboard/dash");
              break;
            case "restaurant":
              router.replace("/restaurant/dashboard/dash");
              break;
            case "rider":
              router.replace("/rider/dashboard/dash");
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
