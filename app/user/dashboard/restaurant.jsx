import React, { useEffect, useState, useRef } from "react";
import { View, Image, FlatList, StyleSheet, Dimensions, InteractionManager } from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons"; 
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurants } from "@/redux/slices/user/restaurantSlice";
import { useRouter } from "expo-router";
import AppText from "@/components/AppText";
import * as Location from "expo-location";
import { RestaurantSkeleton } from "../loader/RestaurantSkeleton";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, Bookmark } from "lucide-react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { addFavorite, getMyFavorites } from "@/redux/slices/user/favoriteSlice";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32; // 16 padding each side + 16 gap between cards

export default function Restaurant({ filterMode = "OFF", categoryFilter = null }) {
  // const [vegFilterMode, setVegFilterMode] = useState("OFF");
  const hasFetchedRef = React.useRef(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: restaurants, loading } = useSelector((state) => state.restaurants);
  const selectedAddress = useSelector((state) => state.address.selectedAddress);
  const menuId = restaurants?.featuredDish?._id;
  const favoriteIds = useSelector(state => state.favorites?.favoriteIds);

  const [favorite, setFavorite] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [locationFetched, setLocationFetched] = useState(false);

  useEffect(() => {
    // if (favoriteIds.length === 0) {
      dispatch(getMyFavorites());
    // }
  }, []);

  // console.log("FULL FAVORITE SLICE:", useSelector(state => state.favorites.favoriteIds));



//   useEffect(() => {
//   console.log("Favorites updated:", favoriteIds);
// }, [favoriteIds]);
// const featuredDishId = ;
//           const isFav = featuredDishId 
//             ? favoriteIds.includes(featuredDishId) 
//             : false;
  const handleToggleFavorite = (restaurantId, menuItemId) => {
    dispatch(addFavorite({ restaurantId, menuItemId }));
  };
  const toggleBookmark = (id) => setBookmarks(prev => ({ ...prev, [id]: !prev[id] }));

  // useEffect(() => {
  //   console.log("selecet address:", selectedAddress);
  // }, []);
  // useEffect(() => {
  //   dispatch(fetchRestaurants());
  // }, []);

 useEffect(() => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;
     const init = async () => {
      // 1. DECLARE VARIABLES HERE
      let lat, lng; 

      try {
        // Check if we have a saved address in Redux
        const saveAddress = selectedAddress?.coordinates?.coordinates; // Optional chaining is safer

      if (saveAddress && saveAddress.length === 2) {
          // Use Saved Address
        lat = saveAddress[1];
        lng = saveAddress[0];
      } else {
        // 2. Fallback to Live GPS (Requires popup)
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
      }

      // Only dispatch if we actually have coordinates
      if (lat && lng) {
          dispatch(fetchRestaurants({ lat, lng }));
        
      } else {
        // Fallback if permission denied or no address
        dispatch(fetchRestaurants({}));
      }

      } catch (err) {
        console.log("Error fetching location", err);
        dispatch(fetchRestaurants({}));
      } 
    };

    init();
  }, [selectedAddress]); // Add selectedAddress to dependency array so it updates if user changes address
  //  useEffect(() => {
  //   console.log("Fetched Restaurants:", restaurants);
  // }, [restaurants]);


  const filteredRestaurants = restaurants.filter(restaurant => {
    
    // --- 1. VEG FILTER LOGIC (Keep this) ---
    let matchesVeg = true;
    if (filterMode === "PURE_VEG") {
      matchesVeg = restaurant.isPureVeg === true;
    }
    // (Add logic for VEG_ALL if needed)

    // --- 2. CATEGORY FILTER LOGIC (Add this) ---
    let matchesCategory = true;
    if (categoryFilter) {
      // Check if the restaurant's featured dish category matches the selected one
      // We use toLowerCase() to avoid case mismatch (e.g. "Cake" vs "cake")
      const dishCategory = restaurant.featuredDish?.category?.toLowerCase();
      const searchKey = categoryFilter.toLowerCase();
      
      // matchesCategory = dishCategory === searchKey;
      
      // OR if you want partial matches (e.g. "Cheese Cake" matches "cake"):
      matchesCategory = dishCategory && dishCategory.includes(searchKey);
    }

    // RETURN TRUE ONLY IF BOTH MATCH
    return matchesVeg && matchesCategory;
  });

  // const handleVegFilterChange = (mode) => {
  //   setVegFilterMode(mode);
  // };


  if (loading)  {
    return (
      <View style={styles.container}>
        <AppText  variant="label" style={styles.heading}>Top Restaurants to Explore</AppText>
        {/* Render 2 Skeletons to fill the screen */}
        {[1, 2].map((key) => (
          <RestaurantSkeleton key={key} />
        ))}
      </View>
    );
  } 

  return (
    <View style={styles.container}>
      <AppText  variant="label" style={styles.heading}>Top Restaurants to Explore</AppText>

      <FlatList
        data={filteredRestaurants}
        extraData={[favoriteIds]}
        keyExtractor={(restaurant) => restaurant._id}
        // numColumns={2}
        // columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
        renderItem={({ item: restaurant }) => {
          const featuredDishId = restaurant.featuredDish?._id?.toString();
          const isFav = favoriteIds.includes(featuredDishId);

          return (
          <TouchableOpacity
            navigate={true}
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
              {/* <TouchableOpacity onPress={() => toggleBookmark(restaurant._id)} style={styles.iconButton}>
                <Bookmark size={18} color={bookmarks[restaurant._id] ? "green" : "white"} fill={bookmarks[restaurant._id] ? "green": "white"} />
              </TouchableOpacity> */}
              <TouchableOpacity onPress={() => handleToggleFavorite(restaurant._id, featuredDishId)} style={styles.iconButton}>
                <Heart size={20} color={isFav ? "#ffffffff" : "white"} fill={isFav ? "#ff0084ff" : "hsla(0, 0%, 100%, 0.00)"} />
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
            
            <View>
              <LinearGradient 
                colors={['#e9ebf1ff', 'rgba(255,255,255,0)']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 0.95, y: 0 }}
                style={styles.titleRow}
              >
                <AppText style={styles.title} numberOfLines={1}>{restaurant.name}</AppText>
              
                <View style={styles.rating}>
                  <AppText style={styles.ratingText}>{restaurant.rating || "3.0"} ({restaurant.totalRatings || "20"}+)</AppText>
                  <Ionicons name="star" size={12} color="white" style={{ marginLeft: 2 }} />
                </View>
              </LinearGradient>
              <LinearGradient 
                colors={['#20265cff', 'rgba(255,255,255,0)']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 0.95, y: 0 }}
                style={{ width: "100%", height: 1 }}
              ></LinearGradient>
            <View style={styles.content}>
              <View style={styles.addressRow}>
                {/* <Ionicons name="location" size={12} color="#666" /> */}
                <AppText variant="light" style={styles.address}>{restaurant.address.street}</AppText>
              </View>

              <View style={styles.dishRow}>
                <AppText variant="light" style={styles.dish}>{restaurant.featuredDish?.name}</AppText>
                <AppText variant="light" style={styles.category}> • {restaurant.featuredDish?.category}</AppText>
              </View>
            </View>
            </View>
          </TouchableOpacity>
        )}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, marginTop: 10 },
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
  iconButton: {  borderRadius: 999, padding: 4, marginLeft: 4 },
  deliveryTime: { position: "absolute", top: 112, right: 8, backgroundColor: "rgba(255,255,255,0.95)", paddingHorizontal: 6, borderRadius: 4, flexDirection: "row", alignItems: "center" },
  distance: { position: "absolute", top: 112, left: 8, backgroundColor: "rgba(255,255,255,0.95)", paddingHorizontal: 6, borderRadius: 4, flexDirection: "row", alignItems: "center" },
  smallText: { fontSize: 13, marginLeft: 2, fontWeight: "500" },
  content: { paddingHorizontal: 12 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 7 },
  title: { fontSize: 20, flex: 1, textTransform: "capitalize" },
  rating: { flexDirection: "row", backgroundColor: "#00c569", paddingHorizontal: 5, borderRadius: 6, alignItems: "center" },
  ratingText: { color: "#fff", fontSize: 12 },
  addressRow: { flexDirection: "row", alignItems: "center" },
  address: { fontSize: 14, fontFamily: "Nunito",  color: "#666", marginLeft: 2, paddingVertical: 2 },
  dishRow: { flexDirection: "row", alignItems: "center" },
  dish: { fontSize: 14, fontFamily: "Nunito", color: "#666", paddingLeft: 2, paddingBottom: 5  },
  category: { fontSize: 14, fontFamily: "Nunito", color: "#666", marginLeft: 2, paddingBottom: 5 },
});
