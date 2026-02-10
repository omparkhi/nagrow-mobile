// components/RiderHeader.jsx
import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Platform } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "@/components/AppText";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAddressFromCoords } from "@/utils/getAddressFromCoords";
import RiderBike from "@/assets/Rider-Bike-Image.png";
import { Check, IndianRupee, X } from "lucide-react-native";
import Scan from "@/assets/Scan.json";
import LottieView from "lottie-react-native";


export default function RiderBanner({ onMenuPress }) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [address, setAddress] = useState("Fetching location...");

const { rider, loading, error } = useSelector(state => state.riderAuth);
const { earnings } = useSelector(state => state.riderStats);
// const isOnline = true;

  const [available, setAvailable] = useState(false);

  useEffect(() => setAvailable(), []);

  //   // Reverse Geocode Address
  // useEffect(() => {
  //   if (rider?.location?.lat && rider?.location?.lng) {
  //       (async () => {
  //           const address = await getAddressFromCoords(
  //               rider.location.lat,
  //               rider.location.lng
  //           );
  //           setAddress(address || "Unknown location")
  //       })();
  //   }
  // }, [rider])

  const toggle = () => {
    const newState = !available;
    setAvailable(newState);
    // onToggleAvailability(newState);
  };

  return (
    <View style={styles.headerWrap}>
     <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
        <View>
          <AppText style={styles.riderName} numberOfLines={1}>{rider?.name}</AppText>
            <AppText style={{ color: "#d6d6d6", fontSize: 18, fontFamily: "Nunito" }}>Today's Earnings</AppText>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <IndianRupee size={25} color= "#ff8411" />
                <AppText style={{ color: "#ff8411", fontSize: 30}}>{Number(earnings).toFixed(2)}</AppText>
            </View>
            
        </View>
        {/* <Image source={RiderBike} style={{ width: 165, height: 165, top: -28 }} /> */}
        {/* 🌟 MODIFIED SECTION FOR GLOW 🌟 */}
        <View style={styles.bikeContainer}>
           {/* The Glow Effect */}
           <LinearGradient
              // Colors: Light blue with opacity -> Transparent
              // Adjust the first color to match the exact "light dark blue" you want.
              // Try: '#3b82f660' (bright blue) or '#0ea5e960' (sky blue)
              colors={['#00a2f95b', '#0f172a00']}
              start={{ x: 0.5, y: 0.5 }} // Start glow from center
              end={{ x: 1, y: 1 }} // Fade out radially
              style={styles.bikeGlow}
           />
           {/* The Bike Image */}
           <Image
             source={RiderBike}
             style={{ width: 165, height: 165 }}
             resizeMode="contain"
           />
        </View>
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
    // height: 330,/
    // paddingTop: 10,
    paddingBottom: 26,
    paddingHorizontal: 12,
    // backgroundColor: "#
    // ",
    // backgroundImage: "linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    // elevation: 12,
    // shadowColor: "#000",
    // shadowOpacity: 0.2,
    // shadowRadius: 12,
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

  title: { fontSize: 12, color: "#ffffff", fontFamily: "Nunito" },
  sub: { fontSize: 15, color: "#ffffff" },

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
  bikeContainer: {
    width: 165,
    height: 165,
    top: -18, // Moved the negative margin here on the container
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Ensure it's behind the text if they overlap
  },
  bikeGlow: {
    position: 'absolute',
    width: 130, // Slightly larger than the image
    height: 130,
    borderRadius: 90, // Makes it a circle
    // Centers the glow behind the image
    // top: -7.5,
    // left: -7.5,
  }

});
