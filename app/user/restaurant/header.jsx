import React, { useEffect } from "react";
import { View, Image, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppText from "@/components/AppText";
import { fetchRestaurantById } from "@/redux/slices/user/restaurantSlice";
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import Icon from 'react-native-vector-icons/FontAwesome';
import { ShieldCheck, Hotel } from "lucide-react-native";
import HandleBack from "@/app/back-button";

export default function RestaurantHeader({ restaurant }) {
    const router = useRouter();

    // useEffect(() => {
    //   console.log("PAGE PARAM ID:", id);

    // }, [id]);

    
    if (!restaurant) return <AppText>Restaurant not found</AppText>;


    return (
        <View style={styles.wrapper}>
          <HandleBack />

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
              {restaurant?.deliveryTimeEstimate}
            </AppText>
            <AppText style={styles.metaDivider}>|</AppText>
            <AppText variant="small" style={styles.metaText}>
              {restaurant?.address?.street}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#131222",
    paddingBottom: 7,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },

 

  headerContent: {
    flexDirection: "row",
    paddingTop: 40,
    paddingHorizontal: 5,
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
    borderRadius: 22,
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
