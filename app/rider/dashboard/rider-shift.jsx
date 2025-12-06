import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import AppText from "@/components/AppText";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import LottieView from "lottie-react-native";
import WaitingRider from "@/assets/Waiting.json";
import New from "@/assets/New.json";
import { getAddressFromCoords } from "@/utils/getAddressFromCoords";
import { useSelector, useDispatch } from "react-redux";
import LogoutButton from "./logout-button";
import { getSocket } from "@/services/connectSocket";
import { Text } from "react-native";
import StartDeliveryPopup from "./start-delivery";
import axios from "axios";
import { useRouter } from "expo-router";
import { fetchRiderProfile } from "@/redux/slices/rider/authSlice";
import { stopShift } from "@/redux/slices/rider/riderTrackingSlice";
import { playNewOrderSound } from "@/hooks/rest-sound-notification";
import { clearDeliveryRequest } from "@/redux/slices/rider/riderDeliverySlice";
// import MapboxGL from "@rnmapbox/maps";

export default function RiderShiftDashboard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  // const [newOrder, setNewOrder] = useState(null);
  // const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [onlineTime, setOnlineTime] = useState(0);
  const [address, setAddress] = useState("Fetching location...");
  const { rider } = useSelector(state => state.riderAuth);
  const riderId = rider?._id;
  const [socketReady, setSocketReady] = useState(false);
  const deliveryState = useSelector((state) => state.riderDelivery);
  const deliveryOrder = deliveryState.request;

    const handleStopShift = async () => {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/rider/stop/shift`, { riderId });
      console.log(res.data)
      dispatch(stopShift());
      dispatch(clearDeliveryRequest());
      dispatch(fetchRiderProfile());
    };


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


  // Reverse Geocode Address
  useEffect(() => {
    if (rider?.location?.lat && rider?.location?.lng) {
        (async () => {
            const address = await getAddressFromCoords(
                rider.location.lat,
                rider.location.lng
            );
            setAddress(address || "Unknown location")
        })();
    }
  }, [rider])

  useEffect(() => {
    const interval = setInterval(() => setOnlineTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    const h = Math.floor(onlineTime / 3600);
    const m = Math.floor((onlineTime % 3600) / 60);
    const s = onlineTime % 60;
    return `${h > 0 ? h + "h " : ""}${m}m ${s}s`;
  };

  // order requested


const handleAcceptOrder = () => {
  setShowPopup(true);
}

const handleAcceptDelivery = async () => {
  try {
    const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/rider/order/response`, {
      riderId: rider._id,
      orderId: deliveryOrder.id,
      action: "accept",
    });
    
    const socket = getSocket();
    socket.emit("delivery:accepted", {
      riderId: rider._id,
      orderId: deliveryOrder.orderId,
    });

    // Alert.alert("Order Accepted");
    // console.log("Order Accepted:", res.data);
      dispatch(clearDeliveryRequest());
      dispatch(fetchRiderProfile());
      router.push("/rider/delivery/order");

  } catch (err) {
    Alert.alert("Error", err.message);
    console.log("Error in Accepting delivery:", err.message);
  }
};

