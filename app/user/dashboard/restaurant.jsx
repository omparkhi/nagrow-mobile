import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, FlatList, StyleSheet, Dimensions } from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons"; 
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurants } from "@/redux/slices/user/restaurantSlice";
import { useRouter } from "expo-router";
import AppText from "@/components/AppText";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32; // 16 padding each side + 16 gap between cards

export default function Restaurant() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: restaurants, loading } = useSelector((state) => state.restaurants);

  const [favorite, setFavorite] = useState({});
  const [bookmarks, setBookmarks] = useState({});

  const toggleFavorite = (id) => setFavorite(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleBookmark = (id) => setBookmarks(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, []);

  //  useEffect(() => {
  //   console.log("Fetched Restaurants:", restaurants);
  // }, [restaurants]);

  if (loading) return <AppText>Loading</AppText>

  return (
    <View style={styles.container}>
      <AppText  variant="label" style={styles.heading}>Top Restaurants to Explore</AppText>

      <FlatList
        data={restaurants}
        keyExtractor={(restaurant) => restaurant._id}
        // numColumns={2}
        // columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
        renderItem={({ item: restaurant }) => (
          
          <TouchableOpacity
            style={[styles.card, { width: CARD_WIDTH }]}
            onPress={() => router.push(`/user/restaurant/${restaurant._id}`)}
          >
            {/* Image */}
            <Image
              source={{ uri: restaurant.featuredDish?.image }}
              style={styles.image}
            />

            {/* Top buttons */}
            <View style={styles.topRight}>
              <TouchableOpacity onPress={() => toggleBookmark(restaurant._id)} style={styles.iconButton}>
                <Feather name="bookmark" size={18} color={bookmarks[restaurant._id] ? "green" : "gray"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleFavorite(restaurant._id)} style={styles.iconButton}>
                <Feather name="heart" size={18} color={favorite[restaurant._id] ? "red" : "gray"} />
              </TouchableOpacity>
            </View>

            {/* Delivery Time */}
            <View style={styles.deliveryTime}>
              <Feather name="clock" size={12} color="black" />
              <AppText  style={styles.smallText}>{restaurant.deliveryTimeEstimate}</AppText>
            </View>

            {/* Distance */}
            <View style={styles.distance}>
              <MaterialIcons name="speed" size={12} color="black" />
              <AppText  style={styles.smallText}>{restaurant.distance || "3.5 km"}</AppText>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.titleRow}>
                <AppText style={styles.title} numberOfLines={1}>{restaurant.name}</AppText>
                <View style={styles.rating}>
                  <AppText style={styles.ratingText}>{restaurant.rating || "3.0"}</AppText>
                  <Ionicons name="star" size={12} color="white" style={{ marginLeft: 2 }} />
                </View>
              </View>

              <View style={styles.addressRow}>
                <Ionicons name="location" size={15} color="#666" />
                <AppText style={styles.address}>{restaurant.address.street}</AppText>
              </View>

              <View style={styles.dishRow}>
                <AppText style={styles.dish}>{restaurant.featuredDish?.name}</AppText>
                <AppText style={styles.category}> • {restaurant.featuredDish?.category}</AppText>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { marginBottom: 16 },
  card: { 
    backgroundColor: "#fff", 
    alignSelf: "center",
    borderRadius: 16, 
    shadowColor: "#000",
    // shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  image: { width: "100%", height: 140, resizeMode: "cover" },
  topRight: { position: "absolute", top: 8, right: 8, flexDirection: "row", gap: 8 },
  iconButton: { backgroundColor: "#fff", borderRadius: 999, padding: 4, marginLeft: 4 },
  deliveryTime: { position: "absolute", top: 111, right: 8, backgroundColor: "rgba(255,255,255,0.95)", paddingHorizontal: 6, borderRadius: 4, flexDirection: "row", alignItems: "center" },
  distance: { position: "absolute", top: 111, left: 8, backgroundColor: "rgba(255,255,255,0.95)", paddingHorizontal: 6, borderRadius: 4, flexDirection: "row", alignItems: "center" },
  smallText: { fontSize: 13, marginLeft: 2, fontWeight: "500" },
  content: { padding: 12 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 22, flex: 1 },
  rating: { flexDirection: "row", backgroundColor: "#00c569", paddingHorizontal: 5, borderRadius: 6, alignItems: "center" },
  ratingText: { color: "#fff", fontSize: 12 },
  addressRow: { flexDirection: "row", alignItems: "center" },
  address: { fontSize: 15,  color: "#666", marginLeft: 2 },
  dishRow: { flexDirection: "row", alignItems: "center", marginTop: -8 },
  dish: { fontSize: 15, color: "#666" },
  category: { fontSize: 15, color: "#666", marginLeft: 2 },
});
