import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  Animated,
  Dimensions,
  Platform
} from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { useSelector } from "react-redux";
import AppText from "@/components/AppText";
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/user/authSlice";
import OrderHistory from "@/app/rider/history/page";
import UserPastOrder from "../order/order-history";

const { width } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 300; // Height of the Big Hero BG
const HEADER_MIN_HEIGHT = Platform.OS === "ios" ? 95 : 80; // Height of Sticky Bar
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const PRIMARY_COLOR = "#141414"; // Replaced #0f172a

export default function UserProfileScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Assuming you have a user slice, if not, use dummy data or rider slice for now
  const user = useSelector((state) => state.auth?.user); 
  
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleEdit = () => {
    router.push("/user/edit-profile"); // Example route
  };

  // ================= ANIMATION INTERPOLATIONS =================

  // 1. Sticky Header Background Opacity
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE - 50, SCROLL_DISTANCE],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  // 2. Big Profile (Center)
  const bigProfileOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const bigProfileScale = scrollY.interpolate({
    inputRange: [-50, 0],
    outputRange: [1.2, 1],
    extrapolate: "clamp",
  });

  // 3. Small Profile (Sticky Left)
  const smallProfileOpacity = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE - 50, SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const smallProfileTranslateY = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE - 50, SCROLL_DISTANCE],
    outputRange: [20, 0],
    extrapolate: "clamp",
  });

  // ================= RENDER =================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />

      {/* 1. FIXED BACKGROUND IMAGE/COLOR */}
      <View style={styles.fixedBackground}>
        {/* BIG CENTER PROFILE */}
        <Animated.View style={[styles.bigProfileContainer, { opacity: bigProfileOpacity, transform: [{ scale: bigProfileScale }] }]}>
            <View style={styles.avatarContainer}>
                {/* User Avatar - using a nice 3D avatar or user image */}
                <Image 
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/147/147142.png" }} 
                    style={styles.avatar} 
                />
                 {user?.isPrime && (
                    <View style={styles.crownBadge}>
                        <MaterialCommunityIcons name="crown" size={16} color="#fff" />
                    </View>
                )}
            </View>
            <AppText variant="h2" style={styles.bigName}>{user?.firstName} {user?.lastName}</AppText>
            <AppText variant="small" style={styles.userPhone}>+91 {user?.phone}</AppText>
            <AppText variant="small" style={styles.userEmail}>{user?.email}</AppText>

            {/* User Level / Membership Pill */}
            {/* <View style={styles.membershipPill}>
                <MaterialCommunityIcons name="star-face" size={14} color="#eab308" />
                <AppText variant="small" style={styles.membershipText}>Gold Member</AppText>
            </View> */}
        </Animated.View>
      </View>

      {/* 2. STICKY HEADER (Sits on Top) */}
      <Animated.View style={[styles.stickyHeader, { backgroundColor: PRIMARY_COLOR, opacity: headerOpacity }]} />
      
      {/* Sticky Header CONTENT */}
      <View style={styles.stickyHeaderContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
             <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

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
                  <AppText variant="small" style={styles.stickyName} numberOfLines={1}>{user?.firstName} {user?.lastName}</AppText>
                  <AppText variant="small" style={styles.stickyPhone}>+91 {user?.phone}</AppText>
              </View>
          </Animated.View>

          {/* <TouchableOpacity onPress={handleEdit} style={styles.iconBtn}>
             <Ionicons name="settings-sharp" size={20} color="#fff" />
          </TouchableOpacity> */}
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

          {/* OVERLAPPING STATS (User Centric) */}
          <View style={styles.statsRow}>
            <InfoCard icon="wallet" color="#16a34a" label="Wallet" value="₹450" sub="Balance" />
            <InfoCard icon="heart" color="#ef4444" label="Favorites" value="12" sub="Saved" />
            <InfoCard icon="receipt" color="#3b82f6" label="Orders" value="54" sub="Total" />
          </View>

          {/* SECTION 1: MY ACCOUNT */}
          <View style={styles.section}>
            <AppText variant="small" style={styles.sectionTitle}>My Account</AppText>
            <View style={styles.card}>
              <MenuItem icon="person-outline" label="My Profile" subLabel="Edit personal details" onPress={() => router.push("/user/profile/edit-page")} />
              <Divider />
              <MenuItem icon="location-outline" label="Manage Addresses" subLabel="Home, Office, Other" onPress={() => router.push("/user/address/address-card")} />
              {/* <Divider />
              <MenuItem icon="card-outline" label="Payment Methods" subLabel="Cards, UPI" /> */}
            </View>
          </View>

          {/* SECTION 2: FOOD & ORDERS */}
          <View style={styles.section}>
            <AppText variant="small" style={styles.sectionTitle}>Food Journey</AppText>
            <View style={styles.card}>
              <TouchableOpacity style={styles.adRow} onPress={() => router.push("/user/order/reorder-page")}>
                <View style={[styles.iconBox, { backgroundColor: "#fff1f2" }]}>
                  <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#e11d48" />
                </View>
                <View style={{flex: 1}}>
                  <AppText variant="small" style={styles.menuLabel}>Your Orders</AppText>
                  <AppText variant="small" style={styles.menuSubLabel}>Track, view or repeat orders</AppText>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>

              <Divider />

              <TouchableOpacity style={styles.adRow} onPress={() => router.push("/user/profile/favorite")} >
                <View style={[styles.iconBox, { backgroundColor: "#fdf0f0ff" }]}>
                   <Ionicons name="heart" size={20} color="#ef4444" />
                </View>
                 <View style={{flex: 1}}>
                  <AppText variant="small" style={styles.menuLabel}>Collections</AppText>
                  <AppText variant="small" style={styles.menuSubLabel}>Your bookmarked places</AppText>
                </View>
                 <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </View>

           {/* SECTION 3: HELP & SUPPORT */}
           <View style={styles.section}>
            <AppText variant="small" style={styles.sectionTitle}>More</AppText>
            <View style={styles.card}>
              <MenuItem icon="help-buoy-outline" label="Help & Support" subLabel="FAQs & Chat" />
              {/* <Divider />
              <MenuItem icon="gift-outline" label="Refer & Earn" subLabel="Invite friends" isNew={true} /> */}
              <Divider />
              <MenuItem icon="log-out-outline" label="Logout" subLabel="" isDestructive={true} onPress={() => dispatch(logout())} />
            </View>
          </View>

        <UserPastOrder />
          {/* Extra padding for scroll */}
          <View style={{height: 80}} />
        </View>

      </Animated.ScrollView>
    </View>
  );
}

