import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Linking } from "react-native";
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

export default function DeliveryOrderPage () {
  const [minsToPickup, setMinsToPickup] = useState(0);
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [popup, setPopup] = useState(false);
  const { lastLocation } = useSelector((state) => state.riderLocation);
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["40%","75%", "85%", "100%"], []);
  const { setVisible } = useHeaderVisibility();
  useEffect(() => {
    setVisible(false);     // Hide header
    return () => setVisible(true);  // Show header again when leaving page
  }, []);
  const dispatch = useDispatch();
    const [riderCoords, setRiderCoords] = useState(null);
    const [prevLocation, setPrevLocation] = useState(null);
    const { rider } = useSelector(state => state.riderAuth);
    const riderId = rider?._id;
    const orderId = rider?.currentOrderId;
  
  const { order, loading, loadingStatus } = useSelector((state) => state.riderOrder);
  const { eta, remainingMeters } = useSelector((state) => state.mapState);
    // useEffect(() => {
    //     // console.log("rider:", rider);
    //     console.log("orderTd:", orderId);
    // });
  useEffect(() => {
    dispatch(fetchRiderOrder(orderId));
  }, [dispatch, orderId]);

  function calculateHeading(prev, current) {
    const dx = current.lng - prev.lng;
    const dy = current.lat - prev.lat;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }


useEffect(() => {
  const socket = getSocket();
  const handler = (data) => {
    const coords = data.coords ?? data;
    console.log("coords from backend socket for rider:", coords);
    if (!order) return;
    // const heading = prevLocation ? calculateHeading(prevLocation, coords) : 0;

    // const location = { lat: coords.lat, lng: coords.lng, heading };
    const location = { lat: coords.lat, lng: coords.lng };

    setRiderCoords(location);
    setPrevLocation(coords);

    // persist last location in Redux so map can restore after refresh
    dispatch(saveLastRiderLocation(location))
  }
  socket.on("rider:location", handler);

  return () => socket.off("rider:location", handler);
}, [dispatch]);


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

  // ✅ NEW: Timer Logic (Updates every 30s)
useEffect(() => {
  const updatePickupTimer = () => {
    // Only calculate if we are in the "Pickup" phase
    if (!order?.targetReadyTime || order.status === "on the way" || order.status === "delivered") return;

    const deadline = new Date(order.targetReadyTime).getTime();
    const now = Date.now();
    // Calculate minutes remaining
    const diff = Math.ceil((deadline - now) / 60000);
    setMinsToPickup(diff);
  };

  updatePickupTimer(); // Run immediately
  const interval = setInterval(updatePickupTimer, 30000);
  return () => clearInterval(interval);
}, [order]);

// ✅ NEW: Helper to get color based on urgency
const getPickupColor = () => {
    if (minsToPickup <= 0 ) return "#10B981"; // Green (Ready)
    if (minsToPickup <= 5) return "#F59E0B"; // Orange (Hurry)
    return "#3B82F6"; // Blue (Plenty of time)
};

