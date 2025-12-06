// app/user/_layout.jsx
import { Slot } from "expo-router";
import ProtectedRoute from "./protectedRoute";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartSummaryBar from "./cart/cart-bar";
import { fetchUser } from "@/redux/slices/user/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { connectSocket, getSocket } from "@/services/connectSocket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../ToastContext";
import { fetchOrderById } from "@/redux/slices/restaurant/orderSlice";
import orderSound from "@/assets/notification/order.mp3";
import { Audio } from "expo-av";
import {  useRef } from "react";
import { playOrderUpdateSound } from "@/hooks/user-order-notification";


export default function UserLayout() {
  const soundRef = useRef(null);
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  
  useEffect(() => {
    dispatch(fetchUser());
  }, []);


  useEffect(() => {
    const initSocket = async () => {
      if (!user?._id) return;
      const userId = await AsyncStorage.getItem("userId");
      const userType = await AsyncStorage.getItem("userType");

      if (!userId || !userType) return;

      const socket = getSocket();
      if (!socket) return;            // not initialized yet
      if (!socket.connected) return;
      // console.log("userId:", userId);
      // console.log("userType:", userType);

      socket.emit("joinRoom", { 
        roomType: userType, 
        roomId: userId 
      });

      const handleOrderStatus = async(data) => {
        console.log("GLOBAL ORDER STATUS:", data);
        playOrderUpdateSound();
        showToast(
          `Order ${data.orderId}`,
          `Status changed to ${data.status}`
        );

        // IF user is inside an order page, Redux page will re-fetch
        dispatch(fetchOrderById(data.orderId));
      }

      // GLOBAL ORDER STATUS LISTENER (ALWAYS ACTIVE)
      socket.on("order:status", handleOrderStatus);
    
    
      return () => {
        socket.off("order:status", handleOrderStatus);
      };
    }
  initSocket();
  }, []);

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.cartWrapper}>
        <CartSummaryBar />
      </SafeAreaView>
      <Slot /> 
       {/* renders /user/index.jsx or /user/profile.jsx */}
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  cartWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: "center",
  },
});
