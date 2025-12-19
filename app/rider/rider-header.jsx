// components/RiderHeader.jsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "@/components/AppText";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";


export default function RiderHeader({ onMenuPress }) {
  const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

const { rider, loading, error } = useSelector(state => state.riderAuth);
// const isOnline = true;

  const [available, setAvailable] = useState(false);

  useEffect(() => setAvailable(), []);

  const toggle = () => {
    const newState = !available;
    setAvailable(newState);
    // onToggleAvailability(newState);
  };

  return (
    <View style={styles.headerWrap}>
      {/* TOP ROW */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
          <Ionicons name="reorder-two-outline" size={26} color="#fff" />
        </TouchableOpacity>

        <View style={styles.nameBlock}>
          <AppText style={styles.riderName} numberOfLines={1}>{rider?.name}</AppText>
          <View style={styles.statusRow}>
            <View
              
            />

        <TouchableOpacity
            onPress={toggle}
            style={[styles.toggleBtn, rider?.isOnline ? styles.toggleOnline : styles.toggleOffline]}
            accessibilityRole="switch"
            accessibilityState={{ checked: rider?.isOnline }}
            accessibilityLabel={rider?.isOnline ? "Go offline" : "Go online"}
          >
            <AppText variant="small" style={[styles.toggleText, rider?.isOnline ? styles.toggleTextOnline : styles.toggleTextOffline]}>
              {rider?.isOnline ? "ONLINE" : "OFFLINE"}
            </AppText>
          </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={26} color="#fff" />
        </TouchableOpacity>

        

        <TouchableOpacity style={styles.avatarWrap} onPress={() => router.push("/rider/profile/page")}>
            <View style={styles.avatarPlaceholder}>
              {/* <Ionicons name="person" size={22} color="#2a3951ff" /> */}
              <MaterialIcons name="account-circle" size={33} color="white" />
            </View>
        </TouchableOpacity>
      </View>

      {/* BOTTOM STATS */}
      {/* <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Earnings</Text>
          <Text style={styles.statValue}>₹ {todayEarnings}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Orders</Text>
          <Text style={styles.statValue}>{todayOrders}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Rating</Text>
          <Text style={styles.statValue}>{rating || "—"}</Text>
        </View>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    position: "relative",
    paddingTop: 10,
    paddingBottom: 26,
    paddingHorizontal: 18,
    backgroundColor: "#0f172a",
    // backgroundImage: "linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBtn: {
    padding: 8,
    // marginRight: 5,
  },

  nameBlock: {
    flex: 1,
    marginLeft: 5,
  },

  riderName: {
    fontSize: 20,
    color: "#fff",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginRight: 5,
  },

  statusText: {
    color: "#f1f5f9",
    fontSize: 13,
  },

  toggleChip: {
    position: "absolute",
    top: -2,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  online: {
    backgroundColor: "#05cd70ff",
    borderWidth: 0.5,
    borderColor: "#34D399",
  },

  offline: {
    backgroundColor: "#FFF7ED",
    borderWidth: 0.5,
    borderColor: "#FDBA74",
  },

  toggleText: {
    color: "#fff",
    fontSize: 11,
  },

  avatarWrap: {
    marginLeft: 10,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#0f172a",
  },

  avatarPlaceholder: {
    // borderRadius: 10,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },

  
toggleBtn: {
    position: "absolute",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    top: -2,
    // marginLeft: 8,
    // minWidth: 86,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleOnline: {
    backgroundColor: "#ECFDF5",
    borderWidth: 0.5,
    borderColor: "#34D399",
  },
  toggleOffline: {
    backgroundColor: "#FFF7ED",
    borderWidth: 0.5,
    borderColor: "#FDBA74",
  },
  toggleText: {
    fontSize: 12,
  },
  toggleTextOnline: {
    color: "#065F46",
  },
  toggleTextOffline: {
    color: "#9A3412",
  },

});
