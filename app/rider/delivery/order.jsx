import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Linking, Platform } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { useDispatch, useSelector } from "react-redux";
import { fetchRiderOrder, updateRiderOrderStatus } from "@/redux/slices/rider/riderOrderSlice";
import AppText from "@/components/AppText";
import DeliveryRouteMap from "@/app/map/DeliveryRouteMap";
import { getSocket } from "@/services/connectSocket";
import { clearLastRiderLocation, saveLastRiderLocation } from "@/redux/slices/rider/riderLocationSlice";
import { useHeaderVisibility } from "@/app/context/HeaderVisibilityContext";
import TestMap from "@/assets/test-map.png";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useMemo } from "react";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import DeliveryFood from "@/assets/food_delivery.json";
import LottieView from "lottie-react-native";
import SlideToAct from "../slide-button";
import Profile from "@/assets/Profile.json";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import ETAInfoCard from "../ETAInfoCard";
import { resetMapState } from "@/redux/slices/map/mapSlice";
import CashCollectPopup from "./cashCollect";
import DeliverySuccessModal from "./DeliverySuccessModal";
import { useRouter } from "expo-router";
import { playDeliverySuccessSound } from "@/hooks/notification";
import NoLiveOrder from "@/assets/Empty-Cart.json";
import * as Location from 'expo-location';
import { Label } from "@react-navigation/elements";
// import { useDliveryOrder } from "@/hooks/useDeliveryOrder";
import { useDeliveryOrder } from "@/hooks/useDeliveryOrder";
import MapView from "./MapView";
import DeliveryActionArea from "./DeliveryActionArea";
import OrderDetailsCard from "./OrderDetailsCard";
import { useBottomBarVisibility } from "@/app/context/NavBarVisibilityContext";
import { useRiderBottomBarVisibility } from "@/app/context/RiderNavBarVisiblityContext";

export default function DeliveryOrderPage () {
  const {setVisible} = useRiderBottomBarVisibility();
  const { 
    order, loading, loadingStatus, riderCoords, eta, remainingMeters,
    minsToPickup, showSuccessModal, showCodPopup, setShowCodPopup,
    handleNavigation, updateStatus, finishDelivery 
  } = useDeliveryOrder();
  // const [minsToPickup, setMinsToPickup] = useState(0);
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [popup, setPopup] = useState(false);
  const { lastLocation } = useSelector((state) => state.riderLocation);
  // const sheetRef = useRef(null);
  // const snapPoints = useMemo(() => ["40%","75%", "85%", "100%"], []);
  // const { setVisible } = useHeaderVisibility();

  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["35%", "50%"], []);
  // const { setVisible } = useHeaderVisibility();

    // useEffect(() => {
    //   setVisible(true);     
    //   return () => setVisible(false);  
    // }, []);

  useEffect(() => {
    setVisible(false);     // Hide navbar
    return () => setVisible(true);  // Show navbar again when leaving page
  }, []);
  // React.useEffect(() => { setVisible(false); return () => setVisible(true); }, []);

  const dispatch = useDispatch();
    // const [riderCoords, setRiderCoords] = useState(null);
    const [prevLocation, setPrevLocation] = useState(null);
    const { rider } = useSelector(state => state.riderAuth);
    const riderId = rider?._id;
    const orderId = rider?.currentOrderId;
  
  // const { order, loading, loadingStatus } = useSelector((state) => state.riderOrder);
  // const { eta, remainingMeters } = useSelector((state) => state.mapState);
    // useEffect(() => {
    //     // console.log("rider:", rider);
    //     console.log("orderTd:", orderId);
    // });
  useEffect(() => {
    dispatch(fetchRiderOrder(orderId));
  }, [dispatch, orderId]);

  const handleVerifyPress = () => {
    router.push("/rider/delivery/VerifyOrder")
  }

  function calculateHeading(prev, current) {
    const dx = current.lng - prev.lng;
    const dy = current.lat - prev.lat;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }


// useEffect(() => {
//   const socket = getSocket();
//   const handler = (data) => {
//     const coords = data.coords ?? data;
//     console.log("coords from backend socket for rider:", coords);
//     if (!order) return;
//     // const heading = prevLocation ? calculateHeading(prevLocation, coords) : 0;

//     // const location = { lat: coords.lat, lng: coords.lng, heading };
//     const location = { lat: coords.lat, lng: coords.lng };

