import AppText from "@/components/AppText";
import Banner from "./banner";
import Category from "./category";
import Restaurant from "./restaurant";
import { View } from "react-native";
import { ScrollView } from "react-native";
import SearchBar from "./searchbar";
import { StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import LogoutButton from "../../restaurant/dashboard/logout-button";
import { useRouter } from "expo-router";
import { DefaultTheme } from "@react-navigation/native";
import NagrowToast from "@/app/toast/NagrowToast";
import RootWrapper from "@/app/rootWrapper";
import SearchModal from "./searchModal";
import { useState } from "react";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { useScrollHandler } from "@/hooks/useScrollHandler";
import PremiumCard from "./PremiumCard";


export default function UserDash() {
  // const [currentFilterMode, setCurrentFilterMode] = useState("OFF");
  const handleScroll = useScrollHandler();
  const [searchVisible, setSearchVisible] = useState(false); // State for modal
  const router = useRouter();

  // 1. 👇 ADD STATE HERE (Lifting State Up)
  const [filterMode, setFilterMode] = useState("OFF");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 2. 👇 CREATE HANDLER
  const handleFilterChange = (mode) => {
    console.log("Filter Mode Changed to:", mode);
    setFilterMode(mode);
  };

  const handleCategorySelect = (categoryKey) => {
    if (selectedCategory === categoryKey) {
      setSelectedCategory(null); // Clicked same item? Deselect it.
    } else {
      setSelectedCategory(categoryKey); // Select new item
    }
  };

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
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
    <ScrollView style={{ flex: 1, backgroundColor: "#ffffff" }} stickyHeaderIndices={[1]} onScroll={handleScroll} scrollEventThrottle={16} >
      {/* <HidingScrollView style={{ flex: 1, backgroundColor: "#fff" }} stickyHeaderIndices={[1]}> */}
      {/* <View style={{ position: "absolute" }}> */}
        {/* <NagrowToast/> */}
      {/* </View> */}
         <Banner />
        <View style={{ marginTop: -190, zIndex: 999, elevation: 10 }}>
            <SearchBar onPress={() => setSearchVisible(true)} onFilterChange={handleFilterChange} />
        </View>
        
        
        {/* <View style={{ left: 10 }}> */}
          <PremiumCard />
        {/* </View>.\ */}
        {/* <TouchableOpacity style={styles.btn} onPress={handleLogout}>
      <AppText style={styles.text}>Logout</AppText>
      
      {/* <AppText style={styles.text}>Order</AppText> */}

    {/* </TouchableOpacity> */} 
    {/* // <TouchableOpacity style={styles.btn} onPress={() => router.push(`/user/order/${"6945693fd9cdd4ec0569c435"}`)}>
    //     <AppText >Order</AppText>
    //   </TouchableOpacity> */}
        {/* <Category /> */}
        <Restaurant filterMode={filterMode} />
        
        {/* </HidingScrollView>  */}
     </ScrollView>
     <SearchModal 
      visible={searchVisible}
      onClose={() => setSearchVisible(false)}
     />
    </View> 
    // </RootWrapper>
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