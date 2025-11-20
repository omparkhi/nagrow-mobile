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




export default function UserDash() {
    const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userType");

      // Expo Router way
      router.replace("/");   // <-- change path if needed

    } catch (err) {
      console.log("Logout error:", err);
    }
  };
    return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} stickyHeaderIndices={[1]} >
         <Banner />
        <View style={{ marginTop: -190, zIndex: 999, elevation: 10 }}>
            <SearchBar />
        </View>
        <Category />
        <Restaurant />
        <TouchableOpacity style={styles.btn} onPress={handleLogout}>
      <AppText style={styles.text}>Logout</AppText>
    </TouchableOpacity>
    </ScrollView>
)
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});