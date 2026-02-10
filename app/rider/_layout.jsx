import { useEffect, useRef, useState } from "react";
import { fetchRiderProfile } from "@/redux/slices/rider/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { router, Slot } from "expo-router";
import RiderProtectedRoute from "./RiderProtectedRoute";
import RiderHeader from "./rider-header";
import RiderSidebar from "./rider-sidebar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSocket } from "@/services/connectSocket";
import useRiderLocation from "@/hooks/use-rider-location";
import { HeaderVisibilityProvider, useHeaderVisibility } from "../context/HeaderVisibilityContext";
import { setDeliveryRequest } from "@/redux/slices/rider/riderDeliverySlice";
// import { useToast } from "../ToastContext";
import { fetchRiderOrder } from "@/redux/slices/rider/riderOrderSlice";
import { setETA } from "@/redux/slices/map/mapSlice";
import { saveLastRiderLocation } from "@/redux/slices/rider/riderLocationSlice";
import { playNewOrderSound, playNewOrderSoundForRider, playOrderUpdateSound } from "@/hooks/notification";
import { usePushNotification } from "@/hooks/usePushNotification";
import { AppState } from "react-native";
import { current } from "@reduxjs/toolkit";
import axios from "axios";
import useOrderSound from "@/hooks/useOrderSound";
import * as Notifications from 'expo-notifications';
import { NavBarVisibilityProvider } from "../context/NavBarVisibilityContext";
import RiderBootomBar from "./component/RiderBottomBar";
import { RiderNavBarVisibilityProvider } from "../context/RiderNavBarVisiblityContext";

// import { setETA }

