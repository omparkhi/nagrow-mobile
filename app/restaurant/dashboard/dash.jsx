import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { useSelector, useDispatch } from "react-redux";
// import { fetchResProfile } from "@/redux/slices/restaurant/authSlice";
import DashboardMetricsRow from "./dash-metrix";
import ActiveOrders from "./active-orders";
import LottieView from "lottie-react-native";
import LiveOrder from "@/assets/live-order.json"
import PopularMenuInsights from "./menu-insight";
// import LogoutButton from "./logout";
import LogoutButton from "./logout-button";
import { fetchOrder } from "@/redux/slices/restaurant/orderSlice";
import GetOrder from "../order/get-order";
import Header from "../header";
import { useRouter } from "expo-router";
import NagrowToast from "@/app/toast/NagrowToast";

export default function Dashboard({ navigation }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { restaurant } = useSelector(state => state.restaurantAuth);
     const [isOpen, setIsOpen] = useState(false);
  const { active, list, loadingList } = useSelector(state => state.orders);


    useEffect(() => {
      dispatch(fetchOrder(restaurant?._id));
    }, [restaurant]);

    useEffect(() => {
  console.log(restaurant);
}, [restaurant]);


    // useEffect(() => {
    //   console.log(list)
    // }, []);

 
  return (
    <ScrollView style={{ flex: 1 }}>
      <NagrowToast/>
      <DashboardMetricsRow/>
      <ActiveOrders activeOrders={active} />
      <PopularMenuInsights  />
      
      <LogoutButton/>
      <LottieView source={LiveOrder} autoPlay loop style={{ marginHorizontal: "auto", width: 250, height: 250 }}/>
      {/* <Text>Dashboard</Text> */}
      
    </ScrollView>
  );
}



