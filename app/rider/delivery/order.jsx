import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Linking } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchRiderOrder, updateRiderOrderStatus } from "@/redux/slices/rider/riderOrderSlice";
import AppText from "@/components/AppText";
import DeliveryRouteMap from "@/app/map/DeliveryRouteMap";
import { getSocket } from "@/services/connectSocket";
import { saveLastRiderLocation } from "@/redux/slices/rider/riderLocationSlice";
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

export default function DeliveryOrderPage () {
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["50%","75%", "85%", "100%"], []);
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
  
  const { order, loading } = useSelector((state) => state.riderOrder);
    // useEffect(() => {
    //     // console.log("rider:", rider);
    //     console.log("order:", order);
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
    // console.log("coords from backend socket:", coords);
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
}, [order, prevLocation, dispatch]);


  const handlecall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (loading || !order)
    return (
      <View style={styles.center}>
        {/* <ActivityIndicator size="large" /> */}
        <AppText>No active order</AppText>
      </View>
    );



  const handleUpdate = (status) => {
    console.log("Status changed")
    dispatch(updateRiderOrderStatus({ id: order._id, riderId: riderId, status }));
  };

  // DYNAMIC BUTTON STATES
  const renderSlideAction = () => {
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
  }
  const riderLocation = riderCoords
    ? { lat: riderCoords.lat, lng: riderCoords.lng, heading: riderCoords.heading }
    : null; 

  const deliveryLocation = { lat: order?.deliveryAddress?.coordinates[1], lng: order?.deliveryAddress?.coordinates[0] }
  const destination = ["pick_up_by_rider", "on the way", "delivered"].includes(order.status)
    ? deliveryLocation
    : restaurantLocation;

    const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);


  return (
    < >
{/* 
    { riderLocation ?
        <DeliveryRouteMap
        origin={riderLocation}
        destination={destination}
        riderLocation={riderLocation}
      />
      
    : <View style={{ top: "25%" }}> <ActivityIndicator size="large" /> </View>
    
    } */}

    <Image source={TestMap} style={{ height: "100%", width:"100%", position: "absolute" }}/>
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
          <View style={{ flexDirection: "row", alignItems: "center"}} >
            <View style={{ backgroundColor: "#f8f8f8ff", borderRadius: 10 }}>
              <LottieView
                source={DeliveryFood}
                autoPlay
                loop
                style={{ width: 50, height: 50 }}
              />
            </View>
            <View style={{ flexDirection: "column", marginLeft: 10 }}>
              <AppText variant="small" style={{ fontSize: 15, color: "#0f172a" }}>PICK ORDER FROM RESTAURANT</AppText>
              {/* <AppText variant="light" style={{ fontSize: 12 }}>Comming within 30 min</AppText> */}
              <AppText variant="small" style={styles.heading}>Order No. {order.orderId}</AppText>
            </View>            
          </View >
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
          <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 40}} >
            <View style={{ width: 40, height: 40, borderRadius: 25, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" }} >
              <MaterialCommunityIcons name="package-variant-closed" size={28} color="#fff" />
            </View>                    
            {/* <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 10, }}> */}
              <View style={{ flexDirection: "column", marginLeft: 10 }}>
              <AppText variant="small" style={{ fontSize: 15, color: "#0f172a" }}>PACKAGE DETAILS</AppText>
              <View>
              
                {order.items.map((i) => (
                  <>
                  <View style={{width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View>
                      <AppText variant="small" style={{fontSize: 14, color: "#64748b"}} key={i._id}>ITEM : {i.menuItemId.name}</AppText>
                      <AppText variant="small" style={{fontSize: 14, color: "#64748b"}}>QTY : {i.quantity}</AppText>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", padding: 8, backgroundColor: "#0f172a", borderRadius: 10 }}>
                      <MaterialIcons name="currency-rupee" size={20} color="#ffffffff" />
                      <AppText variant="small" style={{color: "#ffffffff"}}>{order?.totalAmount}</AppText>
                    </View>
                    
                    
                  </View>
                  { order?.paymentStatus === "pending" && order?.paymentType === "cod" && 
                    <AppText variant="small" style={{ fontSize: 9, top: 10 ,color: "#0f172a"}}>YOU HAVE TO COLLECT PAYMENT OF {order?.totalAmount}</AppText>
                  } 
                  </> 
                ))}
              
              </View>

              </View>
            {/* </View>             */}
          </View >
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
    marginLeft: 80
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
  bottom: 50, // distance from bottom of BottomSheet
  left: 0,
  right: 0,
  paddingHorizontal: 16,
  zIndex: 10,
  alignItems: "center",
},
   // leave space for sticky button
});