export default function RiderLayout () {
    return (
        // // <HeaderVisibilityProvider>
        // <NavBarVisibilityProvider>
            
        // </NavBarVisibilityProvider>
        // // </HeaderVisibilityProvider>
        <RiderNavBarVisibilityProvider>
          <RiderLayoutContent/>
        </RiderNavBarVisibilityProvider>
    )

}
function RiderLayoutContent() {
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  // NEW: Local state for immediate ID access
  const [localRiderId, setLocalRiderId] = useState(null);
  // const { visible } = useHeaderVisibility();
  const { rider } = useSelector(state => state.riderAuth);
  const isTracking = useSelector((state) => state.riderTracking.isTracking);
  const riderId = rider?._id;
  const activeRiderId = riderId || localRiderId;
  // const { showToast } = useToast();

  const appState = useRef(AppState.currentState);

  const { playSound } = useOrderSound();

    // 1. Initial Setup: Load ID & Profile
  useEffect(() => {
    const init = async () => {
      const id = await AsyncStorage.getItem("riderId");
        if (id) setLocalRiderId(id);
        dispatch(fetchRiderProfile());
      };
      init();
  }, []);

  // THE NEW INBOX CHECK (Replaces Socket Check)
  // This runs when App Opens OR comes to Foreground
  const checkForMissedOrders = async (currentId) => {
    if (!currentId) return;

    try {
      console.log("📥 Checking Redis Inbox for pending offers...");
      const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/rider/offer/pending/${currentId}`);

      if (res.data.success && res.data.offer) {
        console.log("🔥 FOUND MISSED ORDER:", res.data.offer.orderNo);
        // playSound();
        // playNewOrderSound();
        // playNewOrderSoundForRider();

        dispatch(setDeliveryRequest(res.data.offer));
      } else {
        console.log("📭 Inbox empty");
      }
    } catch (err) {
      console.log("Inbox Check Fail:", err.message);
    }
  }

  // 3. App State Listener (Background -> Foreground)
  useEffect(() => {
    if (!activeRiderId) return;

    // Check immediately on mount
    checkForMissedOrders(activeRiderId);

    // Listener for Resume
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("📱 App came to foreground!");
        checkForMissedOrders(activeRiderId);
      }
      appState.current = nextAppState;
    });

    return() => {
      subscription.remove();
    };
  }, [activeRiderId]);

  // 🔔 4. NEW: FCM FOREGROUND LISTENER (The Backup Trigger)
  // If Socket fails, this catches the notification and opens the modal!
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
       const data = notification.request.content.data;
       
       // Check if this notification is an Order Request
       if (data && (data.orderId || data.orderNo)) {
           console.log("🔔 FCM Backup Triggered for Order:", data.orderNo);
           
           // 1. Play Sound (Force it here too)
          //  playSound();

           // 2. Open Modal (Redux handles duplicates, so it's safe to call twice)
           dispatch(setDeliveryRequest(data));
       }
    });

    return () => subscription.remove();
  }, []);

  // 2. Poll for So
  // cket Readiness (Standardized)
  useEffect(() => {
    const interval = setInterval(() => {
      const s = getSocket();
        if (s && s.connected) { // Check .connected property
          setSocketReady(true);
          clearInterval(interval);
        }
      }, 500);
    return () => clearInterval(interval);
  }, []);

  usePushNotification(riderId, "rider");

// ✅ FIX: Handle Room Joining + Reconnection Support
  useEffect(() => {
    if (!socketReady || !activeRiderId) return;

    const socket = getSocket();

    // A. Define Room Joining Function
    const joinRoom = async () => {
      const userType = await AsyncStorage.getItem("userType");
      if (!userType) return;

      console.log(`🔌 Joining Room: ${activeRiderId} as ${userType}`);
      socket.emit("joinRoom", { roomType: "rider", roomId: activeRiderId });
            
      // "Mailbox Check": Ask server for any missed orders immediately
      socket.emit("rider:check_pending", activeRiderId);
    };
    // Join immediately
    joinRoom();

    // Re-join if connection drops and comes back
    socket.on("connect", joinRoom);

    // B. Define Event Handlers
    const handleDeliveryRequest = (data) => {
      console.log("📦 DELIVERY REQUEST RECEIVED:", data);
      try {
        // 2. Play Sound (Safely)
        // try { playNewOrderSoundForRider(); } catch (e) { console.log("Sound Error:", e); }
        // 3. UI Updates
        // showToast(`Order ${data.orderNo}`, "New Delivery Received");
        // Redux update
        dispatch(setDeliveryRequest(data));
      } catch (err) {
        console.log("❌ CRITICAL UI ERROR (This disconnects socket):", err);
      }
    }

    const handleOrderStatus = async (data) => {
      console.log("Restaurant mark or ready", data);
      playOrderUpdateSound();
      // Check specific status
      // if(data.status === 'ready') {
      //   showToast(`${data.orderNo}`, "Order is Ready for Pickup!");
      // } else {
      //   showToast(`${data.orderNo}`, `Order is ${data.status}`);
      // }
      dispatch(fetchRiderOrder(data.orderId));

      // 2. ✅ ADD THIS: Fetch Profile to sync 'currentOrderId' and status in riderAuth slice
      dispatch(fetchRiderProfile());
    }

    const handleEtaUpdate = async (data) => {
      const eta = {
        etaMinutes: data.etaMinutes,
        remainingMeters: data.remainingMeters,
      }
      console.log("eta in rider:", eta)
      dispatch(setETA(eta));
      // rider location update
      dispatch(saveLastRiderLocation(data.riderLoc))
    }

    socket.on("delivery:request", handleDeliveryRequest);
    socket.on("order:status", handleOrderStatus);
    socket.on("order:eta:update", handleEtaUpdate);

    // D. Cleanup
    return () => {
      socket.off("connect", joinRoom);
      socket.off("delivery:request", handleDeliveryRequest);
      socket.off("order:status", handleOrderStatus);
      socket.off("order:eta:update", handleEtaUpdate);
    };
  }, [activeRiderId, socketReady]);

  useRiderLocation({ 
    isTracking, // Force true to test, or use `isTracking` from redux if persisted
    // riderId: activeRiderId,
  });

    // if (loading || !rider) return <AppText>Loading</AppText>

  return (
    <RiderProtectedRoute>
      <Slot /> 
      <RiderBootomBar />
    </RiderProtectedRoute>
  )

}