const handleRejectDelivery = async () => {
  try {
    const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/rider/order/response`, {
      riderId: rider._id,
      orderId: deliveryOrder.id,
      action: "reject",
    });
    Alert.alert("Order passed to next rider");
    dispatch(clearDeliveryRequest());
  } catch (err) {
    Alert.alert("Error", err.message);
    console.log("Error in rejecting order", err.message);
  }
}


  return (
    <View style={styles.container}>
      
      {/* CURRENT LOCATION */}
      <View style={styles.gradientCard}>
        <View style={styles.row}>
          <View style={styles.roundIcon}>
            <Ionicons name="location" size={20} color="#0f172a" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <AppText variant="small" numberOfLines={1} ellipsizeMode="tail" style={styles.title} >{address}</AppText>
            <AppText variant="small" style={styles.sub}>Accurate • GPS tracking active</AppText>
          </View>
        </View>
      </View>

      {showPopup && (
        <StartDeliveryPopup visible={showPopup} onClose={() => setShowPopup(false)} onConfirm={handleAcceptDelivery} />
      )}

      {/* INCOMING ORDERS */}
      <View style={styles.card}>
        <AppText variant="small" style={styles.sectionTitle}>Incoming Orders</AppText>

        {deliveryState.showModal && deliveryOrder ?  (
        <View style={styles.emptySection}>
          <View style={styles.emptyIconWrap}>
          {/* <StartDeliveryPopup/> */}
          <LottieView
                source={New}
                autoPlay
                loop
                style={{ width: 150, height: 150}}
            />
          </View>
          {/* <AppText variant="small" style={styles.emptyText}>New Delivery</AppText> */}
          <AppText variant="small" style={{fontSize: 16, color: "#64748b"}}>Order ID: {deliveryOrder.orderId}</AppText>
          <AppText variant="small" style={styles.emptySub}>You have to pick order from <AppText variant="small" style={{ color: "#64748b", fontSize: 14}}>{deliveryOrder.restaurantName.toUpperCase()}</AppText></AppText>
          <AppText variant="small" style={styles.emptySub}>Amount: ₹{deliveryOrder.amount}</AppText>

          <View style={styles.btnRow}>
            <TouchableOpacity 
              style={styles.cancelBtn} onPress={handleRejectDelivery}
            >
              <AppText variant="small" style={styles.cancelText}>Reject</AppText>
            </TouchableOpacity>

            <TouchableOpacity 
             style={styles.startBtn} onPress={handleAcceptOrder}
            >
              <AppText variant="small" style={styles.startText}>Accept</AppText>
            </TouchableOpacity>
          </View>
        </View>
      ) : 
      <View style={styles.emptySection}>
          <View style={styles.emptyIconWrap}>
            <LottieView
                source={WaitingRider}
                autoPlay
                loop
                style={{ width: 90, height: 90}}
            />
          </View>
          <AppText variant="small" style={styles.emptyText}>No orders yet</AppText>
          <AppText variant="small" style={styles.emptySub}>Stay online to receive orders</AppText>
        </View>
       }

      </View>

      {/* SHIFT STATUS */}
      <View style={styles.card}>
        <AppText variant="small" style={styles.sectionTitle}>Shift Status</AppText>

        <View style={styles.statRow}>
          <AppText variant="small" style={styles.statLabel}>⏱ Online Time</AppText>
          <AppText variant="small" style={styles.statValue}>{formatTime()}</AppText>
        </View>

        <View style={styles.statRow}>
          <AppText variant="small" style={styles.statLabel}>💰 Earnings Today</AppText>
          <AppText variant="small" style={styles.statValue}>₹0</AppText>
        </View>

        <View style={styles.statRow}>
          <AppText variant="small" style={styles.statLabel}>🛵 Completed Orders</AppText>
          <AppText variant="small" style={styles.statValue}>0</AppText>
        </View>
      </View>
      <LogoutButton/>

      <TouchableOpacity
                style={{
                    width: "60%",
                    // marginTop: 20,
                    backgroundColor: "#0f172a",
                    paddingVertical: 13,
                    borderRadius: 10,
                    alignItems: "center",
                }}
                onPress={handleStopShift}
            >
            <AppText style={{ color: "#fbfbfbff", fontSize: 16 }}>
              Stop Shift
            </AppText>
          </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: "#f4f9ffff",
    height: "100%",
  },

  gradientCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 18,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 3,
  },

  row: { flexDirection: "row", alignItems: "center" },

  roundIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#e6f0ff",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {width: "50%", fontSize: 17, color: "#0f172a" },
  sub: { fontSize: 13, color: "#065F46" },

  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },

  sectionTitle: {
    fontSize: 16,
    color: "#0f172a",
    marginBottom: 10,
  },

  emptySection: {
    alignItems: "center",
    paddingVertical: 15,
  },

  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#0f172a",
    marginTop: 12,
  },

  emptySub: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 3,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
  },

  statLabel: { fontSize: 15, color: "#334155" },
  statValue: { fontSize: 15, color: "#0f172a" },

  btnRow: {
    flexDirection: "row",
    marginTop: 22,
    justifyContent: "space-between",
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },

  cancelText: {
    color: "#334155",
    fontSize: 15,
  },

  startBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#0f172a",
    alignItems: "center",
  },

  startText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
