// app/user/_layout.jsx
import { Slot } from "expo-router";
import ProtectedRoute from "./protectedRoute";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartSummaryBar from "./cart/cart-bar";
import { fetchUser } from "@/redux/slices/user/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { connectSocket, getSocket } from "@/services/connectSocket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../ToastContext";
// import { fetchOrderById } from "@/redux/slices/restaurant/orderSlice";
import { fetchActiveOrders, fetchOrderById, updateActiveOrderStatus } from "@/redux/slices/user/userOrderSlice";
import orderSound from "@/assets/notification/order.mp3";
import { Audio } from "expo-av";
import {  useRef } from "react";
// import { playOrderUpdateSound } from "@/hooks/user-order-notification";
import { playOrderUpdateSound } from "@/hooks/notification";
import { setRouteCache, setRouteFetched } from "@/redux/slices/map/mapSlice";
import PolylineDecoder from "@mapbox/polyline";
import { setETA } from "@/redux/slices/map/mapSlice";
import { saveLastRiderLocation } from "@/redux/slices/rider/riderLocationSlice";
import { usePushNotification } from "@/hooks/usePushNotification";
import LiveOrderFloat from "./LiveOrderFloat";
import UserBottomNav from "./navigation/UserBottomNav";
import { NavBarVisibilityProvider, useBottomBarVisibility } from "../context/NavBarVisibilityContext";

// import { GlobalLoaderProvider } from "../context/GlobalLoaderContext";
// import { NavProvider } from "../NavContext";

export default function UserLayout () {
  return (
    <NavBarVisibilityProvider>
      <UserLayoutContent />
    </NavBarVisibilityProvider>
  )
}

function UserLayoutContent() {
  const { visible } = useBottomBarVisibility();
  const soundRef = useRef(null);
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  usePushNotification(user?._id, "user");
  
  useEffect(() => {
    dispatch(fetchUser());
    // Fetch ALL active orders on app launch so the list is ready
    dispatch(fetchActiveOrders());
  }, [dispatch]);

useEffect(() => {
    // 1. Declare socket variable here so cleanup can see it
    let socket = null;

    // 2. Define handlers (defined outside so they are stable)
    const handleOrderStatus = (data) => {
        console.log("GLOBAL ORDER STATUS:", data);
        playOrderUpdateSound();
        showToast(`Order ${data.orderNo}`, `Your Order is now ${data.status}`);
        // OPTIMIZATION: Update Redux state directly instead of API call
        dispatch(updateActiveOrderStatus({
            orderId: data.orderId,
            status: data.status,
            riderId: data.riderId // if available in payload
        }));
        dispatch(fetchOrderById(data.orderId));
    };

    

    // 3. Init Function
    const initSocket = async () => {
      if (!user?._id) return;
      
      const userId = user._id;
      // ✅ FIX: Default to "user" if AsyncStorage is null
      const typeFromStorage = await AsyncStorage.getItem("userType");
      const userType = typeFromStorage || "user"; 

      console.log("Found User Type:", userType); // This should now print

      socket = getSocket();
      
      if (!socket) {
        console.log("❌ Socket instance is null. Make sure connectSocket() runs in App.js");
        return;
      }

      // Join Room
      socket.emit("joinRoom", { 
        roomType: userType, 
        roomId: userId 
      });
      console.log(`🔌 User Joined Room: ${userType}_${userId}`);

      // Attach Listeners
      // socket.on("order:eta:update", handleEtaUpdate);
      socket.on("order:status", handleOrderStatus);
    };

    // 4. Execute Init
    initSocket();

    // 5. ✅ FIX: Cleanup must be returned by useEffect, NOT initSocket
    return () => {
      if (socket) {
        console.log("Cleaning up socket listeners...");
        socket.off("order:status", handleOrderStatus);
        // socket.off("order:route:init", handleRouteInit);
      }
    };

  }, [user?._id]);



  return (
    <ProtectedRoute>
        <View style={styles.cartWrapper}>
          <CartSummaryBar />
        </View>
      
        {/* <LiveOrderFloat/> */}
        <Slot /> 
       {/* renders /user/index.jsx or /user/profile.jsx */}
       <UserBottomNav /> 
      
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  cartWrapper: {
    position: "absolute",
    bottom: 0, 
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
  },
});
