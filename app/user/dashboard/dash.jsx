import AppText from "@/components/AppText";
import Banner from "./banner";
import Category from "./category";
import Restaurant from "./restaurant";
import { View } from "react-native";
import { ScrollView } from "react-native";
import SearchBar from "./searchbar";
import { TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import LogoutButton from "../../restaurant/dashboard/logout-button";
import { useRouter } from "expo-router";
import { DefaultTheme } from "@react-navigation/native";
import NagrowToast from "@/app/toast/NagrowToast";


export default function UserDash() {
  const router = useRouter();
    const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userType");

      // Expo Router way
      router.replace("/");
         // <-- change path if needed

    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  console.log("DefaultTheme:", DefaultTheme);
    return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} stickyHeaderIndices={[1]} >
      {/* <View style={{ position: "absolute" }}> */}
        {/* <NagrowToast/> */}
      {/* </View> */}
         <Banner />
        <View style={{ marginTop: -190, zIndex: 999, elevation: 10 }}>
            <SearchBar />
        </View>
        <Category />
        <TouchableOpacity style={styles.btn} onPress={handleLogout}>
      <AppText style={styles.text}>Logout</AppText>
      
      {/* <AppText style={styles.text}>Order</AppText> */}

    </TouchableOpacity>
    <TouchableOpacity style={styles.btn} onPress={() => router.push(`/user/order/${"693299990396c3f7f3cf6ae8"}`)}>
        <AppText >Order</AppText>
      </TouchableOpacity>
        <Restaurant />
        
        
    </ScrollView>
)
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    // alignItems: "center",
    // justifyContent: "center",
    marginTop: 20,
    paddingBottom: 50,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});