const getPickupText = (status) => {
    // 1. Kitchen is done
    if (status === "ready") {
        return "Food is ready! Head inside to pick up the order.";
    }

    // 2. Rider just marked 'Picked Up' (Waiting to slide 'Start Delivery')
    if (status === "pick_up_by_rider") {
        return "Order collected! Please start the ride.";
    }

    // 3. Rider is driving to customer
    if (status === "on the way") {
        return "You are on the way to the drop location.";
    }

    // 4. Delivery Complete
    if (status === "delivered") {
        return "Great job! Order delivered successfully.";
    }

    // 5. Default (Cooking Phase)
    if (minsToPickup <= 0) return "Food should be ready any moment now.";
    return `Food ready in ~${minsToPickup} mins`;
};


  if (loading || !order)
    return ( 
    <>
      <TouchableOpacity
        onPress={() => router.back()}
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


  const restaurantLocation = { 
    lat: order?.restaurantId?.address?.location?.coordinates[1], 
    lng: order?.restaurantId?.address?.location?.coordinates[0] 
  };

  const riderLocation = riderCoords
    ? { lat: riderCoords.lat, lng: riderCoords.lng, heading: riderCoords.heading }
    : null; 

  const deliveryLocation = { lat: order?.deliveryAddress?.coordinates[1], lng: order?.deliveryAddress?.coordinates[0] }
  // const destination = ["pick_up_by_rider", "on the way", "delivered"].includes(order.status)
  //   ? deliveryLocation
  //   : restaurantLocation;

    const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);


  return (
    < >

    { riderLocation ?
        <DeliveryRouteMap
        origin={restaurantLocation}
        destination={deliveryLocation}
        riderLocation={riderLocation}
        order={order}
      />
      
    : <View style={{ top: "25%" }}> <ActivityIndicator size="large" /> </View>
    
    }
    
        <View style={{ top: -140}}>
      <ETAInfoCard
        title="Arriving in.."
        etaMinutes={eta}
        remainingMeters={remainingMeters}
      />
    </View>
    {/* <Image source={TestMap} style={{ height: "100%", width:"100%", position: "absolute" }}/> */}
    <BottomSheet
      // style={styles.container}
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      index={0}  // start collapsed
      backgroundStyle={{ backgroundColor: "#f8f8f8d4" }}
    >

    <BottomSheetScrollView style={styles.container}>

      <View style={styles.scrollContent}>
        <View style={styles.trackingCard}>
  <View style={{ flexDirection: "column" }}>
    <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderStyle: "dotted", borderBottomColor: "#d7d3d3ff" }}>
    <View style={{ backgroundColor: "#f8f8f8ff", borderRadius: 10, marginBottom: 5 }}>
      <LottieView
        source={DeliveryFood}
        autoPlay
        loop
        style={{ width: 50, height: 50 }}
      />
    </View>
    <View style={{ flexDirection: "column",  marginLeft: 10, }}>
      <AppText variant="small" style={{ fontSize: 18, color: "#0f172a" }}>
        ONGOING LIVE ORDER
      </AppText>
    <AppText variant="small" style={{ fontSize: 14, color: "#78797cff", marginTop: -3}}>{order?.orderNo}</AppText>
    </View>
    </View>
    <View style={{ flexDirection: "column",   flex: 1 }}>
      {/* ✅ NEW: Dynamic Pickup Timer (Only show before 'On the Way') */}
      {["accepted", "preparing", "ready", "pick_up_by_rider"].includes(order.status) && order.targetReadyTime && (
         <View style={{ flexDirection: 'column', alignItems: "center", marginTop: 4, position: "relative" }}>
            <View style={{ flexDirection: 'row', position: "absolute" }}>
              <Ionicons name="time-outline" size={14} color={getPickupColor()} style={{ marginRight: 4 }} />
            <AppText variant="small" style={{ color: getPickupColor(), fontSize: 13,  }}>
                {getPickupText(order.status)}
            </AppText>
            </View>
            {/* Optional: Absolute Time */}
            <AppText variant="small" style={{ color: "#94a3b8", fontSize: 11, marginLeft: 6, marginTop: 17 }}>
               (Pick Parcel By {new Date(order.targetReadyTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
            </AppText>
         </View>
      )}
      
    </View>
  </View>
</View>

        {/* <View style={{ flexDirection: "column", alignItems: "center", marginLeft: 10 }}> */}
        {/* <AppText variant="small" style={{ fontSize: 17, color: "#64748b" }}>Pickup the order from Restaurant</AppText> */}
        
        {/* <AppText variant="light" style={{ fontSize: 12 }}>Comming within 30 min</AppText> */}
        {/* </View> */}
      <View style={styles.trackingCard}>
             {/* <MapPin size={32} color="green" fill="green" /> */}
             <View style={{ flexDirection: "row", alignItems: "center", color: "#000", paddingRight: 30 }}>
                <Ionicons name="location" size={28} color="#0f172a" />
                <View>
                    <AppText variant="small" style={{ fontSize: 15, color: "#0f172a", marginLeft: 7 }}>{order?.restaurantId?.name.toUpperCase()} - {order?.restaurantId?.address.street}</AppText>
                    <AppText variant="light" style={{ fontSize: 13, color: "#64748b", marginLeft: 7, top: -2 }}>Restaurant</AppText>
                </View>
             </View>
             <View style={{ height: 27, borderLeftWidth: 1, borderStyle: "dashed", borderColor: "#0f172a", marginLeft: 13 }}></View>
             <View style={{ flexDirection: "row", alignItems: "center", color: "#000", paddingRight: 30 }}>
             <MaterialIcons name="home" size={28} color="#0f172a"  />
                <View>
                    <AppText variant="small" style={{ fontSize: 15, color: "#0f172a", marginLeft: 7 }} numberOfLines={1}>{order?.userId?.firstName} {order?.userId?.lastName} - {order?.deliveryAddress?.fullAddress}</AppText>
                    <AppText variant="light" style={{ fontSize: 13, color: "#64748b", marginLeft: 7, top: -2 }}>Delivery Address</AppText>
                </View>
            </View>
        </View>
      {/* Customer
      <View style={styles.card}>
        <Text style={styles.title}>Customer</Text>
        <Text>{order.userId.name}</Text>
        <Text>{order.userId.phone}</Text>
      </View> */} 

  <View style={styles.trackingCard}>
    {/* SECTION 1: Header Row (Icon + Title + Price) */}
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 5, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#64748b", borderStyle: "dotted" }}>
    
      {/* Left Side: Icon & Label */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 40, height: 40, borderRadius: 25, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" }}>
          <MaterialCommunityIcons name="package-variant-closed" size={24} color="#fff" />
        </View>
        <AppText variant="small" style={{ fontSize: 15, color: "#0f172a", marginLeft: 10 }}>
          PACKAGE DETAILS
        </AppText>
      </View>

      {/* Right Side: Price Badge */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#0f172a", borderRadius: 8 }}>
        <MaterialIcons name="currency-rupee" size={16} color="#ffffff" />
        <AppText variant="small" style={{ color: "#ffffff" }}>
          {order?.totalAmount}
        </AppText>
      </View>
    </View>

    {/* SECTION 2: Items List (Below the header) */}
    <View style={{ paddingHorizontal: 4 }}>
      {order.items.map((i) => (
        <View key={i._id} style={{ marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          
            {/* Item Name */}
            <AppText variant="small" style={{ fontSize: 14, color: "#334155", flex: 1 }}>
              {i.menuItemId.name}
            </AppText>
          
            {/* Quantity */}
            <AppText variant="small" style={{ fontSize: 14, color: "#64748b" }}>
              x {i.quantity}
            </AppText>
          </View>
        </View>
      ))}
    </View>

    {/* SECTION 3: COD Warning (Bottom) */}
    {order?.paymentStatus === "pending" && order?.paymentType === "cod" && (
      <View style={{ marginTop: 4, backgroundColor: "#fffbe6", padding: 8, borderRadius: 6, borderWidth: 1, borderColor: "#ffe58f" }}>
        <AppText variant="small" style={{ fontSize: 11, color: "#d48806", textAlign: "center" }}>
          ⚠️ YOU HAVE TO COLLECT PAYMENT OF ₹{order?.totalAmount}
        </AppText>
      </View>
    )}

  </View>

              <View style={styles.customerCard}>
          <View style={{ flexDirection: "row", alignItems: "center"}} >
            <View style={{height: 40, width: 40, borderRadius: 25, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" }}>
              {/* <LottieView
                source={Profile}
                autoPlay
                loop
                style={{ width: 60, height: 60 }}
              /> */}
              <Ionicons name="person-circle-outline" size={30} color="#fff" />
              {/* <Feather name="user" size={28} color="#ffffffff" /> */}
            </View>                    
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 10, }}>
              <View >
              <AppText variant="small" style={{ fontSize: 15, color: "#0f172a" }}>{order?.userId?.firstName.toUpperCase()} {order?.userId?.lastName.toUpperCase()}</AppText>
              <AppText variant="small" style={{ fontSize: 15, color: "#0f172a" }}>+91-{order?.userId.phone}</AppText> 
              </View>
              <TouchableOpacity style={styles.callbtn} onPress={() => handlecall(order?.userId.phone)} >
                <Ionicons name="call" size={18} color="#fff" />
              </TouchableOpacity>
              {/* <AppText variant="light" style={{ fontSize: 12 }}>Comming within 30 min</AppText> */}
              {/* <AppText variant="small" style={styles.heading}>Order No. {order.orderId}</AppText> */}
            </View>            
          </View >
        </View>

      {/* Restaurant */}
      {/* <View style={styles.card}>
        <Text style={styles.title}>Pickup From</Text>
        <Text>{order.restaurantId.name}</Text>
        {/* <Text>{order.restaurantId.address}</Text> */}
      {/* </View> */} 

      {/* Items */}
      {/* <View style={styles.card}>
        <Text style={styles.title}>Items</Text>
        {order.items.map((i) => (
          <Text key={i._id}>{i.menuItemId.name} × {i.qty}</Text>
        ))}
      </View>

      {/* Status */}
      {/* <View style={styles.card}>
        <Text style={styles.title}>Status</Text>
        <Text style={styles.status}>{order.status.toUpperCase()}</Text>
      </View> */} 


      </View>
    </BottomSheetScrollView>

    </BottomSheet>
              {/* Action Button */}
      <View style={styles.stickySlideButton}>
        {renderSlideAction()}
      </View>

      {/* RENDER POPUP HERE */}
      <CashCollectPopup 
        visible={popup} 
        onClose={() => setPopup(false)} 
        totalAmount={order?.totalAmount} 
        statusUpdate={() => {
            setPopup(false); // Close popup
            processUpdate("delivered"); // Trigger API
        }} 
      />

       {/* delivery success modal */}
       <DeliverySuccessModal
        visible={showSuccess}
        earnings={order?.deliveryFee}
        distance={order?.distanceKm || 3.5}
        duration={Math.round(eta)}
        onHomePress={handleFinishDelivery}
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
  }
   // leave space for sticky button
});