//     setRiderCoords(location);
//     setPrevLocation(coords);

//     // persist last location in Redux so map can restore after refresh
//     dispatch(saveLastRiderLocation(location))
//   }
//   socket.on("rider:location", handler);

//   return () => socket.off("rider:location", handler);
// }, [dispatch]);

// useEffect(() => {
//   const socket = getSocket();

//   // 1. ⚡ INITIAL LOAD: Get current location immediately (Don't wait for BG update)
//   const fetchInitialLocation = async () => {
//     try {
//       const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
//       const initialLoc = { lat: coords.latitude, lng: coords.longitude };
//       console.log("📍 Initial Map Location:", initialLoc);
//       setRiderCoords(initialLoc);
//       dispatch(saveLastRiderLocation(initialLoc));
//     } catch (e) {
//       console.log("Error getting initial map loc:", e);
//     }
//   };

//   fetchInitialLocation();

//   // 2. 📡 LIVE UPDATES: Listen to the "ETA" event from Backend
//   // The Backend sends: { riderLoc: { lat, lng }, etaMinutes, ... }

//   const handler = (data) => {
//     console.log("📡 BG Update Received:", data);

//     if (data.riderLoc) {
//       const location = { lat: data.riderLoc.lat, lng: data.riderLoc.lng };
//       setRiderCoords(location);

//       // Save to Redux so map persists
//         dispatch(saveLastRiderLocation(location));
//     }
//   };

//   // ✅ LISTEN TO THE CORRECT EVENT
//   socket.on("order:eta:update", handler);

//   return () => {
//       socket.off("order:eta:update", handler);
//   };
// }, [dispatch]);


// 4. ✅ FORCE REFRESH ON STATUS CHANGE
  // This ensures the map recalculates route when status flips (e.g., 'preparing' -> 'ready')
  useEffect(() => {
    if(order?._id) {
        // This log confirms the page detected the Redux change from the Socket
        console.log("♻️ Page Refreshed for Status:", order.status);
    }
  }, [order?.status]);

  const handlecall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

//   // ✅ NEW: Timer Logic (Updates every 30s)
// useEffect(() => {
//   const updatePickupTimer = () => {
//     // Only calculate if we are in the "Pickup" phase
//     if (!order?.targetReadyTime || order.status === "on the way" || order.status === "delivered") return;

//     const deadline = new Date(order.targetReadyTime).getTime();
//     const now = Date.now();
//     // Calculate minutes remaining
//     const diff = Math.ceil((deadline - now) / 60000);
//     setMinsToPickup(diff);
//   };

//   updatePickupTimer(); // Run immediately
//   const interval = setInterval(updatePickupTimer, 30000);
//   return () => clearInterval(interval);
// }, [order]);

// ✅ NEW: Helper to get color based on urgency
const getPickupColor = () => {
    if (minsToPickup <= 0 ) return "#10B981"; // Green (Ready)
    if (minsToPickup <= 5) return "#F59E0B"; // Orange (Hurry)
    return "#3B82F6"; // Blue (Plenty of time)
};

// const getPickupText = (status) => {
//     // 1. Kitchen is done
//     if (status === "ready") {
//         return "Food is ready! Head inside to pick up the order.";
//     }

//     // 2. Rider just marked 'Picked Up' (Waiting to slide 'Start Delivery')
//     if (status === "pick_up_by_rider") {
//         return "Order collected! Please start the ride.";
//     }

//     // 3. Rider is driving to customer
//     if (status === "on the way") {
//         return "You are on the way to the drop location.";
//     }

//     // 4. Delivery Complete
//     if (status === "delivered") {
//         return "Great job! Order delivered successfully.";
//     }

//     // 5. Default (Cooking Phase)
//     if (minsToPickup <= 0) return "Food should be ready any moment now.";
//     return `Food ready in ~${minsToPickup} mins`;
// };

