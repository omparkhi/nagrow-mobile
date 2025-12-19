import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Platform
} from "react-native";
import { useSelector } from "react-redux";
import AppText from "@/components/AppText";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useHeaderVisibility } from "@/app/context/HeaderVisibilityContext";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 350; // Height of the Big Hero BG
const HEADER_MIN_HEIGHT = Platform.OS === "ios" ? 95 : 80; // Height of Sticky Bar
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function RiderProfileScreen() {
  const router = useRouter();
  const { setVisible } = useHeaderVisibility();
  const { rider } = useSelector((state) => state.riderAuth);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setVisible(false);
    return () => setVisible(true);
  }, []);

  if (!rider) return null;

  const handleEdit = () => {
    Alert.alert("Edit Profile", "Please contact support to update KYC details.");
  };

  // ================= ANIMATION INTERPOLATIONS =================

  // 1. Sticky Header Background Opacity (Transparent -> Solid Dark Blue)
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE - 50, SCROLL_DISTANCE],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  // 2. Big Profile (Center) - Scales down & Fades out
  const bigProfileOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const bigProfileScale = scrollY.interpolate({
    inputRange: [-50, 0],
    outputRange: [1.2, 1], // Zoom effect on pull down
    extrapolate: "clamp",
  });

  // 3. Small Profile (Sticky Left) - Slides Up & Fades In
  const smallProfileOpacity = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE - 50, SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const smallProfileTranslateY = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE - 50, SCROLL_DISTANCE],
    outputRange: [20, 0], // Slides up from bottom
    extrapolate: "clamp",
  });

  // 4. White Sheet Movement (Parallax)
  // Stops the sheet from scrolling indefinitely over the header
  const sheetTranslateY = scrollY.interpolate({
     inputRange: [0, SCROLL_DISTANCE],
     outputRange: [0, -50], // Moves slightly faster than scroll
     extrapolate: "clamp"
  });

  // ================= RENDER =================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* 1. FIXED BACKGROUND IMAGE/COLOR */}
      <View style={styles.fixedBackground}>
        {/* BIG CENTER PROFILE */}
        <Animated.View style={[styles.bigProfileContainer, { opacity: bigProfileOpacity, transform: [{ scale: bigProfileScale }] }]}>
            <View style={styles.avatarContainer}>
                <Image 
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/147/147142.png" }} 
                    style={styles.avatar} 
                />
                 {rider.isVerified && (
                    <View style={styles.verifiedBadge}>
                        <MaterialIcons name="verified" size={18} color="#fff" />
                    </View>
                )}
            </View>
            <AppText variant="h2" style={styles.bigName}>{rider.name}</AppText>
            <AppText variant="small" style={styles.riderId}>ID: {rider._id.slice(-8).toUpperCase()}</AppText>

            <View style={[styles.statusPill, { backgroundColor: rider.isOnline ? "#16a34a20" : "#ef444420" }]}>
                <View style={[styles.statusDot, { backgroundColor: rider.isOnline ? "#4ade80" : "#ef4444" }]} />
                <AppText variant="small" style={[styles.statusText, { color: rider.isOnline ? "#4ade80" : "#ef4444" }]}>
                    {rider.isOnline ? "Online" : "Offline"}
                </AppText>
            </View>
        </Animated.View>
      </View>

      {/* 2. STICKY HEADER (Sits on Top) */}
      <Animated.View style={[styles.stickyHeader, { backgroundColor: "#0f172a", opacity: headerOpacity }]} />
      
      {/* Sticky Header CONTENT (Separate to handle interactions vs background opacity) */}
      <View style={styles.stickyHeaderContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
             <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          
              {/* </View> */}

          {/* ANIMATED SMALL PROFILE (Left Aligned) */}
          <Animated.View style={[
              styles.stickyInfo, 
              { opacity: smallProfileOpacity, transform: [{ translateY: smallProfileTranslateY }] }
            ]}>
              <Image 
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/147/147142.png" }} 
                style={styles.smallAvatar} 
              />
              <View>
                  <AppText variant="small" style={styles.stickyName} numberOfLines={1}>{rider.name}</AppText>
                  <AppText variant="small" style={styles.stickyStatus}>{rider.isOnline ? "Online" : "Offline"}</AppText>
              </View>
          </Animated.View>

          <TouchableOpacity onPress={handleEdit} style={styles.iconBtn}>
             <MaterialIcons name="edit" size={20} color="#fff" />
          </TouchableOpacity>
      </View>

      {/* 3. SCROLLVIEW */}
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT - 30 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={styles.whiteSheet}>
           <View style={styles.handleBarCenter}><View style={styles.handleBar} /></View>

          {/* OVERLAPPING STATS */}
          <View style={styles.statsRow}>
            <InfoCard icon="star" color="#eab308" label="Rating" value="0" sub="Excellent" />
            <InfoCard icon="bicycle" color="#3b82f6" label="Delivered" value="0" sub="Orders" />
            <InfoCard icon="time" color="#a855f7" label="Joined" value="0" sub="Years" />
          </View>

          {/* DETAILS */}
          <View style={styles.section}>
            <AppText variant="small" style={styles.sectionTitle}>Personal Details</AppText>
            <View style={styles.card}>
              <DetailRow icon="call-outline" label="Phone" value={`+91 ${rider.phone}`} />
              <Divider />
              <DetailRow icon="mail-outline" label="Email" value={rider.email || "Not provided"} />
              <Divider />
              <DetailRow icon="water-outline" label="Blood Group" value="O+ Positive" />
              <Divider />
              <DetailRow icon="location-outline" label="City" value="Nagpur, MH" />
            </View>
          </View>

          <View style={styles.section}>
            <AppText variant="small" style={styles.sectionTitle}>Vehicle Information</AppText>
            <View style={styles.card}>
              <View style={styles.vehicleRow}>
                <View style={styles.vehicleIconBox}>
                  <FontAwesome5 name="motorcycle" size={24} color="#0f172a" />
                </View>
                <View>
                  <AppText variant="small" style={styles.vehicleName}>{rider?.documents?.vehicleName || "Honda Activa 6G"}</AppText>
                  <AppText variant="small" style={styles.vehiclePlate}>{rider?.documents?.vehicleNo || "MH 31 FE 4492"}</AppText>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <AppText variant="small" style={styles.sectionTitle}>Documents & KYC</AppText>
            <View style={styles.card}>
              <DocumentRow label="Driving License" isVerified={true} />
              <Divider />
              <DocumentRow label="Vehicle Insurance" isVerified={true} />
              <Divider />
              <DocumentRow label="Aadhar Card" isVerified={true} />
            </View>
          </View>

          {/* Extra padding for scroll */}
          <View style={{height: 50}} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ---------------- HELPERS (Same as before) ---------------- */
const InfoCard = ({ icon, color, label, value, sub }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={20} color={color} />
    <AppText variant="small" style={{ fontSize: 18, color: "#0f172a" }}>{value}</AppText>
    <AppText variant="small" style={{ fontSize: 10, color: "#64748b" }}>{label}</AppText>
  </View>
);
const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLeft}>
      <Ionicons name={icon} size={18} color="#94a3b8" />
      <AppText variant="small" style={styles.detailLabel}>{label}</AppText>
    </View>
    <AppText variant="small" style={styles.detailValue}>{value}</AppText>
  </View>
);
const DocumentRow = ({ label, isVerified }) => (
  <View style={styles.detailRow}>
    <AppText variant="small" style={styles.docLabel}>{label}</AppText>
    <View style={styles.verifiedTag}>
      <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
      <AppText variant="small" style={styles.verifiedText}>Verified</AppText>
    </View>
  </View>
);
const Divider = () => <View style={styles.divider} />;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  // 1. FIXED BG
  fixedBackground: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: HEADER_MAX_HEIGHT, backgroundColor: "#0f172a",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 0
  },
  bigProfileContainer: { alignItems: 'center' },
  avatarContainer: { padding: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 60, marginTop: -20 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: "#0f172a" },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: "#16a34a", borderRadius: 12, padding: 3, borderWidth: 3, borderColor: "#0f172a" },
  bigName: { color: "#fff", fontSize: 24 },
  riderId: { color: "#94a3b8", fontSize: 13 },
  statusPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 12 },

  // 2. STICKY HEADER (BG & CONTENT)
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: HEADER_MIN_HEIGHT, zIndex: 99
  },
  stickyHeaderContent: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: HEADER_MIN_HEIGHT, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 40 : 10
  },
  stickyInfo: {
    flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 15,
  },
  smallAvatar: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: "#fff", marginRight: 10
  },
  stickyName: { color: "#fff", fontSize: 16},
  stickyStatus: { color: "#4ade80", fontSize: 10 },
  iconBtn: { padding: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)" },

  // 3. WHITE SHEET
  whiteSheet: {
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 1000, // Forces scroll height
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  handleBarCenter: { alignItems: 'center', width: '100%', paddingVertical: 12 },
  handleBar: { width: 40, height: 4, backgroundColor: "#cbd5e1", borderRadius: 2 },

  // STATS
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25, marginTop: -60 },
  statCard: { width: "31%", backgroundColor: "#fff", borderRadius: 16, paddingVertical: 16, alignItems: "center", elevation: 4, shadowColor: "#0f172a", shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },

  // COMMON
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 1 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  detailLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailLabel: { color: "#64748b", fontSize: 14 },
  detailValue: { color: "#0f172a", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#f1f5f9" },
  vehicleRow: { flexDirection: "row", alignItems: "center", gap: 15 },
  vehicleIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  vehicleName: { fontSize: 16, color: "#0f172a" },
  vehiclePlate: { fontSize: 13, color: "#64748b", marginTop: 2, backgroundColor: "#f1f5f9", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: "flex-start", overflow: "hidden" },
  docLabel: { fontSize: 14, color: "#334155" },
  verifiedTag: { flexDirection: "row", alignItems: "center", gap: 4 },
  verifiedText: { fontSize: 12, color: "#16a34a" },
});