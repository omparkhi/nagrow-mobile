import React from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import AppText from "@/components/AppText";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
// import { setDeliveryRequest } from "@/redux/slices/rider/riderDeliverySlice"; // Ensure this action exists
import WaitingRider from "@/assets/Waiting.json";
import New from "@/assets/New.json";

const { width } = Dimensions.get("window");

export default function LiveStatusWidget({ onAcceptPress }) {
  const { rider } = useSelector((state) => state.riderAuth);
  const { request } = useSelector((state) => state.riderDelivery); // Incoming request
  const isOnline = rider?.isOnline;

  // 1. STATE: OFFLINE
  if (!isOnline) {
    return (
      <View style={[styles.card, styles.offlineCard]}>
        <View style={styles.iconCircle}>
            <Ionicons name="moon" size={24} color="#64748b" />
        </View>
        <View style={styles.textBlock}>
            <AppText style={styles.title}>You are Offline</AppText>
            <AppText variant="small" style={styles.sub}>
                Go Online to start receiving orders.
            </AppText>
        </View>
      </View>
    );
  }

  // 2. STATE: INCOMING ORDER (High Priority)
  if (request) {
    return (
      <View style={[styles.card, styles.incomingCard]}>
        <View style={styles.row}>
            <LottieView 
                source={New} 
                autoPlay loop 
                style={{ width: 50, height: 50 }} 
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
                <AppText style={[styles.title, {color: '#b91c1c'}]}>New Request!</AppText>
                <AppText variant="small" style={styles.sub}>
                    ₹{request.amount} • {request.distanceKm} km
                </AppText>
            </View>
        </View>
        
        <TouchableOpacity style={styles.actionBtn} onPress={onAcceptPress}>
            <AppText style={styles.btnText}>View Request</AppText>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  // 3. STATE: SEARCHING (Default Online)
  return (
    <View style={[styles.card, styles.searchingCard]}>
      <View style={styles.radarContainer}>
        {/* Radar Animation */}
        <LottieView 
            source={WaitingRider} 
            autoPlay loop 
            style={{ width: 60, height: 60 }} 
        />
        {/* <View style={styles.pulseRing} /> */}
      </View>

      <View style={styles.textBlock}>
        <AppText style={styles.title}>Finding Orders...</AppText>
        <AppText variant="small" style={styles.sub}>
           Scanning near <AppText style={{fontWeight:'700', color:'#0f172a'}}>Sitabuldi</AppText>
        </AppText>
      </View>

      <View style={styles.signalBadge}>
         <Ionicons name="cellular" size={14} color="#16a34a" />
         <AppText variant="small" style={{fontSize: 10, color:'#16a34a', marginLeft: 4}}>Strong</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    marginBottom: 20,
    elevation: 4, // Android Shadow
    shadowColor: "#000", // iOS Shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
  },
  
  // Offline Styles
  offlineCard: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#cbd5e1",
    justifyContent: "center", alignItems: "center"
  },

  // Searching Styles
  searchingCard: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  radarContainer: {
    width: 50, height: 50,
    justifyContent: "center", alignItems: "center",
  },

  // Incoming Styles
  incomingCard: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    flexDirection: "column", // Stack button below
    alignItems: "stretch"
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: {
    marginTop: 12,
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", marginRight: 5 },

  // Text Common
  textBlock: { marginLeft: 14, flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  sub: { fontSize: 13, color: "#64748b", marginTop: 2 },
  
  // Extra
  signalBadge: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 
  }
});