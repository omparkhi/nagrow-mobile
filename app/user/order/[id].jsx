import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, Image, ActivityIndicator } from "react-native";
import DeliveryRouteMap from "@/app/map/DeliveryRouteMap";
// import { fetchOrderById } from "@/redux/slices/restaurant/orderSlice";
import { fetchOrderById } from "@/redux/slices/user/userOrderSlice";
import { fetchRestaurantById } from "@/redux/slices/user/restaurantSlice";
import { useLocalSearchParams } from "expo-router";
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


export default function UserOrderPage () {

// ... inside UserOrderPage, before the return statement

  const [isBillVisible, setBillVisible] = useState(false);
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["40%","55%", "85%", "100%"], []);
  const router = useRouter();
  const { showToast } = useToast();
  const { id, distanceKm } = useLocalSearchParams();
  const dispatch = useDispatch();
    
  const { currentOrder, loading, error } = useSelector((state) => state.userOrder);
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
    if (currentOrder?.status === "placed") {
      playNewOrderSound();
      showToast(`Order No ${currentOrder.orderNo}`, "Your Order is placed succesfully")
    }
  }, currentOrder)

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
console.log("restauarnt detail", restaurant?.address?.location.coordinates[1], restaurant?.address?.location.coordinates[0],)

function calculateHeading(prev, current) {
    const dx = current.lng - prev.lng;
    const dy = current.lat - prev.lat;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }

    useEffect(() => {
        dispatch(fetchOrderById(id));
    }, [id, dispatch]);

    useEffect(() => {
        if (currentOrder) {
            console.log("Current order:", currentOrder);
        }
    }, [currentOrder]);


   


useEffect(() => {
    // We need both riderId (for map) and userId (for notifications/ETA)
    if (!currentOrder?.riderId || !user?._id) return;

    const socket = getSocket();

    // 1. Join Rider Room (To get raw location updates for Map)
    socket.emit("joinRoom", {
      roomType: "rider",
      roomId: currentOrder.riderId._id || currentOrder.riderId // Ensure we get the ID string
    });

    // 2. Join User Room (To get ETA updates sent via emitToUser)
    socket.emit("joinRoom", {
      roomType: "user",
      roomId: user._id
    });

    // --- HANDLERS ---

    // Handle ETA & Logic Updates (The missing part)
    const handleEtaUpdate = (data) => {
      console.log("⚡ Live ETA Update:", data);
      
      const eta = {
        etaMinutes: data.etaMinutes,
        remainingMeters: data.remainingMeters,
      }
        console.log("eta for user", eta);
        dispatch(setETA(eta));

      // Update Rider Location Redux (The payload contains riderLoc too!)
      if (data.riderLoc) {
        dispatch(saveLastRiderLocation(data.riderLoc));
      }
    };

    // Handle Raw Location (Backup / Animation smoothness)
    const handleLocation = (coords) => {
      dispatch(saveLastRiderLocation(coords));
    };

    // --- LISTENERS ---
    socket.on("order:eta:update", handleEtaUpdate); // <--- THIS WAS MISSING
    socket.on("rider:location", handleLocation);

    // Cleanup
    return () => {
      socket.off("order:eta:update", handleEtaUpdate);
      socket.off("rider:location", handleLocation);
    };
  }, [currentOrder?.riderId, user?._id]);


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

// Helper function
const getArrivalTimestamp = (minutes) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

if (loading || !currentOrder || !restaurant) {
  return <View style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" /></View>;
}

if (error) return <Text>{error}</Text>;

const totalItems = currentOrder.items.reduce((acc, item) => acc + item.quantity, 0);


const orderDistance = getDistanceFromLatLon(
    restaurant?.address?.location.coordinates[1],
    restaurant?.address?.location.coordinates[0],
    currentOrder.deliveryAddress.coordinates[1],
    currentOrder.deliveryAddress.coordinates[0],
);
console.log("order distance: ", orderDistance);

const avgSpeed = 25; // km/h
console.log("distance km:", distanceKm);
const travelTime = (distanceKm / avgSpeed) * 60; // in min

const ETA = Math.round(travelTime + 15); // preparation time

