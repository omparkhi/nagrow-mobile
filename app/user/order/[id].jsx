import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Alert, Modal, Image, ActivityIndicator } from "react-native";
// import DeliveryRouteMap from "@/app/map/DeliveryRouteMap";
// import { fetchOrderById } from "@/redux/slices/restaurant/orderSlice";
import { fetchOrderById, fetchActiveOrders, setCurrentOrderFromList, updateActiveOrderStatus } from "@/redux/slices/user/userOrderSlice";
import { fetchRestaurantById } from "@/redux/slices/user/restaurantSlice";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux"
import LottieView from "lottie-react-native";
import DeliveryIcon from "@/assets/Delivery-Address.json"
import AppText from "@/components/AppText";
import { MapPin, MapPinOff, Home } from "lucide-react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { getDistanceFromLatLon } from "@/utils/calOrderDistance";
import { getSocket } from "@/services/connectSocket";
import { useToast } from "@/app/ToastContext";
import { saveLastRiderLocation, clearLastRiderLocation } from "@/redux/slices/rider/riderLocationSlice";
import { useRouter } from "expo-router";
import { resetMapState, setETA } from "@/redux/slices/map/mapSlice";
// import { playNewOrderSound } from "@/hooks/rest-sound-notification";
import { playNewOrderSound } from "@/hooks/notification";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Linking } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import FoodType from "../component/FoodType";
import RootWrapper from "@/app/rootWrapper";
import { useLayoutConfig } from "@/app/context/LayoutContext";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomBarVisibility } from "@/app/context/NavBarVisibilityContext";
import { fontFamilies } from "@/constants/typography";
import OrderHeader from "./OrderHeader";
import DeliveryRouteMap from "@/app/map/DeliveryRouteMap";
import OrderSummary from "./OrderSummary ";


export default function UserOrderPage () {
// ... inside UserOrderPage, before the return statement
const { setVisible } = useBottomBarVisibility();
const { setIsImmersive, setBottomSafeColor } = useLayoutConfig();
const insets = useSafeAreaInsets();
  // const [now, setNow] = useState(Date.now());
  const [isBillVisible, setBillVisible] = useState(false);
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["34%"], []);
  const router = useRouter();
  // const { showToast } = useToast();
  const { id, distanceKm } = useLocalSearchParams();
  const dispatch = useDispatch();
    
  // const { loading } = useSelector((state) => state.userOrder);
  const currentOrder = useSelector(state => state.userOrder.currentOrder);
  const activeOrders = useSelector(state => state.userOrder.activeOrders);
  const { restaurant } = useSelector((s) => s.restaurants);
  const user = useSelector((state) => state.auth.user);
  const riderLocation = useSelector((state) => state.riderLocation.lastLocation);
  const { eta, remainingMeters } = useSelector((state) => state.mapState);

  // refs to avoid recreating handlers
  const prevLocationRef = useRef(null);
  const currentOrderRef = useRef(null);

  // keep ref in sync
  useEffect(() => { currentOrderRef.current = currentOrder; }, [currentOrder]);

  useEffect(() => {
    setVisible(false);     
    return () => setVisible(true);  
  }, []);
  

  // --- EFFECT: BOTTOM SHEET SYNC ---
  // This listens to the state and commands the sheet
  useEffect(() => {
    if (isBillVisible) {
      sheetRef.current?.expand(); 
    } else {
      sheetRef.current?.close();
    }
  }, [isBillVisible]);

  // Callback when user manually drags sheet down
  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      setBillVisible(false);
    }
  }, []);

  
        console.log("🔥 ORDER SCREEN RENDER");

        useEffect(() => {
  console.log("🔥 ORDER SCREEN MOUNT");
}, []);



  useEffect(() => {
    if (!id) return;

    dispatch(resetMapState());
    dispatch(clearLastRiderLocation());

    const orderInList = activeOrders.find(o => o._id === id);
    if (orderInList) {
        // console.log("⚡ Instant Load from Active List");
        dispatch(setCurrentOrderFromList(id));
        // Optional: Fetch fresh data in background to ensure sync
        // dispatch(fetchOrderById(id)); 
    } else {
        console.log("🌍 Fetching from API");
        dispatch(fetchOrderById(id));
    }

    return () => {
        // When leaving page, wipe map again so next order starts fresh
        dispatch(resetMapState());
        dispatch(clearLastRiderLocation());
    };
  }, [id]);

  // useEffect(() => {
  //   if (currentOrder?.status === "placed") {
  //     playNewOrderSound();
  //     showToast(`Order No ${currentOrder.orderNo}`, "Your Order is placed succesfully")
  //   }
  // }, [currentOrder])

      // useEffect(() => {
      //   if (currentOrder?.riderId) {
      //     console.log("rider location:", riderLocation);
      //   }
        

      // }, [riderLocation, currentOrder]);

    // useEffect(() => {
    //   const socket = getSocket();

    //   socket.on("order:status", (data) => {
    //     showToast(
    //       `Order ${data.orderId}`,
    //       `Status changed to ${data.status}`
    //     );
    //     // Alert.alert( `order status updated: ${data.status}`);
    //     console.log("⚡ Status Updated:", data);
    //     dispatch(fetchOrderById(id)); //re fetch ui after updating status
    //   });

    //   socket.on("locationUpdate", (location) => {
    //   console.log("📍 Rider Location:", location);
    //   // setMapLocation(location)
    // });

    // return () => {
    //     socket.off("order:status");
    //     // socket.off("locationUpdate"); 
    //   };
    // }, []);

    // console.log("Order raw:", currentOrder);
    // console.log("user data:", user)
    useEffect(() => {
  if (currentOrder?.restaurantId._id) {
    dispatch(fetchRestaurantById(currentOrder.restaurantId._id));
  }
}, [currentOrder]);

