import { View, StyleSheet, Alert } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import AppText from "@/components/AppText";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import WaitingRider from "@/assets/Waiting.json";
import ScanOrder from "@/assets/Scan.json";
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
// import { playNewOrderSound } from "@/hooks/rest-sound-notification";
import { playNewOrderSound, playNewOrderSoundForRider } from "@/hooks/notification";
import { clearDeliveryRequest } from "@/redux/slices/rider/riderDeliverySlice";
// import MapboxGL from "@rnmapbox/maps";
import { useToast } from "@/app/ToastContext";
import { resetMapState } from "@/redux/slices/map/mapSlice";
import useOrderSound from "@/hooks/useOrderSound";
import RiderFooter from "../component/Footer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RiderStartShift from "@/assets/Rider-Shift.json";
import { fetchTodayStats } from "@/redux/slices/rider/riderStatsSlice";

export default function RiderShiftDashboard() {
  // const { showToast } = useToast();
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
  const insets = useSafeAreaInsets();

  const { earnings, orders } = useSelector(state => state.riderStats);

  useEffect(() => {
    if (rider?._id) {
      dispatch(fetchTodayStats(rider._id));
    }
  }, [rider?._id]);

  // timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const { playSound, stopSound } = useOrderSound();

  const soundIntervalRef = useRef(null);

  // 1. Handle New Order & Start Timer
  useEffect(() => {
    if (deliveryOrder && deliveryState.showModal) {
      playSound();
      // Use the timeLeft from backend or default to 45s
      setTimeLeft(deliveryOrder.timeLeft || 45);

      // if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
      // soundIntervalRef.current = setInterval(() => {
      //   playNewOrderSoundForRider();
      // }, 8000);

      // Clear any existing timer
      if (timerRef.current) clearInterval(timerRef.current);

      // Start Countdown
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            clearInterval(soundIntervalRef.current)
            handleAutoTimeout(); // ⚡ Trigger auto-close logic
            return 0;
          }
          return prev - 1;
        })
      }, 1000)
    } else {
      // Cleanup if modal closes
      stopSound();
      if (timerRef.current) clearInterval(timerRef.current);
      // if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [deliveryOrder, deliveryState.showModal]);

  // Auto Timeout Logic (Frontend side)
  const handleAutoTimeout = () => {
    // Ideally, we just clear the request locally. 
    // The Backend Janitor will handle the actual penalty/reassignment.
    Alert.alert("Timeout", "You missed the order.");
    dispatch(clearDeliveryRequest());
  }

    const handleStopShift = async () => {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/rider/stop/shift`, { riderId });
      console.log(res.data)
      dispatch(stopShift());
      dispatch(clearDeliveryRequest());
      dispatch(fetchRiderProfile());
      // playNewOrderSound();
      // dispatch(resetMapState());
      // // dispatch(reset)
      // showToast(`NAGROW-12543573`, "Your Order is placed succesfully");
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
    let interval;

    const updateTimer = () => {
      if (rider?.shiftStartTime && rider?.isOnline) {
        const start = new Date(rider.shiftStartTime).getTime();
        const now = Date.now();

        // Calculate total seconds elapsed
        const diffInSeconds = Math.floor((now - start) / 1000);
        
        // Prevent negative numbers (if server clock is slightly ahead)
        setOnlineTime(diffInSeconds > 0 ? diffInSeconds : 0);
      } else {
        setOnlineTime(0);
      }
      
    };
    updateTimer();

    // / 2. Update every second
    // We recalculate the difference every tick instead of just incrementing +1.
    // This ensures accuracy even if the app goes to background or lags.
    interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [rider]);

  // ⚡ FORMATTER (HH:MM:SS)
  const formatTime = () => {
    const h = Math.floor(onlineTime / 3600);
    const m = Math.floor((onlineTime % 3600) / 60);
    const s = onlineTime % 60;
    
    // Add leading zeros
    const hh = h < 10 ? `0${h}` : h;
    const mm = m < 10 ? `0${m}` : m;
    const ss = s < 10 ? `0${s}` : s;

    return `${h > 0 ? hh + ":" : ""}${mm}:${ss}`;
  };

  // order requested


const handleAcceptOrder = () => {
  setShowPopup(true);
}

const handleAcceptDelivery = async () => {
  try {
    
    const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/rider/order/response`, {
      riderId: rider._id,
      orderId: deliveryOrder.orderId,
      action: "accept",
    });
    if (res.data.success) {
      await stopSound();
    }
    
    const socket = getSocket();
    socket.emit("delivery:accepted", {
      riderId: rider._id,
      orderNo: deliveryOrder.orderNo,
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
    if (res.data.success) {
      await stopSound();
    }
    Alert.alert("Order passed to next rider");
    dispatch(clearDeliveryRequest());
  } catch (err) {
    Alert.alert("Error", err.message);
    console.log("Error in rejecting order", err.message);
  }
}

// Helper for Timer Color
  const isUrgent = timeLeft < 10;


  return (
    <View style={styles.container}>
      
      {/* CURRENT LOCATION */}
      {/* <View style={styles.gradientCard}>
        <View style={styles.row}>
          <View style={styles.roundIcon}>
            <Ionicons name="location" size={20} color="#0f172a" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <AppText variant="small" numberOfLines={1} ellipsizeMode="tail" style={styles.title} >{address}</AppText>
            <AppText variant="small" style={styles.sub}>Accurate • GPS tracking active</AppText>
          </View>
        </View>
      </View> */}

      {showPopup && (
        <StartDeliveryPopup 
          visible={showPopup} 
          onClose={() => setShowPopup(false)} 
          onConfirm={handleAcceptDelivery}
        />
      )}

      {/* INCOMING ORDERS */}
      <View style={styles.card}>
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
             <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
              <AppText variant="small" style={styles.sectionTitle}>Findings Orders nearby...</AppText>
             
              {deliveryState.showModal ? (
                 <View style={[styles.timerBadge, { backgroundColor: timeLeft < 10 ? '#fee2e2' : '#e0f2fe' }]}>
                    <MaterialIcons name="access-time" size={16} color={isUrgent ? "#ef4444" : "#0284c7"} style={{marginRight: 4}} />
                     <AppText style={[styles.timerText, { color: timeLeft < 10 ? '#ef4444' : '#0284c7' }]}>
                        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                     </AppText>
                 </View>
             ) : (
                <View style={styles.signalBadge}>
                  <Ionicons name="cellular" size={14} color="#16a34a" />
                  <AppText variant="small" style={{fontSize: 12, color:'#16a34a', marginLeft: 4}}>Strong</AppText>
                </View>
             )}
             </View>
             {/* 🕒 VISUAL TIMER INDICATOR */}

             
        </View>

        {deliveryState.showModal && deliveryOrder ?  (
        <View style={styles.orderSection}>
          <View style={styles.orderIconWrap}>
          {/* <StartDeliveryPopup/> */}
          <LottieView
                source={RiderStartShift}
                autoPlay
                loop
                style={{ width: 120, height: 120} }
            />
          </View>
          {/* <AppText variant="small" style={styles.emptyText}>New Delivery</AppText> */}
          <AppText variant="small" style={{fontSize: 18, color: "#64748b", marginTop: 25,}}>Order No: {deliveryOrder?.orderNo || "Nagrow-hudhu8"}</AppText>
          <AppText variant="small" style={{ fontSize: 13, color: "#64748b"}}>You have to pick order from <AppText variant="small" style={{ color: "#000000", fontSize: 14}}>{deliveryOrder?.restaurantName.toUpperCase() || "Nagrow"}</AppText></AppText>
          <AppText variant="small" style={{ color: "#0f172a", marginTop: 5 }}>Expected Earning: ₹{deliveryOrder?.deliveryFee}</AppText>

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
        <View style={{ flex: 1 }}>
            <AppText variant="small" style={{ color: "#64748b", fontSize:19, lineHeight: 20 }}>Searching for Orders</AppText>
            <AppText variant="small" style={styles.emptyText}>No orders yet</AppText>
            <AppText variant="small" style={styles.emptySub}>Stay online to receive orders</AppText>
          </View>
          <View style={styles.emptyIconWrap}>
            <LottieView
                source={WaitingRider}
                autoPlay
                loop
                style={{ width: 90, height: 90, zIndex: 999}}
            />
            <LottieView 
              source={ScanOrder}
              autoPlay
              loop
              style={{ position: "absolute", width: 230, height: 230 }}
            />
          </View>
          
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
          <AppText variant="small" style={styles.statValue}>₹{earnings.toFixed(2)}</AppText>
        </View>

        <View style={styles.statRow}>
          <AppText variant="small" style={styles.statLabel}>🛵 Completed Orders</AppText>
          <AppText variant="small" style={styles.statValue}>{orders}</AppText>
        </View>
      </View>
      <LogoutButton/>

      <TouchableOpacity
                style={{
                    width: "100%",
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

          <View style={{ marginTop: 30 }}>
            <RiderFooter style={insets.bottom} />
          </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -30,
    paddingHorizontal: 12,
    // paddingTop: 10,
    // backgroundColor: "#f4f9ffff",
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
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    gap: 40,
    paddingVertical: 15,
    // marginTop: 30
  },
    orderSection: {
    // flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    paddingVertical: 25,
    // marginTop: 30
  },

  emptyIconWrap: {
    width: 60,
    height: 60,
    // borderRadius: 30,
    // backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20, 
    
  },
  orderIconWrap: {
    width: 60,
    height: 60,
    
    alignItems: "center",
    justifyContent: "center",
    // marginRight: 20
  },

  emptyText: {
    fontSize: 16,
    color: "#0f172a",
    marginTop: 10,
  },

  emptySub: {
    fontSize: 13,
    color: "#64748b",
    // marginTop: 3,
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
  timerBadge: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10
  },
  timerText: {
      fontSize: 14,
  }, 
  signalBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#dcfce7', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  }
});
