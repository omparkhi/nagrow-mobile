import React, { useEffect } from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppText from "@/components/AppText";
import { fetchRestaurantById } from "@/redux/slices/user/restaurantSlice";
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import Icon from 'react-native-vector-icons/FontAwesome';
import { ShieldCheck, Hotel } from "lucide-react-native";
import HandleBack from "@/app/back-button";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import RestaurantDietBadge from "./type";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { 
  interpolate, 
  useAnimatedStyle, 
  Extrapolation,
  interpolateColor 
} from 'react-native-reanimated';

export default function RestaurantHeader({ scrollY, restaurant }) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    

    const getDietType = (restaurant) => {
      if (restaurant.isPureVeg) return "veg";
      return "non-veg";
    }

    // useEffect(() => {
    //   console.log("PAGE PARAM ID:", id);

    // }, [id]);

    
    if (!restaurant) return <AppText>Restaurant not found</AppText>;


    return (
        <View style={styles.wrapper}>
          {/* <HandleBack /> */}
          {/* <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}> */}
            {/* <Ionicons name="arrow-back" size={25} color="#fff" /> */}
            {/* <Ionicons name="arrow-back" size={24} style={{  color: "#fff" }} /> */}
          {/* </TouchableOpacity> */}

      {/* Main Header Content */}
      <View style={styles.headerContent}>
        {/* Card container */}
        <View style={styles.infoCard}>
          
          {/* Cuisine Section */}
          <View style={styles.cuisineRow}>
            <ShieldCheck size={24} color="white" fill="#3B82F6" />
            <AppText variant="small" style={styles.cuisineText}>
              Best at{" "}
              <AppText variant="small" style={styles.cuisineBold}>
                {Array.isArray(restaurant?.cuisine)
                  ? restaurant?.cuisine.join(", ")
                  : restaurant?.cuisine}
              </AppText>
            </AppText>
          </View>

          {/* Name + Rating */}
          <View style={styles.nameRatingRow}>
            <View style={styles.nameRow}>
              <AppText variant="body" style={styles.restaurantName} numberOfLines={1}>
                {restaurant?.name}
              </AppText>
            </View>

            <View style={styles.ratingBadge}>
              <AppText variant="small" style={styles.ratingText}>
                {restaurant?.rating || "3.0"}
              </AppText>
              <Ionicons name="star" size={10} color="#ffffffff" />
            </View>
          </View>

          {/* Time + Address */}
          <View style={styles.metaRow}>
            <AppText variant="small" style={styles.metaText}>
              {restaurant?.deliveryTimeEstimate} mins
            </AppText>
            <AppText style={styles.metaDivider}>|</AppText>
            <AppText variant="small" style={styles.metaText}>
              {restaurant?.address?.street}
            </AppText>
          </View>

          <LinearGradient 
            colors={['#20265cff', 'rgba(255,255,255,0)']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 0.95, y: 0 }}
            style={{ width: "100%", height: 1, marginTop: 5 }}
          ></LinearGradient>

          <View style={{ marginTop: 8 }}>
            <RestaurantDietBadge type={getDietType(restaurant)} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#131222",
    paddingBottom: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
   backBtn: {
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 9999,
        // padding: 10, 
  },
 

  headerContent: {
    flexDirection: "row",
    paddingTop: 45,
    paddingHorizontal: 15,
    alignItems: "center",
    gap: 10,
  },

  desktopImage: {
    display: "none", // Equivalent to sm:hidden
  },

  shopImage: {
    
    borderRadius: 12,
  },

  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 10,
  },

  cuisineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  cuisineText: {

    // textDecorationLine: "underline",
    borderBottomWidth: 1,
    borderColor: "#3B82F6",
    fontSize: 17,
    color: "#3B82F6",
    // fontWeight: "bold",
  },

  cuisineBold: {
    fontSize: 17,
    textTransform: "capitalize",
    color: "#3B82F6",
  },

  nameRatingRow: {
    marginLeft: 5,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },

  restaurantName: {
   marginTop: -5,
    fontSize: 22,
    // fontWeight: "bold",
    maxWidth: 200,
    textTransform: "capitalize",
  },

  ratingBadge: {
    height: 25,
    marginTop: -5,
    flexDirection: "row",
    backgroundColor: "#00c569",
    borderRadius: 13  ,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 4,
  },

  ratingText: {
    color: "#fff",
    // fontWeight: "bold",
    fontSize: 12,
  },

  metaRow: {
    marginLeft: 5,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },

  metaText: {
    marginTop: -10,
    fontSize: 13,
    color: "#666",
    // fontWeight: "600",
  },

  metaDivider: {
    marginTop: -10,
    fontSize: 13,
    color: "#666",
    // fontWeight: "700",
  },
});
