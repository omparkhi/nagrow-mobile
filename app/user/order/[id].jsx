import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import DeliveryRouteMap from "@/app/map/DeliveryRouteMap";
import { fetchOrderById } from "@/redux/slices/restaurant/orderSlice";
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
import { saveLastRiderLocation } from "@/redux/slices/rider/riderLocationSlice";
import { useRouter } from "expo-router";


export default function UserOrderPage () {
  const router = useRouter();
  const { showToast } = useToast();
    const { id, distanceKm } = useLocalSearchParams();
    const dispatch = useDispatch();
    
    const { currentOrder, loading, error } = useSelector((state) => state.orders);
    const { restaurant } = useSelector((s) => s.restaurants);
    const user = useSelector((state) => state.auth.user);
    const riderLocation = useSelector((state) => state.riderLocation.lastLocation);

    // refs to avoid recreating handlers
  const prevLocationRef = useRef(null);
  const currentOrderRef = useRef(null);

  // keep ref in sync
  useEffect(() => { currentOrderRef.current = currentOrder; }, [currentOrder]);


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
  if (currentOrder?.restaurantId) {
    dispatch(fetchRestaurantById(currentOrder.restaurantId));
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
  if (!currentOrder?.riderId) return;

  const socket = getSocket();
  socket.emit("joinRoom", {
    roomType: "rider",
    roomId: currentOrder.riderId
  });

  const handleLocation = (data) => {
    console.log("rider location data:", data);
    if (currentOrder.riderId) {
      dispatch(
        saveLastRiderLocation({
          lat: data.lat,
          lng: data.lng
        })
      );
    }
  };

  socket.on("rider:location", handleLocation);

  return () => socket.off("rider:location", handleLocation);
}, [currentOrder]);




    // useEffect(() => {
    //   if (!currentOrder) return; // STOP unless order is loaded
    
    //   const socket = getSocket();
    
    //   socket.on("rider:location", (data) => {
    //     if (data.riderId === currentOrder.riderId) {
    //       setRiderCoords({ lat: data.lat, lng: data.lng });
    //       console.log("socket rider location:", data);
    //     }
    //   });
    
    //   return () => socket.off("rider:location");
    // }, [currentOrder]); 

if (loading || !currentOrder || !restaurant) return <Text>Loading order...</Text>;

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

const restaurantLocation = { lat: restCoords[1], lng: restCoords[0] };
  const deliveryLocation = { lat: deliveryCoords[1], lng: deliveryCoords[0] };

  // origin & riderLocation for map:
  // prefer rider live coords -> persisted last -> restaurant (fallback)
  


    const origin = currentOrder.riderId ? riderLocation : restaurantLocation;


    return (
    <ScrollView style={styles.container}>
      <DeliveryRouteMap
        origin={origin}
        destination={deliveryLocation}
        riderLocation={riderLocation}
      />
      <View style={styles.etaCard}>
                <AppText style={styles.etaTitle}>Estimated Arrival</AppText>
                <AppText variant="h2" style={styles.etaTime}>{ETA} min</AppText>
                <AppText variant="small" style={styles.etaSubtitle}>
                    Your food is being prepared
                </AppText>
            </View>

      <View style={styles.mainCard} >
        <View style={[{ flexDirection: "column" }, , styles.card]} >
            

            <View style={{ flexDirection: "row", alignItems: "center", paddingBottom: 10, paddingHorizontal: 10,  }} >
                <View style={{ backgroundColor: "#fff9f9ff", borderRadius: 10 }}>
                <LottieView
                    source={DeliveryIcon}
                    autoPlay
                    loop
                    style={{ width: 50, height: 50 }}
                />
                </View>
                <View style={{ flexDirection: "column", marginLeft: 10 }}>
                    <AppText variant="small" style={{ fontSize: 17, color: "#535252ff" }}>DELIVERING YOUR ORDER</AppText>
                    <AppText variant="light" style={{ fontSize: 12 }}>Comming within 30 min</AppText>
                </View>

            
            </View >
            <View style={{ flexDirection: "row",  alignItems: "center", justifyContent: "space-between", marginLeft: 10, borderTopWidth: 1, borderTopColor: "#d3ceceff", borderStyle: "dotted",   }}>
            <View style={{ flexDirection: "column" }}>
                <AppText variant="small" style={{ fontSize: 15, color: "#535252ff", marginTop: 10 }}>ORDER #{currentOrder.orderId}</AppText>
                <AppText variant="small" style={{ fontSize: 13, color: "#fd731dff", top: -2 }}>₹ {currentOrder?.totalAmount} - {totalItems} item{totalItems > 1 ? 's' : ''} - {currentOrder?.paymentType.toUpperCase()}</AppText>
            </View>
            <TouchableOpacity style={{ padding: 10, backgroundColor: "#fd731dff", borderRadius: 10 }} onPress={() => router.push("/user/dashboard/dash") } >
                    <AppText variant="small" style={{ color: "#ffffffff" }}>Details</AppText>
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
      </View>
    </ScrollView>
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
    width: "60%",
  backgroundColor: "#fff",
  paddingVertical: 5,
//   paddingHorizontal: 20,
  borderRadius: 16,
  marginHorizontal: "auto",
  marginTop: -30,     // floats overlapping map a bit (Swiggy style)
  elevation: 10,
  alignItems: "center",
},
etaTitle: { fontSize: 15, color: "#444" },
etaTime: {  color: "#fd731dff", top: -5 },
etaSubtitle: { fontSize: 13, marginTop: 4, color: "#707070", top: -9 },
});