import React, { useEffect, useState, useRef } from "react";
import { View, Image, FlatList, StyleSheet, Dimensions, InteractionManager, Animated } from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons"; 
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurants } from "@/redux/slices/user/restaurantSlice";
import { useRouter } from "expo-router";
import AppText from "@/components/AppText";
import * as Location from "expo-location";
import { RestaurantSkeleton } from "../loader/RestaurantSkeleton";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, Bookmark, Dot } from "lucide-react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { addFavorite, getMyFavorites } from "@/redux/slices/user/favoriteSlice";
// import Animated from "react-native-reanimated";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32; // 16 padding each side + 16 gap between cards

function Restaurant({ filterMode = "OFF", categoryFilter = null, activeFilters = [] }) {
  // const [vegFilterMode, setVegFilterMode] = useState("OFF");
  const hasFetchedRef = React.useRef(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: restaurants, loading } = useSelector((state) => state.restaurants);
  const selectedAddress = useSelector((state) => state.address.selectedAddress);
  const menuId = restaurants?.featuredDish?._id;
  const favoriteIds = useSelector(state => state.favorites?.favoriteIds);
  const [optimisticFavs, setOptimisticFavs] = useState({});

  const scale = useRef(new Animated.Value(1)).current;


  const [favorite, setFavorite] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [locationFetched, setLocationFetched] = useState(false);

  useEffect(() => {
    // if (favoriteIds.length === 0) {
      dispatch(getMyFavorites());
    // }
  }, []);

  useEffect(() => {
    if (!favoriteIds) return;
    
    const map = {};
    favoriteIds.forEach(id => {
      map[id] = true;
    });

    setOptimisticFavs(map);
  }, [favoriteIds]);

  const animateHeart = () => {
  Animated.sequence([
    Animated.spring(scale, {
      toValue: 1.15,
      useNativeDriver: true,
    }),
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }),
  ]).start();
};



  const handleToggleFavorite = async (restaurantId, menuItemId, animate) => {
    setOptimisticFavs(prev => ({
      ...prev, 
      [menuItemId]: !prev[menuItemId],
    }));

    animate?.();

    try {
      const res = await dispatch(
        addFavorite({ restaurantId, menuItemId })
        ).unwrap();
    } catch (err) {
      setOptimisticFavs(prev => ({
        ...prev,
        [menuItemId]: !prev[menuItemId],
      }));
       console.log("Favorite failed, reverted");
    }
    
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
    if (categoryFilter) {
      const dishCategory = restaurant.featuredDish?.category?.toLowerCase();
      const searchKey = categoryFilter.toLowerCase();
      if (!dishCategory || !dishCategory.includes(searchKey)) return false;
    }

    // A. Pure Veg Chip
    if (activeFilters.includes('pure_veg')) {
       if (restaurant.isPureVeg !== true) return false;
    }

    // B. Rating 4.0+ Chip
    if (activeFilters.includes('rating')) {
       // specific check: if rating is less than 4, hide it
       // (Ensure restaurant.rating is a number)
       if (!restaurant.rating || parseFloat(restaurant.rating) < 3.5) return false;
    }

    // C. Offers Chip (Example logic)
    if (activeFilters.includes('offers')) {
        // Assuming you have an 'hasOffer' boolean or similar
        if (!restaurant.hasOffer) return false; 
    }

    // If it passes all checks, keep it
    return true;
  });

  const handleNavigate = (id) => {
    InteractionManager.runAfterInteractions(() => {
      router.push(`/user/restaurant/${id}`)
    });
  };

  // --- 4. SORTING LOGIC (Optional, runs after filtering) ---
  // If "Nearest" is selected, we usually sort, not filter.
  const finalList = [...filteredRestaurants].sort((a, b) => {
      if (activeFilters.includes('nearest')) {
          // Parse "3.5 km" to 3.5 float
          const distA = parseFloat(a.distance) || 0;
          const distB = parseFloat(b.distance) || 0;
          return distA - distB; // Ascending order
      }
      return 0; // Default order
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
        data={finalList}
        extraData={[favoriteIds]}
        keyExtractor={(restaurant) => restaurant._id}
        // numColumns={2}
        // columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
        renderItem={({ item: restaurant }) => {
          const previewItemsId = restaurant.previewItems?.[0]?._id?.toString();
          const isFav = !!optimisticFavs[previewItemsId];

          return (
          <TouchableOpacity
            navigate={true}
            style={[styles.card, { width: CARD_WIDTH }]}
            onPress={() => handleNavigate(restaurant._id)}
          >
            {/* Image */}
            <Image
              source={{ uri: restaurant.previewItems?.[0]?.image }}
              style={styles.image}
            />

            {/* Top buttons */}
            <Animated.View style={{ position: "absolute", top: 8, right: 8, flexDirection: "row", gap: 8, transform: [{ scale }] }}>
              {/* <TouchableOpacity onPress={() => toggleBookmark(restaurant._id)} style={styles.iconButton}>
                <Bookmark size={18} color={bookmarks[restaurant._id] ? "green" : "white"} fill={bookmarks[restaurant._id] ? "green": "white"} />
              </TouchableOpacity> */}
              <TouchableOpacity onPress={() => handleToggleFavorite(restaurant._id, previewItemsId, animateHeart)} style={styles.iconButton}>
                <Heart size={20} color={isFav ? "#ffffffff" : "white"} fill={isFav ? "#ff0084ff" : "hsla(0, 0%, 100%, 0.00)"} />
              </TouchableOpacity>
            </Animated.View>

            {/* Delivery Time */}
            <View style={styles.deliveryTime}>
              <Feather name="clock" size={12} color="black" />
              <AppText  style={{ fontSize: 13, marginLeft: 2, color: "#666" }}>{restaurant.deliveryTimeEstimate}</AppText>
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
                <View style={styles.rating}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#00c569", padding: 2, borderRadius: 10 }}>
                    <Ionicons name="star" size={9} color="#fff"/>
                  </View>
                  <AppText style={styles.ratingText}>{restaurant.rating || "3.0"} ({restaurant.totalRatings || "20"}+)</AppText>
                  
                </View>
                <Dot size={10} color="#666" fill="#666" strokeWidth={4} />
                <AppText variant="small" style={styles.address}>{restaurant.address.street}, </AppText>
                            {/* Distance */}
            <View style={styles.distance}>
              <MaterialIcons name="speed" size={12} color="#666" />
              <AppText  style={styles.smallText}>{restaurant.distanceKm || "3.5 km"}</AppText>
            </View>
              </View>

              <View style={styles.dishRow}>
                <AppText variant="light" style={styles.dish}>{restaurant.previewItems?.[0]?.name}</AppText>
                <AppText variant="light" style={styles.category}>, {restaurant.previewItems?.[0]?.category}</AppText>
              </View>
            </View>
            </View>
          </TouchableOpacity>
        )}}
      />
    </View>
  );
}