//     if (
//   !currentOrder.restaurantId?.address?.location?.coordinates ||
//   !currentOrder.deliveryAddress?.coordinates
// ) {
//   return <Text>Invalid order: missing coordinates</Text>;
// }
// console.log("restauarnt detail", restaurant?.address?.location.coordinates[1], restaurant?.address?.location.coordinates[0],)

function calculateHeading(prev, current) {
    const dx = current.lng - prev.lng;
    const dy = current.lat - prev.lat;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }

    // useEffect(() => {
    //     dispatch(fetchOrderById(id));
    // }, [id, dispatch]);

    // useEffect(() => {
    //     if (currentOrder) {
    //         console.log("Current order in user:", currentOrder);
    //     }
    // }, [currentOrder]);

// ✅ ADD THIS HOOK
  useEffect(() => {
    if (currentOrder?.status === "delivered") {
      const timer = setTimeout(() => {
        // Just navigate away. 
        // DO NOT reset map here. 
        // The unmount cleanup will handle the reset naturally.
        router.replace("/user/dashboard/dash"); 
      }, 3000); // 3 seconds is better so user can read "Delivered"

      return () => clearTimeout(timer);
    }
  }, [currentOrder?.status]);
   


useEffect(() => {
    // We need both riderId (for map) and userId (for notifications/ETA)
    if (!currentOrder?.riderId || !user?._id) return;

    const socket = getSocket();

    // // Handle ETA & Logic Updates (The missing part)
    // const handleEtaUpdate = (data) => {
    //   // console.log("⚡ Live ETA Update:", data);
    //   const eta = {
    //     etaMinutes: data.etaMinutes,
    //     remainingMeters: data.remainingMeters,
    //   }
    //     // console.log("eta for user", eta);
    //     dispatch(setETA(eta));

    //   // Update Rider Location Redux (The payload contains riderLoc too!)
    //   if (data.riderLoc) {
    //     dispatch(saveLastRiderLocation(data.riderLoc));
    //   }

    //       dispatch(updateActiveOrderStatus({
    //   orderId: data.orderId,
    //   eta: data.etaMinutes
    // }));
    // };



    // Handle Raw Location (Backup / Animation smoothness)
    const handleLocation = (coords) => {
      dispatch(saveLastRiderLocation(coords));
    };

    // const handleRouteInit = (data) => {
    //     const route = PolylineDecoder.decode(data.polyline).map(([lat, lng]) => ({
    //         latitude: lat,
    //         longitude: lng,
    //     }))
    //     console.log("order route init polyline:", route);
    //     dispatch(setRouteCache(route));
    //     dispatch(setRouteFetched());
    // };

    // --- LISTENERS ---
    
    // Join Rider Room
    const riderRoomId = currentOrder.riderId._id || currentOrder.riderId;
    socket.emit("joinRoom", { roomType: "rider", roomId: riderRoomId });

    // socket.on("order:eta:update", handleEtaUpdate);
    socket.on("rider:location", handleLocation);

    // Cleanup
    return () => {
      socket.off("order:eta:update", handleEtaUpdate);
      socket.off("rider:location", handleLocation);
    };
  }, [currentOrder?.riderId, user?._id, currentOrder?._id]);

  useFocusEffect(
      useCallback(() => {
        // 1. When Screen Focuses: Enable Immersive Mode (Hide Top Safe Area)
        setIsImmersive(true);
        setBottomSafeColor("white"); // Set bottom bar to white if needed
  
        return () => {
          // 2. When Screen Unfocuses (Navigating away): Reset to Default
          setIsImmersive(false);
          setBottomSafeColor("transparent");
        };
      }, [])
    );


