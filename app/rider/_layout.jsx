import { useEffect, useState } from "react";
import { fetchRiderProfile } from "@/redux/slices/rider/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import CartSummaryBar from "../user/cart/cart-bar";
import { router, Slot } from "expo-router";
import RiderProtectedRoute from "./RiderProtectedRoute";
import RiderHeader from "./rider-header";
import AppText from "@/components/AppText";
import RiderSidebar from "./rider-sidebar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connectSocket, getSocket } from "@/services/connectSocket";
import useRiderLocation from "@/hooks/use-rider-location";
import { HeaderVisibilityProvider, useHeaderVisibility } from "../context/HeaderVisibilityContext";
import { setDeliveryRequest } from "@/redux/slices/rider/riderDeliverySlice";
import { useToast } from "../ToastContext";
import { fetchRiderOrder } from "@/redux/slices/rider/riderOrderSlice";
import { setETA } from "@/redux/slices/map/mapSlice";
import { saveLastRiderLocation } from "@/redux/slices/rider/riderLocationSlice";
import { playNewOrderSound, playOrderUpdateSound } from "@/hooks/notification";
import { usePushNotification } from "@/hooks/usePushNotification";
// import { setETA }

export default function RiderLayout () {
    return (
        <HeaderVisibilityProvider>
            <RiderLayoutContent/>
        </HeaderVisibilityProvider>
    )

}
function RiderLayoutContent() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
     const [socketReady, setSocketReady] = useState(false);
     // NEW: Local state for immediate ID access
  const [localRiderId, setLocalRiderId] = useState(null);
    const dispatch = useDispatch();
    const { visible } = useHeaderVisibility();
    const { rider, loading, error} = useSelector(state => state.riderAuth);
    const isTracking = useSelector((state) => state.riderTracking.isTracking);
    const riderId = rider?._id;
    const { showToast } = useToast();

  // Debugging Log (Add this to see why it fails)
  useEffect(() => {
    console.log("🔋 Tracking Status Check:");
    console.log("  - Redux isTracking:", isTracking);
    console.log("  - Rider ID:", activeRiderId);
    console.log("  - Socket Ready:", socketReady);
    console.log("  -> HOOK ACTIVE?", canStartTracking);
  }, [isTracking, activeRiderId, socketReady]);
    usePushNotification(riderId, "rider");

  useEffect(() => {
   console.log("isTracking changed in layout:", isTracking);
}, [isTracking]);

  // 2. Pass the LOCAL ID to the hook
  // If Redux rider._id isn't ready, we use localRiderId
  // const activeRiderId = rider?._id || localRiderId;
  const activeRiderId = rider?._id || localRiderId; // use AsyncStorage as fallback
  const canStartTracking = isTracking && activeRiderId && socketReady;
  useEffect(() => {
    console.log("canStartTracking:", canStartTracking);
    console.log("isTracking:", isTracking);
    console.log("activeRiderId:", activeRiderId === rider?._id || localRiderId);
    console.log("socketReady:", socketReady);
  }, []);

    useRiderLocation({ 
      isTracking, // Force true to test, or use `isTracking` from redux if persisted
      riderId: activeRiderId,
  });

      // 1. IMMEDIATE: Load ID from storage (Don't wait for API)
  useEffect(() => {
    const loadLocalId = async () => {
        const id = await AsyncStorage.getItem("riderId");
        if(id) setLocalRiderId(id);
    };
    loadLocalId();
    dispatch(fetchRiderProfile()); // Fetch fresh data in background
  }, []);

  // 2. Socket Readiness Check (Keep as is)
    useEffect(() => {
        const interval = setInterval(() => {
            const s = getSocket();
            if (s) {
                setSocketReady(true);
                clearInterval(interval);
            }
        }, 300);
        return () => clearInterval(interval);
    }, []);


    // useEffect(() => {
    //     dispatch(fetchRiderProfile());
    // }, []);

    // useEffect(() => {
    //     console.log("rider info:", rider);
    // }, []);

    // socket
    useEffect(() => {
        const initSocket = async () => {
            if (!activeRiderId) return;
            // const riderId = rider?._id;
                
                const riderId = await AsyncStorage.getItem("riderId");
                const userType = await AsyncStorage.getItem("userType");

                if (!riderId || !userType) return;

                const socket = getSocket();

                if (!socket) return;

                // console.log("riderId:", riderId);
                // console.log("userType:", userType);
                // console.log("token:", token);

                socket.emit("joinRoom", { 
                    roomType: userType, 
                    roomId: activeRiderId 
                });


            }   

        initSocket();
    }, [activeRiderId, socketReady]);


    useEffect(() => {
  if (!socketReady) return;

  const socket = getSocket();



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

  const handleOrderStatus = async (data) => {
    console.log("Restaurant mark or ready", data);
    playOrderUpdateSound();
    // Check specific status
            if(data.status === 'ready') {
                 showToast(`${data.orderNo}`, "Order is Ready for Pickup!");
            } else {
                 showToast(`${data.orderNo}`, `Order is ${data.status}`);
            }
    dispatch(fetchRiderOrder(data.orderId));

    // 2. ✅ ADD THIS: Fetch Profile to sync 'currentOrderId' and status in riderAuth slice
        dispatch(fetchRiderProfile());
  }
 

  // eta updates
  socket.on("order:eta:update", handleEtaUpdate);
  socket.on("order:status", handleOrderStatus);

  socket.on("delivery:request", (data) => {
    playNewOrderSound();
    console.log("📦 New Delivery Request:", data);
    showToast(`Order ${data.orderNo}`, "New Delivery Received");
    dispatch(setDeliveryRequest(data));
  });



// ✅ FIX: Clean up ALL listeners to prevent memory leaks
        return () => {
            socket.off("delivery:request");
            socket.off("order:status");
            socket.off("order:eta:update"); // Was missing
        }
}, [socketReady]);


    // if (loading || !rider) return <AppText>Loading</AppText>

    return (
        <RiderProtectedRoute>
            {visible && <RiderHeader onMenuPress={() => setSidebarOpen(true)}/>}
            <RiderSidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} navigation={router} />
            <Slot /> 
        </RiderProtectedRoute>
    )

}