const restCoords = restaurant?.address?.location?.coordinates;
const deliveryCoords = currentOrder?.deliveryAddress?.coordinates;

 if (!restCoords || !deliveryCoords) {
    return <Text>Invalid order: missing coordinates</Text>;
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

  const formatDistance = (meters) => {
  if (!meters || meters <= 0) return "";

  if (meters < 1000) {
    return `${Math.round(meters)} m away`;
  }

  return `${(meters / 1000).toFixed(1)} km away`;
};

const distanceInMeters =
  ["placed", "accepted", "preparing", "ready"].includes(currentOrder.status) ? currentOrder?.routeInfo?.distanceMeters : remainingMeters;

  // --- 2. THE PRODUCTION-READY DISPLAY LOGIC ---
  const getDisplayContent = () => {
    const status = currentOrder.status;
    const isDelivered = status === "delivered";
    const isCancelled = status === "cancelled";
    
    // Default Values (Active Order)
    let title = "Estimated Arrival";
    let mainValue = `${Math.round((1200 + currentOrder?.routeInfo?.durationSeconds)/60)} min`; // Default prep time
    let bottomText = getTrackingStatusText(status);
    let distanceText = formatDistance(distanceInMeters);
    let showDistance = true;
    let mainColor = "#fd731dff"; // Orange
    let arriveByText = `Arriving by ${["ready", "pick_up_by_rider", "on the way"].includes(status) ? getArrivalTimestamp(eta) : getArrivalTimestamp(preparationTime)} `;

    // Logic Overrides
    if (["ready", "pick_up_by_rider", "on the way"].includes(status)) {
        title = "Arriving in";
        mainValue = `${eta} min`;
    }

    if (isDelivered) {
        title = "Order Status";
        mainValue = "Delivered";
        bottomText = "Enjoy your meal! 😋";
        showDistance = false; // Don't show "0m away"
        mainColor = "#16A34A"; // Green
        arriveByText = "Delivered";
        dispatch(resetMapState());
    }

    if (isCancelled) {
        title = "Order Status";
        mainValue = "Cancelled";
        bottomText = "Refund initiated if applicable";
        showDistance = false;
        mainColor = "#DC2626"; // Red
        arriveByText = "Cancelled";
    }

    return { title, mainValue, bottomText, distanceText, showDistance, mainColor, arriveByText };
  };

  const UI = getDisplayContent(); 

  
const BillModal = () => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={isBillVisible}
    onRequestClose={() => setBillVisible(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        
        {/* Header */}
        <View style={styles.modalHeader}>
          <AppText variant="variant" style={{ fontSize: 18 }}>ORDER SUMMARY</AppText>
          <TouchableOpacity onPress={() => setBillVisible(false)}>
            <Ionicons name="close-circle" size={28} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Items List */}
        <ScrollView style={{ maxHeight: 300 }}>
          {currentOrder.items.map((item, index) => (
            <View key={index} style={[styles.billRow, { paddingBottom: 12, borderBottomWidth: 1, borderStyle: "dashed", borderColor: "#94a3b8" }]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Veg/Non-veg icon indicator could go here */}
                    <MaterialIcons name="trip-origin" size={14} color="green" style={{marginRight:6}} />
                    <Image source={{ uri: item.menuItemId?.image }} style={styles.image} />
                    <AppText style={{ fontSize: 15, color: "#334155", marginLeft: 7 }}>{item.menuItemId?.name} - {item.quantity}</AppText>
                </View>
                {/* <AppText style={{ fontSize: 12, color: "#94a3b8", marginLeft: 20 }}></AppText> */}
              </View>
              <AppText style={{ fontSize: 15, color: "#334155" }}>
                ₹{(item.menuItemId?.price * item.quantity).toFixed(0)}
              </AppText>
            </View>
          ))}
        </ScrollView>

        {/* <View style={styles.dashedDivider} /> */}

        {/* Bill Details */}
        <View style={styles.billRow}>
          <AppText variant="small" style={{ color: "#64748b", fontSize: 14 }}>Item Total</AppText>
          <AppText variant="small" style={{ color: "#64748b", fontSize: 14 }}>₹{currentOrder.totalAmount - (currentOrder.deliveryFee || 0)}</AppText>
        </View>

        <View style={styles.billRow}>
          <AppText variant="small" style={{ color: "#64748b", fontSize: 14 }}>Delivery Fee</AppText>
          <AppText variant="small" style={{ color: "#64748b", fontSize: 14 }}>₹{currentOrder.deliveryFee || 0}</AppText>
        </View>
        
        <View style={styles.billRow}>
            <AppText variant="small" style={{ color: "#64748b", fontSize: 14 }}>Platform Fee</AppText>
            <AppText variant="small" style={{ color: "#64748b", fontSize: 14 }}>₹0.00</AppText>
        </View>

        <View style={styles.divider} />

        {/* Grand Total */}
        <View style={styles.billRow}>
          <AppText variant="h3" style={{ fontSize: 18 }}>Grand Total</AppText>
          <AppText variant="h3" style={{ fontSize: 18, color: "#fd731dff" }}>₹{currentOrder.totalAmount}</AppText>
        </View>

        {/* Payment Method Badge */}
        <View style={styles.paymentBadge}>
            <AppText style={{ fontSize: 12, color: "#64748b" }}>
                PAID VIA {currentOrder.paymentType.toUpperCase()}
            </AppText>
        </View>

      </View>
    </View>
  </Modal>
);

    return (
    <View style={styles.container}>
      {/* <View style={{ height: 500 }}> */}
              <DeliveryRouteMap
        origin={routeOrigin}
        // restaurantLocation={restaurantLoc}
        destination={routeDestination}
        riderLocation={riderLocation}
        order={currentOrder}
    />
      {/* </View> */}

          {/* <TouchableOpacity 
                          style={{
                          width: "60%",
                          // marginTop: 20,
                          backgroundColor: "#0f172a",
                          paddingVertical: 13,
                          borderRadius: 10,
                          alignItems: "center",
                          color: "#fff"
                      }}
           onPress={handleClearMapState}>
            clear Map
          </TouchableOpacity> */}
      <View style={styles.etaCard}>
                <AppText variant="small" style={styles.etaTitle}>{UI.title}</AppText>
                <AppText variant="h2" style={[styles.etaTime,  { color: UI.mainColor }]}>{UI.mainValue}</AppText>
                {UI.showDistance && (
                  <AppText variant="small" style={styles.etaMin}>{UI.distanceText}</AppText>
                )}
                {/* Subtitle (Status Text) */}
              <AppText variant="small" style={styles.etaSubtitle}>
                  {UI.bottomText}
              </AppText>
            </View>
          <BottomSheet
            // style={styles.container}
            ref={sheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            index={0}  // start collapsed
            backgroundStyle={{ backgroundColor: "#ecedf0ff", borderRadius: 20 }}
          >

            <BottomSheetScrollView>
      <View style={styles.mainCard} >
        <View style={[{ flexDirection: "column" }, , styles.card]} >
            

            <View style={{ flexDirection: "row", alignItems: "center", paddingBottom: 10, paddingHorizontal: 10,  }} >
                <View style={{ backgroundColor: "#fff9f9ff", borderRadius: 10 }}>
                <LottieView
                    source={DeliveryIcon}
                    autoPlay
                    loop={currentOrder.status !== 'delivered'}
                    style={{ width: 50, height: 50 }}
                />
                </View>
                <View style={{ flexDirection: "column", marginLeft: 10 }}>
                    <AppText variant="small" style={{ fontSize: 17, color: "#535252ff" }}>{currentOrder.status === 'delivered' ? "ORDER DELIVERED" : "DELIVERING YOUR ORDER"}</AppText>
                    <AppText variant="light" style={{ fontSize: 12 }}>{UI.arriveByText}</AppText>
                </View>

            
            </View >
            <View style={{ flexDirection: "row",  alignItems: "center", justifyContent: "space-between", marginLeft: 10, borderTopWidth: 1, borderTopColor: "#d3ceceff", borderStyle: "dotted",   }}>
            <View style={{ flexDirection: "column" }}>
                <AppText variant="small" style={{ fontSize: 13, color: "#535252ff", marginTop: 10 }}>ORDER - <AppText variant="small" style={{ color: "#535252ff", fontSize: 13 }}>{currentOrder.orderNo}</AppText></AppText>
                <AppText variant="small" style={{ fontSize: 13, color: "#fd731dff", top: -2 }}>₹ {currentOrder?.totalAmount} - {totalItems} item{totalItems > 1 ? 's' : ''} - {currentOrder?.paymentType.toUpperCase()}</AppText>
            </View>
            <TouchableOpacity style={{ padding: 10, backgroundColor: "#fd731dff", borderRadius: 10 }} onPress={() => setBillVisible(true)} >
                    <AppText variant="small" style={{ color: "#ffffffff" }}>View Bill</AppText>
                </TouchableOpacity>
            
            </View>

            
            
        </View>
        <View style={styles.card}>
             {/* <MapPin size={32} color="green" fill="green" /> */}
             <View style={{ flexDirection: "row", alignItems: "center", color: "#000", paddingRight: 30 }}>
                <Ionicons name="location" size={28} color="#fd731dff" />
                <View>
                    <AppText variant="small" style={{ fontSize: 15, color: "#535252ff", marginLeft: 7 }}>{restaurant?.name} - {restaurant?.address.street}</AppText>
                    <AppText variant="light" style={{ fontSize: 13, color: "#535252ff", marginLeft: 7, top: -2 }}>Restaurant</AppText>
                </View>
             </View>
             <View style={{ height: 30, borderLeftWidth: 1, borderStyle: "dashed", borderColor: "#fd731dff", marginLeft: 13 }}></View>
             <View style={{ flexDirection: "row", alignItems: "center", color: "#000", paddingRight: 30 }}>
             <MaterialIcons name="home" size={28} color="#fd731dff"  />
                <View>
                    <AppText variant="small" style={{ fontSize: 15, color: "#535252ff", marginLeft: 7 }} numberOfLines={1}>You - {currentOrder?.deliveryAddress?.fullAddress}</AppText>
                    <AppText variant="light" style={{ fontSize: 13, color: "#535252ff", marginLeft: 7, top: -2 }}>Home</AppText>
                </View>
            </View>
             {/* <Home size={32} color="#ff6200ff" /> */}
        {/* <AppText style={styles.title}>Order #{currentOrder.orderId}</AppText>
        <AppText style={styles.status}>{currentOrder.status.toUpperCase()}</AppText>

        <AppText style={styles.subTitle}>Items</AppText>
        {currentOrder.items.map((it) => (
          <View key={it._id} style={styles.itemRow}>
            <AppText style={styles.itemText}>{it.menuItemId?.name} x {it.quantity}</AppText>
            <AppText style={styles.itemText}>₹{it.menuItemId?.price}</AppText>
          </View>

          
        ))} */}


        </View>
        {/* Rider Information (Only show if rider assigned) */}
                {currentOrder.riderId && ["pick_up_by_rider", "on the way", "delivered"].includes(currentOrder.status) && (
                     <View style={styles.card}>
                      
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={styles.riderAvatar}>
                                <Ionicons name="person" size={20} color="#fff" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <AppText variant="small" style={{color: "#535252ff" }}>{currentOrder.riderId.name || "Rider Assigned"}</AppText>
                                <AppText variant="small" style={{ fontSize: 12, color: "#919191ff" }}>Call without sharing your number</AppText>
                            </View>
                  {currentOrder.status !== 'delivered' && (
                      <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${currentOrder.riderId.phone}`)}>
                        <Ionicons name="call" size={20} color="#fff" />
                      </TouchableOpacity>
                  )}

                        </View>

                     </View>
                     
                )}
                      
      </View>
      </BottomSheetScrollView>
      </BottomSheet>
      <BillModal />
    </View>
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

  title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  status: { fontSize: 16, color: "#16A34A", fontWeight: "600" },
  subTitle: { marginTop: 10, fontWeight: "600", fontSize: 16 },
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
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim background
    justifyContent: 'flex-end', // Aligns modal to bottom
    marginBottom: 45
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    elevation: 20,
    // minHeight: 300,
  },
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
  }
});