const handleBack = () => {
  if (router.back()) {
       router.back();
  } else {
       router.push("/rider/dashboard/dash")
  }
}


  if (loading || !order)
    return ( 
    <>
      <TouchableOpacity
        onPress={handleBack}
        style={{ padding: 15 }}
      >
        <Ionicons name="arrow-back" size={25} color="#000000ff" />
      </TouchableOpacity>
      <View style={styles.center}>
        {/* <ActivityIndicator size="large" /> */}
        <LottieView
          source={NoLiveOrder}
          autoPlay
          loop={true}
          style={{ width: 150, height: 150}}
        />
        <AppText>No active order</AppText>
      </View>
    </>
    );



  const processUpdate = (status) => {
    console.log("Status changing to:", status);
    dispatch(updateRiderOrderStatus({ 
      orderId: order._id, 
      riderId: riderId, 
      status
    }));
    if (status === "delivered") {
      playDeliverySuccessSound();
      setShowSuccess(true);
      // We do NOT resetMapState() here. We wait for "Next Order" button.
    }
  }

  // handle navigation to map
  // const handleNavigation = () => {
  //   if (!order) return;

  //   let lat, lng, label;
  //   const status = order?.status;

  //   // CASE 1: Going to Restaurant (Pickup Phase)
  //   if (["accepted", "preparing", "ready"].includes(status)) {
  //     lat = order.restaurantId.address.location.coordinates[1];
  //     lng = order.restaurantId.address.location.coordinates[0];
  //     label = order.restaurantId.name;    
  //   }

  //   // CASE 2: Going to Customer (Delivery Phase)
  //   else if (["pick_up_by_rider", "on the way"].includes(status)) {
  //     lat = order.deliveryAddress.coordinates[1];
  //     lng = order.deliveryAddress.coordinates[0];
  //     label = "Customer Location";
  //   }

  //   // CASE 3: Done
  //   else {
  //       Alert.alert("Navigation", "Order is already completed.");
  //       return;
  //   }

  //   const url = Platform.select({
  //     ios: `maps:0,0?q=${label}@${lat},${lng}`,
  //     android: `google.navigation:q=${lat},${lng}`
  //   });

  //   Linking.openURL(url).catch(err => console.error('An error occurred', err));
  // };

  const handleUpdate = (status) => {
    if (status === "delivered") {
      const isCOD = order?.paymentType === "cod"
      const isPending = order?.paymentStatus === "pending";

      // If COD and Not Paid -> Show Popup
      if (isCOD && isPending) {
        setPopup(true);
        return; // Stop here, wait for popup action
      }

    }
      // Otherwise proceed normally
      processUpdate(status);
    
  };

  const handleFinishDelivery = () => {
      setShowSuccess(false); // Close modal
      dispatch(clearLastRiderLocation());
      dispatch(resetMapState()); // Clear map
      router.replace("/rider/dashboard/dash"); // Go to dashboard to find new orders
  };

  // DYNAMIC BUTTON STATES
  const renderSlideAction = () => {
        if (loadingStatus) {
      return (
        <View style={styles.loadingContainer}>
           <ActivityIndicator size="large" color="#000" />
           <AppText variant="small" style={{ marginTop: 5, color: "#666" }}>Updating...</AppText>
        </View>
      )
    }
  if (order.status === "ready") {
    return (
      <SlideToAct 
        label="Slide to Pick Up"
        onComplete={() => handleUpdate("pick_up_by_rider")}
      />
    );
  }

  if (order.status === "pick_up_by_rider") {
    return (
      <SlideToAct 
        label="Slide to Start Delivery"
        onComplete={() => handleUpdate("on the way")}
      />
    );
  }

  if (order.status === "on the way") {
    return (
      <SlideToAct 
        label="Slide to Mark Delivered"
        onComplete={() => handleUpdate("delivered")}
      />
    );
  }

  return null;
};

  const isPickupPhase = ["accepted", "preparing", "ready"].includes(order.status);

  const restaurantLocation = { 
    lat: order?.restaurantId?.address?.location?.coordinates[1], 
    lng: order?.restaurantId?.address?.location?.coordinates[0] 
  };

  const riderLocation = riderCoords
    ? { lat: riderCoords.lat, lng: riderCoords.lng, heading: riderCoords.heading }
    : null; 

  const deliveryLocation = { 
    lat: order?.deliveryAddress?.coordinates[1], 
    lng: order?.deliveryAddress?.coordinates[0] 
  }

  const routeOrigin = riderLocation;
  const routeDestination = isPickupPhase ? restaurantLocation : deliveryLocation;
  // const destination = ["pick_up_by_rider", "on the way", "delivered"].includes(order.status)
  //   ? deliveryLocation
  //   : restaurantLocation;

    const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);


  return (
    < >

    {/* { riderLocation ?
        <DeliveryRouteMap
        origin={restaurantLocation}
        destination={deliveryLocation}
        riderLocation={riderLocation}
        order={order}
      />
      
    : <View style={{ top: "25%" }}> <ActivityIndicator size="large" /> </View>
    
    } */}

    {/* 👇 INSERT THIS BUTTON BLOCK HERE 👇 */}
    {/* <TouchableOpacity 
        style={styles.navFab} 
        onPress={handleNavigation}
        activeOpacity={0.8}
    >
        <View style={styles.navIconContainer}>
            <Ionicons name="navigate" size={28} color="#fff" style={{ transform: [{rotate: '-45deg'}] }} />
        </View>
        <AppText variant="small" style={styles.navText}>Navigate</AppText>
    </TouchableOpacity> */}
    {/* 👆 END INSERT 👆 */}
    
        {/* <View style={{ top: -140}}>
      <ETAInfoCard
        title="Arriving in.."
        etaMinutes={eta}
        remainingMeters={remainingMeters}
      />
    </View> */}

    <MapView 
      order={order}
      riderCoords={riderLocation}
      routeOrigin={routeOrigin}
      routeDestination={routeDestination}
      restaurantLocation={restaurantLocation}
      customerLocation={deliveryLocation}
      eta={eta}
      remainingMeters={remainingMeters}
      
    />
    {/* <Image source={TestMap} style={{ height: "100%", width:"100%", position: "absolute" }}/> */}
    <BottomSheet ref={sheetRef} snapPoints={snapPoints} enablePanDownToClose={false} index={0} backgroundStyle={{ backgroundColor: "#f8f8f8d4" }} >
      <BottomSheetScrollView style={styles.container}>
          <OrderDetailsCard order={order} minsToPickup={minsToPickup} onNavigate={handleNavigation} />
      </BottomSheetScrollView>
    </BottomSheet>
              {/* Action Button */}
      {/* <View style={styles.stickySlideButton}>
        {renderSlideAction()}
      </View> */}

      <View style={{ position: "absolute", bottom: 5, left: 16, right: 16 }}>
        <DeliveryActionArea 
          status={order.status}
          loading={loadingStatus}
          onUpdateStatus={updateStatus}
          orderNo={order.orderNo}
          isVerifyPage={false}
          onVerifyPress={handleVerifyPress}
        />
      </View>

      {/* RENDER POPUP HERE */}
      <CashCollectPopup 
        visible={showCodPopup} 
        onClose={() => setShowCodPopup(false)} 
        totalAmount={order?.totalAmount} 
        statusUpdate={() => {
            setShowCodPopup(false); // Close popup
            updateStatus("delivered", true); // Trigger API
        }} 
      />

       {/* delivery success modal */}
       <DeliverySuccessModal
        visible={showSuccessModal}
        earnings={order?.deliveryFee}
        distance={order?.distanceKm}
        duration={Math.round(eta)}
        onHomePress={finishDelivery}
       />
    </>
  );
}

