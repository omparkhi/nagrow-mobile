import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { fetchRestaurantById } from "@/redux/slices/user/restaurantSlice";
import RestaurantHeader from "./header";
import RestaurantMenu from "./menu";
import AppText from "@/components/AppText";

export default function RestaurantPage() {
    const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const { restaurant, menu, loading } = useSelector((s) => s.restaurants);

  useEffect(() => {
    dispatch(fetchRestaurantById(id));
  }, [id]);

  if(loading) return <AppText>Loading...</AppText>
  if (!restaurant) return <AppText>Restaurant not found</AppText>;


  return (
    <ScrollView>
        <RestaurantHeader restaurant={restaurant} />
        <RestaurantMenu menu={menu} restaurant={restaurant} />
    </ScrollView>
  )
}
