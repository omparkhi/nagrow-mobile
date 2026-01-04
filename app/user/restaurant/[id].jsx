import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, InteractionManager, StyleSheet, View } from "react-native";
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { fetchRestaurantById } from "@/redux/slices/user/restaurantSlice";
import RestaurantHeader from "./header";
import RestaurantMenu from "./menu";
import AppText from "@/components/AppText";
import RestaurantMenuSkeleton from "../loader/RestaurantMenuSkeleton";
import { useBottomBarVisibility } from "@/app/context/NavBarVisibilityContext";
import AnimatedNavbar from "../component/AnimatedNavbar";

export default function RestaurantPage() {
  const { setVisible } = useBottomBarVisibility();
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const { restaurant, menu, loading } = useSelector((s) => s.restaurants);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  })

  useEffect(() => {
      dispatch(fetchRestaurantById(id));
  }, [id]);

  useEffect(() => {
    setVisible(false);     // Hide header
    return () => setVisible(true);  // Show header again when leaving page
  }, []);

  useEffect(() => {
    console.log("menu: ", menu)
  },[]);

  
  // if () return <AppText>Restaurant not found</AppText>;

  if (loading || !restaurant || !menu) return <RestaurantMenuSkeleton />;

  return (
    
    <View style={styles.container}>
      <AnimatedNavbar scrollY={scrollY} title={restaurant?.name} />
      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16} // Required for smooth animation
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
      <RestaurantHeader restaurant={restaurant} />
        <RestaurantMenu menu={menu || {}} restaurant={restaurant} />
      </Animated.ScrollView>
    </View>
    
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
