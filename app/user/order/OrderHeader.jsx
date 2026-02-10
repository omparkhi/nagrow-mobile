import { TouchableOpacity } from "@/app/TouchableOpacity";
import AppText from "@/components/AppText";
import { saveLastRiderLocation } from "@/redux/slices/rider/riderLocationSlice";
import { updateActiveOrderStatus } from "@/redux/slices/user/userOrderSlice";
import { getSocket } from "@/services/connectSocket";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

function OrderHeader({ user, restaurant, currentOrder }) {
    const insets = useSafeAreaInsets();
    const [now, setNow] = useState(Date.now());
    const router = useRouter();
    const { eta, remainingMeters } = useSelector((state) => state.mapState);

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        // We need both riderId (for map) and userId (for notifications/ETA)
        if (!currentOrder?.riderId || !user?._id) return;
    
        const socket = getSocket();
    
        // Handle ETA & Logic Updates (The missing part)
        const handleEtaUpdate = (data) => {
          // console.log("⚡ Live ETA Update:", data);
          const eta = {
            etaMinutes: data.etaMinutes,
            remainingMeters: data.remainingMeters,
          }
            // console.log("eta for user", eta);
            dispatch(setETA(eta));
    
          // Update Rider Location Redux (The payload contains riderLoc too!)
          if (data.riderLoc) {
            dispatch(saveLastRiderLocation(data.riderLoc));
          }
    
            dispatch(updateActiveOrderStatus({
                orderId: data.orderId,
                eta: data.etaMinutes
            }));
        };
    
    
    
        // // Handle Raw Location (Backup / Animation smoothness)
        // const handleLocation = (coords) => {
        //   dispatch(saveLastRiderLocation(coords));
        // };
        
        // Join Rider Room
        const riderRoomId = currentOrder.riderId._id || currentOrder.riderId;
        socket.emit("joinRoom", { roomType: "rider", roomId: riderRoomId });
    
        socket.on("order:eta:update", handleEtaUpdate);
        // socket.on("rider:location", handleLocation);
    
        // Cleanup
        return () => {
          socket.off("order:eta:update", handleEtaUpdate);
        //   socket.off("rider:location", handleLocation);
        };
    }, [currentOrder?.riderId, user?._id, currentOrder?._id]);

    const getTrackingStatusText = (status) => {
  switch (status) {
    case "placed":
      return "Waiting for restaurant confirmation...";
    case "accepted":
      return "Order accepted! Kitchen will start soon.";
    case "preparing":
      return "Your food is being prepared 🍳"; // Your current text
    case "ready":
      return "Food is ready! Waiting for rider.";
    case "pick_up_by_rider":
      return "Rider is picking up your order 🛍️";
    case "on the way": // Ensure this matches schema exactly (spaces vs underscores)
      return "Order is on the way! 🛵";
    case "delivered":
      return "Enjoy your meal! 😋";
    case "cancelled":
      return "This order was cancelled ❌";
    default:
      return "Tracking order...";
  }
    };

    const distanceInMeters = ["placed", "accepted", "preparing", "ready"].includes(currentOrder.status) ? currentOrder?.routeInfo?.distanceMeters : remainingMeters;


    const formatDistance = (meters) => {
        if (!meters || meters <= 0) return "";

        if (meters < 1000) {
            return `${Math.round(meters)} m away`;
        }

        return `${(meters / 1000).toFixed(1)} km away`;
    };


    const getDisplayContent = () => {
        const status = currentOrder.status;
        const isDelivered = status === "delivered";
        const isCancelled = status === "cancelled";
    
        if (["placed", "accepted", "preparing"].includes(status)) {
        let minsLeft;
        let arriveByTimeStr;

        // Check if backend provided the calculated time (New System)
        if (currentOrder.expectedDeliveryTime) {
            const targetTime = new Date(currentOrder.expectedDeliveryTime).getTime();
            // Math: Target - Now = Remaining
            minsLeft = Math.ceil((targetTime - now) / 60000);
            // Format Arrive By Time from DB
            arriveByTimeStr = new Date(currentOrder.expectedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            minsLeft = 35; // Default safety
            arriveByTimeStr = "Soon";
        }

        // 🛑 SAFETY CLAMP: 
        // If kitchen is slow, don't let it show "Arriving in -5 mins".
        // Minimum floor = Travel Time + 5 mins buffer.
        const minTravel = Math.ceil((currentOrder.routeInfo?.durationSeconds || 900) / 60);
        const minFloor = minTravel + 5; 

        if (minsLeft < minFloor) {
            minsLeft = minFloor; 
        }

        return {
            title: "Estimated Arrival",
            mainValue: `${minsLeft} min`, // Counts down: 25..24..23
            bottomText: getTrackingStatusText(status),
            distanceText: formatDistance(distanceInMeters),
            showDistance: true,
            mainColor: "#fd731dff", // Orange
            arriveByText: `Arriving by ${arriveByTimeStr}`
        }
        }

        // Rider has picked up. We ignore backend time and trust the LIVE socket ETA.
        if (["ready", "pick_up_by_rider", "on the way"].includes(status)) {
        // 'eta' comes from your Redux store (updated via handleEtaUpdate socket)
            const liveEta = eta || 15; // fallback if socket hasn't fired yet
            // Calculate dynamic "Arrive By" based on current speed
            const liveTarget = new Date(now + liveEta * 60000);
            const liveArriveStr = liveTarget.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return {
                title: "Arriving in",
                mainValue: `${liveEta} min`, // Live updates from rider GPS
                bottomText: getTrackingStatusText(status),
                distanceText: formatDistance(remainingMeters), // Live distance
                showDistance: true,
                mainColor: "#fd731dff",
                arriveByText: `Arriving by ${liveArriveStr}`
            };
        }

    if (isDelivered) {
            return {
                title: "Order Status",
                mainValue: "Delivered",
                bottomText: "Enjoy your meal! 😋",
                distanceText: "",
                showDistance: false,
                mainColor: "#16A34A", // Green
                arriveByText: "Delivered"
            };
        }

        if (isCancelled) {
            return {
                title: "Order Status",
                mainValue: "Cancelled",
                bottomText: "Refund initiated if applicable",
                distanceText: "",
                showDistance: false,
                mainColor: "#DC2626", // Red
                arriveByText: "Cancelled"
            };
        }
        // Default loading state
        return { title: "Loading...", mainValue: "--", bottomText: "", distanceText: "", showDistance: false, mainColor: "#999", arriveByText: "" };
    };

    const UI = useMemo(() => {
        return getDisplayContent(); 
    }, [currentOrder.status, eta, remainingMeters, now]);

    const orderStatus = (order) => {
        if (order.status === "placed") return "Order Confirmed";
        if (order.status === "preparing") return "Preparing your food";
        if (order.status === "ready") return "Food is ready";
        if (order.status === "pick_up_by_rider") return "Rider has picked up";
        if (order.status === "on the way") return "Order is on the way";
        if (order.status === "delivered") return "Order Delivered";
    }

    return (
        <LinearGradient  
        colors={['#0F5132', '#00a53f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}   // Bottom Right (Darker)
        style={{ height: 160 }}
      >
       <View style={{ paddingTop: insets.top + 20,  paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{  width: 40, height: 40, justifyContent: 'center' }}>
            <Ionicons name="arrow-back" size={26} color="#ffffff" />
          </TouchableOpacity>
          <View style={{ alignItems: "center", marginTop: -30 }} >
            <AppText variant="small" style={{ fontSize: 14, color: "#fff", textTransform: "capitalize", lineHeight: 20 }}>{restaurant?.name} </AppText>
            <AppText style={{ color: "#fff" }}>{orderStatus(currentOrder)}</AppText>
            <View style={{ paddingHorizontal: 15, borderRadius: 8, backgroundColor: "#ececec28", marginTop: 5 }}>
              <AppText style={{ fontSize: 13, color: "#fff" }}>{UI.mainValue} - {UI.title}</AppText>
            </View>
          </View>
       </View>
      </LinearGradient>
    )
}

export default React.memo(OrderHeader);