export default React.memo(Restaurant);

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16,  },
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
    borderWidth: 1,
    borderColor: "#f5f5f5"
  },
  image: { width: "100%", height: 170, resizeMode: "cover" },
  // topRight: {  },
  iconButton: {  borderRadius: 999, padding: 4, marginLeft: 4 },
  deliveryTime: { position: "absolute", top: 141, left: 8, backgroundColor: "rgba(255,255,255,0.95)", paddingHorizontal: 6, borderRadius: 4, flexDirection: "row", alignItems: "center" },
  distance: { flexDirection: "row", alignItems: "center" },
  smallText: { fontSize: 13, marginLeft: 2, color: "#666", fontFamily: "Nunito" },
  content: { paddingHorizontal: 12 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 7 },
  title: { fontSize: 20, flex: 1, textTransform: "capitalize" },
  rating: { flexDirection: "row", gap: 5, paddingHorizontal: 5, borderRadius: 6, alignItems: "center" },
  ratingText: { color: "#666", fontSize: 13, fontFamily: "Nunito" },
  addressRow: { flexDirection: "row", alignItems: "center" },
  address: { fontSize: 14,  color: "#666", marginLeft: 2, paddingVertical: 2, fontFamily: "Nunito" },
  dishRow: { flexDirection: "row", alignItems: "center", marginTop: -5 },
  dish: { fontSize: 14, fontFamily: "Nunito", color: "#666", paddingLeft: 2, paddingBottom: 5  },
  category: { fontSize: 14, fontFamily: "Nunito", color: "#666", marginLeft: 2, paddingBottom: 5 },
});
