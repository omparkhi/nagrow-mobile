import React from "react";
import { View, StyleSheet } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import AppText from "@/components/AppText";
import DeliveryFood from "@/assets/food_delivery.json";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function OrderDetailsCard({ order, minsToPickup, onNavigate }) {

    const handlecall = (phone) => {
      Linking.openURL(`tel:${phone}`);
    };

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
    return (
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
         <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between", marginTop: 4, position: "relative" }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: "center", position: "absolute" }}>
                <Ionicons name="time-outline" size={14} color={getPickupColor()} style={{ marginRight: 4 }} />
                <AppText variant="small" style={{ color: getPickupColor(), fontSize: 13,  }}>{getPickupText(order.status)}</AppText>
              </View>
              {/* Optional: Absolute Time */}
              <AppText variant="small" style={{ color: "#94a3b8", fontSize: 11, marginLeft: 6, marginTop: 17 }}>(Pick Parcel By {minsToPickup})</AppText>
            </View>
            <TouchableOpacity style={{  zIndex: 20, alignItems: 'center' }} onPress={onNavigate} activeOpacity={0.8}>
              <View style={styles.navIconContainer}>
                <Ionicons name="navigate" size={28} color="#fff" style={{ transform: [{rotate: '-45deg'}] }} />
              </View>
              <AppText variant="small" style={styles.navText}>Map</AppText>
            </TouchableOpacity>
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

  {/* <View style={styles.trackingCard}> */}
    {/* SECTION 1: Header Row (Icon + Title + Price) */}
    {/* <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 5, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#64748b", borderStyle: "dotted" }}> */}
    
      {/* Left Side: Icon & Label */}
      {/* <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 40, height: 40, borderRadius: 25, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" }}>
          <MaterialCommunityIcons name="package-variant-closed" size={24} color="#fff" />
        </View>
        <AppText variant="small" style={{ fontSize: 15, color: "#0f172a", marginLeft: 10 }}>
          PACKAGE DETAILS
        </AppText>
      </View> */}

      {/* Right Side: Price Badge */}
      {/* <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#0f172a", borderRadius: 8 }}>
        <MaterialIcons name="currency-rupee" size={16} color="#ffffff" />
        <AppText variant="small" style={{ color: "#ffffff" }}>
          {order?.totalAmount}
        </AppText>
      </View> */}
    {/* </View> */}

    {/* SECTION 2: Items List (Below the header) */}
    {/* <View style={{ paddingHorizontal: 4 }}>
      {order.items.map((i) => (
        <View key={i._id} style={{ marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          
            <AppText variant="small" style={{ fontSize: 14, color: "#334155", flex: 1 }}>
              {i.menuItemId.name}
            </AppText>
          
            <AppText variant="small" style={{ fontSize: 14, color: "#64748b" }}>
              x {i.quantity}
            </AppText>
          </View>
        </View>
      ))}
    </View> */}

    {/* SECTION 3: COD Warning (Bottom) */}
    {/* {order?.paymentStatus === "pending" && order?.paymentType === "cod" && (
      <View style={{ marginTop: 4, backgroundColor: "#fffbe6", padding: 8, borderRadius: 6, borderWidth: 1, borderColor: "#ffe58f" }}>
        <AppText variant="small" style={{ fontSize: 11, color: "#d48806", textAlign: "center" }}>
          ⚠️ YOU HAVE TO COLLECT PAYMENT OF ₹{order?.totalAmount}
        </AppText>
      </View>
    )} */}

  {/* </View> */}
          {["on the way"].includes(order?.status) && 
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
        }

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
    )
}


const styles = StyleSheet.create({
  navIconContainer: { width: 55, height: 55, borderRadius: 10, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', elevation: 8, borderWidth: 2, borderColor: '#fff' },
  navText: { color: '#0f172a', fontSize: 12, marginTop: 4, paddingHorizontal: 6, borderRadius: 4, overflow: 'hidden' },
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