const Button = ({ title, onPress }) => (
  <TouchableOpacity style={styles.btn} onPress={onPress}>
    <Text style={styles.btnText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { padding: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 13, color: "#64748b" },
  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  title: { fontSize: 16, marginBottom: 4 },
  status: { marginTop: 5, fontSize: 16, fontWeight: "600", color: "#FF6B00" },
  btn: {
    width: "100%",
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  callbtn: {
    width: 40,            // width and height to make circle
    height: 40,
    borderRadius: 25,     // half of width/height
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 100
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  trackingCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    elevation: 6,
    shadowOpacity: 0.1,
  },
  customerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    elevation: 6,
    shadowOpacity: 0.1,
  },
  stickySlideButton: {
  position: "absolute",
  bottom: 10, // distance from bottom of BottomSheet
  left: 0,
  right: 0,
  paddingHorizontal: 16,
  zIndex: 10,
  alignItems: "center",
},
loadingContainer: {
    height: 60, // Match your SlideToAct height
    width: "100%", // Match slider width behavior
    backgroundColor: "#ffffff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6, // Match slider shadow
    shadowOpacity: 0.1,
    flexDirection: "row", // Optional: if you want text next to loader
    gap: 10
  },

  navFab: {
    position: 'absolute',
    top: 50, // Adjust based on your header height
    right: 16,
    zIndex: 20, // Ensure it sits above the map
    alignItems: 'center',
  },
  navIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#3b82f6', // Google Maps Blue
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#fff'
  },
  navText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 6,
    borderRadius: 4,
    overflow: 'hidden'
  }
   // leave space for sticky button
});