/* ---------------- HELPERS ---------------- */

const InfoCard = ({ icon, color, label, value, sub }) => (
  <View style={styles.statCard}>
    <View style={{backgroundColor: color + '15', padding: 8, borderRadius: 50, marginBottom: 4}}>
         <Ionicons name={icon} size={18} color={color} />
    </View>
    <AppText variant="small" style={{ fontSize: 16, color: PRIMARY_COLOR, fontWeight: "600" }}>{value}</AppText>
    <AppText variant="small" style={{ fontSize: 10, color: "#64748b" }}>{label}</AppText>
  </View>
);

const MenuItem = ({ icon, label, subLabel, isNew, isDestructive, onPress }) => (
  <TouchableOpacity style={styles.detailRow} onPress={onPress}>
    <View style={styles.detailLeft}>
      <Ionicons name={icon} size={20} color={isDestructive ? "#ef4444" : "#64748b"} />
      <View>
          <AppText variant="small" style={[styles.detailLabel, isDestructive && {color: "#ef4444"}]}>{label}</AppText>
          {subLabel ? <AppText variant="small" style={styles.detailSubLabel}>{subLabel}</AppText> : null}
      </View>
    </View>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {isNew && <View style={styles.newBadge}><AppText style={styles.newBadgeText}>NEW</AppText></View>}
        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
    </View>
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  // 1. FIXED BG
  fixedBackground: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: HEADER_MAX_HEIGHT, backgroundColor: PRIMARY_COLOR,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 0
  },
  bigProfileContainer: { alignItems: 'center' },
  avatarContainer: { padding: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 60, marginTop: -20 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: PRIMARY_COLOR },
  crownBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: "#eab308", borderRadius: 12, padding: 4, borderWidth: 3, borderColor: PRIMARY_COLOR },
  bigName: { color: "#fff", fontSize: 24, marginTop: 10, fontWeight: "600" },
  userPhone: { color: "#94a3b8", fontSize: 14, fontFamily: "Nunito",},
  userEmail: { color: "#94a3b8", fontSize: 12, fontFamily: "Nunito", marginTop: -1 },
  membershipPill: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  membershipText: { fontSize: 12, color: "#fff", marginLeft: 4, fontWeight: "600" },

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
  stickyName: { color: "#fff", fontSize: 16 },
  stickyPhone: { color: "#cbd5e1", fontSize: 10 },
  iconBtn: { padding: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)" },

  // 3. WHITE SHEET
  whiteSheet: {
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 1000, 
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  handleBarCenter: { alignItems: 'center', width: '100%', paddingVertical: 12 },
  handleBar: { width: 40, height: 4, backgroundColor: "#cbd5e1", borderRadius: 2 },

  // STATS
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25, marginTop: -60 },
  statCard: { width: "31%", backgroundColor: "#fff", borderRadius: 16, paddingVertical: 12, alignItems: "center", elevation: 4, shadowColor: PRIMARY_COLOR, shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },

  // COMMON
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "600" },
  card: { backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, elevation: 1 },
  
  // MENU ITEMS
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14 },
  detailLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  detailLabel: { color: PRIMARY_COLOR, fontSize: 15, fontWeight: "500" },
  detailSubLabel: { color: "#94a3b8", fontSize: 11, fontFamily: "Nunito", marginTop: 1 },
  divider: { height: 1, backgroundColor: "#f1f5f9" },

  // SPECIAL ITEMS
  adRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 15, color: PRIMARY_COLOR, fontWeight: "600" },
  menuSubLabel: { fontSize: 11, color: "#64748b", fontFamily: "Nunito" },
  
  newBadge: { backgroundColor: "#e11d48", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  newBadgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
});