// const getTrackingStatusText = (status) => {
//   switch (status) {
//     case "placed":
//       return "Waiting for restaurant confirmation...";
//     case "accepted":
//       return "Order accepted! Kitchen will start soon.";
//     case "preparing":
//       return "Your food is being prepared 🍳"; // Your current text
//     case "ready":
//       return "Food is ready! Waiting for rider.";
//     case "pick_up_by_rider":
//       return "Rider is picking up your order 🛍️";
//     case "on the way": // Ensure this matches schema exactly (spaces vs underscores)
//       return "Order is on the way! 🛵";
//     case "delivered":
//       return "Enjoy your meal! 😋";
//     case "cancelled":
//       return "This order was cancelled ❌";
//     default:
//       return "Tracking order...";
//   }
// };

// Helper function
const getArrivalTimestamp = (minutes) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// console.log("restaurant", restaurant)

// if (loading || !currentOrder || !restaurant) {
//   return (
//     <View style={{ height: "100%", width:"100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
//       <ActivityIndicator size="large" color="#fd731dff" />
//     </View>
//   )
// }


if (!currentOrder) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center",  height: "100%", width: "100%" }}>
      <ActivityIndicator size="large" color="#fd731dff" />
    </View>
  );
}


// if (error) return <Text>{error}</Text>;

const totalItems = currentOrder.items.reduce((acc, item) => acc + item.quantity, 0);


const orderDistance = getDistanceFromLatLon(
    currentOrder?.restaurantId?.address?.location.coordinates[1],
    currentOrder?.restaurantId?.address?.location.coordinates[0],
    currentOrder.deliveryAddress.coordinates[1],
    currentOrder.deliveryAddress.coordinates[0],
);
// console.log("order distance: ", orderDistance);

const avgSpeed = 25; // km/h
// console.log("distance km:", distanceKm);
const travelTime = (distanceKm / avgSpeed) * 60; // in min

const ETA = Math.round(travelTime + 15); // preparation time

const restCoords = restaurant?.address?.location?.coordinates;
const deliveryCoords = currentOrder?.deliveryAddress?.coordinates;

 if (!restCoords || !deliveryCoords) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center",  height: "100%", width: "100%" }}>
        <ActivityIndicator size="large" color="#fd731dff" />
      </View>
    )
  }

const isPickupPhase = ["pick_up_by_rider"].includes(currentOrder.status);
const isDeliveryPhase = ["on the way", "delivered"].includes(currentOrder.status);

// 2. Define Locations
const restaurantLoc = { lat: restCoords[1], lng: restCoords[0] };
const userHomeLoc = { lat: deliveryCoords[1], lng: deliveryCoords[0] };


const routeOrigin = riderLocation || restaurantLoc;

const routeDestination =  userHomeLoc;


const restaurantLocation = { lat: restCoords[1], lng: restCoords[0] };
  // const deliveryLocation = { lat: deliveryCoords[1], lng: deliveryCoords[0] };

  // origin & riderLocation for map:
  // prefer rider live coords -> persisted last -> restaurant (fallback)
  
  const preparationTime = (1200 + currentOrder?.routeInfo?.durationSeconds)/60; //min

    // const origin = currentOrder?.riderId ? riderLocation : restaurantLocation;
  const handleClearMapState = () => {
    dispatch(resetMapState());
    dispatch(clearLastRiderLocation());
  }



