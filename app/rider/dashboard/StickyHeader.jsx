import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import AppText from "@/components/AppText";
import { useSelector } from "react-redux";
import LottieView from "lottie-react-native";
import Scan from "@/assets/Scan.json";
import { getAddressFromCoords } from "@/utils/getAddressFromCoords";
import { Check, X } from "lucide-react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function RiderStickyHeader() {
    const router = useRouter();
    const { rider } = useSelector(state => state.riderAuth);
    const [address, setAddress] = useState("Fetching location...");
    const insets = useSafeAreaInsets();

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

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <View style={styles.topRow}>
                <View style={styles.row}>
            {/* <View style={styles.roundIcon}> */}
            <View style={{  alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="location" size={25} color="#f8faff" style={{ zIndex: 999 }} />
              <LottieView 
              source={Scan}
              autoPlay
              loop
              style={{ position: "absolute", width: 40, height: 40 }}
              />
            </View>
            {/* </View> */}
            <View style={{  }}>
                <AppText variant="small" style={styles.sub}>Live Tracking</AppText>
                <AppText variant="small" numberOfLines={1} ellipsizeMode="tail" style={styles.title} >{address}</AppText>
                
            </View>
        </View>

        <View style={{  flexDirection: "row", alignItems: "center", right: 25 }}>
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
      </View>

      <View style={{ backgroundColor: "#ffffff19", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 15, marginTop: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{  }}>
                <AppText variant="small" style={{ fontSize: 15, color: "white" }}>Your Status</AppText>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  <View style={{ backgroundColor: rider?.isOnline ? "#00bc45" : "#ff741e", padding: 2, borderRadius: 10 }}>
                    {rider?.isOnline ? <Check size={12} color="#0f172a" strokeWidth={5} /> : <X size={12} color="#0f172a" strokeWidth={5} />}
                  </View>
                  <AppText variant="small" style={{ fontSize: 12, fontFamily: "Nunito", color: rider?.isOnline ? "#00bc45" : "#ff741e" }}>{rider?.isOnline ? "Open for new delivery" : "You are offline"}</AppText>
                </View>
            </View>
            <View style={[styles.toggleBtn, rider?.isOnline ? styles.toggleOnline : styles.toggleOffline]}>
                <AppText variant="small" style={[styles.toggleText, rider?.isOnline ? styles.toggleTextOnline : styles.toggleTextOffline]}>
                    {rider?.isOnline ? "ONLINE" : "OFFLINE"}
                </AppText>
                
            </View>
        </View>
      </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingBottom: 10,
    zIndex: 10,
    borderRadius: 24,
  },
    
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  iconBtn: {
    padding: 8,
    // marginRight: 5,
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

  title: { width: "80%" , marginLeft: 12, fontSize: 12, color: "#ffffff", fontFamily: "Nunito" },
  
  sub: { fontSize: 15, marginLeft: 12, color: "#ffffff" },

  nameBlock: {
    flex: 1,
    marginLeft: 5,
  },

  riderName: {
    marginTop: 15,
    fontSize: 25,
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
    // position: "absolute",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    // top: -2,
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
})