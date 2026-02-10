import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  FlatList
} from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import FoodBanner from "@/assets/FavoriteFood-Banner.png";
import AppText from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { Star } from "lucide-react-native";
import { fontFamilies } from "@/constants/typography";
import { useBottomBarVisibility } from "@/app/context/NavBarVisibilityContext";
import EmptyFavorites from "./no-favorite";
import Footer from "../Footer";

const { height, width } = Dimensions.get("window");
const STATUS_BAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight || 20 : 44;
const HEADER_HEIGHT = 20 + STATUS_BAR_HEIGHT; // Height of your sticky header

export default function FavoritePage () {
    const { setVisible } = useBottomBarVisibility();
    const favoriteList = useSelector(state => state.favorites?.favoritesList);
    const router = useRouter();

    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        console.log(favoriteList);
    }, []);

    useEffect(() => {
        setVisible(false);     // Hide header
        return () => setVisible(true);  // Show header againwhen leaving page
    }, []);

    const headerBackgroundColor = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'],
        extrapolate: "clamp"
    });

    const whiteIconOpacity = scrollY.interpolate({
        inputRange: [0, 150],
        outputRange: [1, 0], // Visible -> Invisible
        extrapolate: "clamp",
    });


    const blackIconOpacity = scrollY.interpolate({
        inputRange: [0, 150],
        outputRange: [0, 1], // Invisible -> Visible
        extrapolate: "clamp",
    });

    const titleOpacity = scrollY.interpolate({
        inputRange: [60, 150],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    const headerElevation = scrollY.interpolate({
        inputRange: [100, 150],
        outputRange: [0, 4],
        extrapolate: "clamp"
    });


    const renderFood = ({ item }) => {
        const food = item.menuItemId; 
        const restaurant = item.restaurantId;

        return (
            <TouchableOpacity style={{ flexDirection: 'row', padding: 10, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: "#c7c7c7ff" }} onPress={() => router.push(`/user/restaurant/${restaurant._id}`)}>
                <View>
                    <Image 
                        source={{ uri: food.image }} 
                        style={{ position: "relative", height: 130, width: 110, borderRadius: 8, marginRight: 10,  marginTop: 10 }} 
                        resizeMode="cover"
                    />
                    <AppText style={{ position: "absolute", color: "#ffffffff", fontSize: 14, bottom: 0, backgroundColor: "#9b9b9b84", marginLeft: 10, paddingHorizontal: 5, borderRadius: 5  }}>Item at ₹{food.price}</AppText>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <AppText variant="small" style={{ lineHeight: 22, fontSize: 22, color: '#333', }}>{food.name}<AppText style={{ fontSize: 18, color: '#5f5f5fff', textTransform: "capitalize" }}> - {restaurant.name}</AppText></AppText>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <View style={{ alignSelf: "flex-start",  backgroundColor: "#006810ff", padding: 3, borderRadius: 20, marginTop: 5 }} >
                        <Star size={14} fill="#ffffffff" color="#fff" />
                        </View>
                        <AppText variant="small" style={{ fontSize: 16, color: "#333", marginTop: 5 }}>{restaurant.rating || "3.0"} ({restaurant.totalRatings || "15"}+)</AppText>
                        <AppText variant="small" style={{ color: "#333", marginTop: 5 }}>• {restaurant?.deliveryTimeEstimate || "30 mins"}</AppText>
                    </View>
                    <AppText variant="small" style={{ fontSize: 13, color: "#333" }}>{restaurant.address.street}, {restaurant.address.city}</AppText>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            <Animated.View
                style={[
                    styles.stickyHeader,
                    {
                        backgroundColor: headerBackgroundColor,
                        elevation: headerElevation,
                        shadowOpacity: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 0.1] })
                    }
                ]}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                {/* Animated Icon Color */}
                    <Animated.View style={{ opacity: blackIconOpacity }}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </Animated.View>

                    <Animated.View style={{ opacity: whiteIconOpacity, position: 'absolute', top: 8, left: 8 }}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Animated.View>
                </TouchableOpacity>

                <Animated.View style={{ opacity: titleOpacity, marginLeft: 10 }}>
                    <AppText style={styles.headerTitle}>Favorite Food</AppText>
                </Animated.View>
            </Animated.View>

            {/* Banner Container */}
            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false } // 'false' is required for color interpolation
                )}
                scrollEventThrottle={16}
            >
            <View style={styles.bannerContainer}>
                <Image 
                    source={FoodBanner} // 👈 Direct usage (No { uri: ... })
                    style={styles.bannerImage}
                    resizeMode="cover" // or "contain" depending on look
                />
                {/* <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={22} color="#ffffffff" />
                </TouchableOpacity> */}
            </View>
            {/* <AppText>Favorite Food</AppText> */}
            <View style={{ paddingBottom: 400 }}>
                {favoriteList && favoriteList.length > 0 ? (
                    <FlatList
                        data={favoriteList}
                        keyExtractor={(item) => item._id}
                        renderItem={renderFood}
                        scrollEnabled={false}
                    />
                ) : (
                    <EmptyFavorites />
                )}

                <View style={{ paddingTop: 50 }}>
                <Footer />
            </View>
                
            </View>
            
            </Animated.ScrollView>
            
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    paddingTop: STATUS_BAR_HEIGHT - 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 100,
  },
  backButton: {
    padding: 8,
    // marginTop:
    // Ensure the container is big enough to hold the absolute icon without clipping
    width: 40, 
    height: 40,
    
  },
  headerTitle: {
    fontSize: 18,
    color: "#000",
    // marginLeft: 10,
  },
  bannerContainer: {
    width: "100%",
    height: height * 0.43,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});