// const trackingSteps = [
//     {
//       key: 'restaurant',
//       title: `${restaurant?.name || 'Restaurant'} - ${restaurant?.address?.street || ''}`,
//       subtitle: 'Restaurant',
//       iconName: 'location',
//       iconType: Ionicons,
//       isAddress: true 
//     },
//     {
//       key: 'preparing',
//       title: 'Preparing your food',
//       subtitle: 'Kitchen',
//       iconName: 'restaurant',
//       iconType: Ionicons,
//       isAddress: false
//     },
//     {
//       key: 'ready',
//       title: 'Food is ready',
//       subtitle: 'Waiting for pickup',
//       iconName: 'fast-food',
//       iconType: Ionicons,
//       isAddress: false
//     },
//     {
//       key: 'pick_up_by_rider',
//       title: 'Rider has picked up',
//       subtitle: 'On the move',
//       iconName: 'bicycle',
//       iconType: Ionicons,
//       isAddress: false
//     },
//     {
//       key: 'on the way',
//       title: 'Order is on the way',
//       subtitle: 'Near you',
//       iconName: 'navigate-circle',
//       iconType: Ionicons,
//       isAddress: false
//     },
//     {
//       key: 'delivered',
//       title: `You - ${currentOrder?.deliveryAddress?.fullAddress || ''}`,
//       subtitle: 'Home',
//       iconName: 'home',
//       iconType: MaterialIcons,
//       isAddress: true
//     }
//   ];

  const orderStatus = (order) => {
    if (order.status === "placed") return "Order Confirmed";
    if (order.status === "preparing") return "Preparing your food";
    if (order.status === "ready") return "Food is ready";
    if (order.status === "pick_up_by_rider") return "Rider has picked up";
    if (order.status === "on the way") return "Order is on the way";
    if (order.status === "delivered") return "Order Delivered";
  }

 
  return (
    // <RootWrapper bottomSafeAreaColor="white">
    <RootWrapper immersive={setIsImmersive} barStyle="light" bottombar={true} >
      <View style={styles.container}>
        <OrderHeader user={user} restaurant={restaurant} currentOrder={currentOrder} />

        {/* <View style={{ height: 500 }}> */}
        <DeliveryRouteMap
          origin={routeOrigin}
          // restaurantLocation={restaurantLoc}
          destination={routeDestination}
          riderLocation={riderLocation}
          order={currentOrder}
          height={350}
        />

        <OrderSummary currentOrder={currentOrder} totalItems={totalItems} restaurant={restaurant} />
      </View>
    </RootWrapper>
  );
}

const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8f6f6ff", },
//   card: {
//     // backgroundColor: "#fff",
//     borderRadius: 16,
//     marginVertical: 12,
    
    
//     // elevation: 6,
//     // shadowOpacity: 0.15,
//   },
container: { flex: 1, backgroundColor: "#f8f6f6ff" },
mainCard: {
    paddingHorizontal: 10,
},
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    elevation: 6,
    shadowOpacity: 0.1,
  },

  title: { fontSize: 22, marginBottom: 4 },
  status: { fontSize: 16, color: "#16A34A" },
  subTitle: { marginTop: 10, fontSize: 16 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  itemText: { fontSize: 15, color: "#111" },

  etaCard: {
    paddingHorizontal: 20,
    // width: "60%",
  backgroundColor: "#fff",
  paddingVertical: 5,
//   paddingHorizontal: 20,
  borderRadius: 16,
  marginHorizontal: "auto",
  marginTop: -120,     // floats overlapping map a bit (Swiggy style)
  elevation: 10,
  alignItems: "center",
},
etaTitle: { fontSize: 15, color: "#444" },
etaTime: {  color: "#fd731dff", top: -5 },
etaMin: { fontSize: 14,  color: "#fd731dff", top: -9 },
etaSubtitle: { fontSize: 13, marginTop: 4, color: "#707070", top: -9, textAlign: "center", },

sectionCard: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        elevation: 2
    },
    riderAvatar: {
        width: 40, height: 40, borderRadius: 24,
        backgroundColor: "#cbd5e1", justifyContent: 'center', alignItems: 'center'
    },
    callBtn: {
        backgroundColor: "#fd731dff", // Green for call
        padding: 10, 
        borderRadius: 25
    },
    modalOverlay: {
    flex: 1,
  },
  
  // ADD THIS NEW STYLE OBJECT
  modalContentContainer: {
   
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    elevation: 20,
    // minHeight: 300,
  },

  // modalOverlay: { flex: 1 },
  // modalContentContainer: { paddingBottom: 40 }, // Space for safe area
  // modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  // modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  image: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 2,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  dashedDivider: {
    // height: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    // borderStyle: 'dashed',
    marginVertical: 12,
  },
  paymentBadge: {
    marginTop: 15,
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  
});