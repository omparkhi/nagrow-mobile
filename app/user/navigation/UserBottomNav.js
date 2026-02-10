import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Dimensions, ActivityIndicator } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { useSelector } from "react-redux";
import { LayoutGrid, Home, ClipboardList, Navigation, Bike, RotateCw, RefreshCcw, HomeIcon  } from "lucide-react-native";
import { clearCurrentOrder } from "@/redux/slices/user/userOrderSlice";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { useBottomBarVisibility } from "@/app/context/NavBarVisibilityContext";
import RootWrapper from "@/app/rootWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { MaterialIcons } from "@expo/vector-icons";


const { width } = Dimensions.get("window");

export default function UserBottomNav() {
  const insets = useSafeAreaInsets();
  const [navLoading, setNavLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); 
  const { currentOrder, activeOrders, loading } = useSelector((state) => state.userOrder);

  const { visibilityAnim } = useBottomBarVisibility();

  const translateY = visibilityAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });

  // --- COLORS ---
  const ACTIVE_COLOR = "#ff6a00ff"; // Orange
  const INACTIVE_COLOR = "#666"; // Gray
  const LIVE_COLOR = "#00c51eff";     // Red (For pulsing live status)

  // --- LOGIC: Check if Order is truly Live ---
  // We remove '&& null' and check valid statuses
  const hasActiveList = activeOrders && activeOrders.length > 0;
  const hasCurrentOrder = 
  currentOrder?._id && // Ensure it's a real order with an ID
  currentOrder?.status && // Ensure it has a status
  !["delivered", "cancelled"].includes(currentOrder.status.toLowerCase()); // Handle case sensitivity
  
  const isLive = hasActiveList || hasCurrentOrder;

//   // 🔍 DEBUG LOGS
// console.log("--- DEBUG BOTTOM NAV ---");
// console.log("Active Orders Count:", activeOrders?.length);
// console.log("Current Order:", currentOrder?._id);
// console.log("Is Live?:", isLive);

  // --- ANIMATION ---
  const scaleAnim = useRef(new Animated.Value(1)).current;

useEffect(() => {
    let animation;
    if (isLive) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      animation.start();
    } else {
      scaleAnim.setValue(1); 
    }
    return () => animation?.stop();
  }, [isLive]);

  // --- HELPER: Determine if a tab is active ---
  const isTabActive = (keywords) => {
    // Returns true if the current path contains the keyword (e.g., "dashboard", "profile")
    if (Array.isArray(keywords)) {
      return keywords.some(k => pathname.includes(k));
    }
    return pathname.includes(keywords);
  };

  const isOrdersTabActive = 
      isTabActive(["order", "NoLiveOrder"]) &&  
      !pathname.includes("reorder-page");

  const handleOrderTabPress = () => {
    console.log("live order")

    // if (loading || navLoading) return;
    setNavLoading(true);
    if (isLive) {
      if (activeOrders && activeOrders.length > 1) {
            console.log("Navigating to Active Orders List (Count > 1)");
            router.push("/user/order/active-order");
      } else if (activeOrders && activeOrders.length === 1) {
            console.log("Navigating to Single Active Order");
            router.push({
              pathname: `/user/order/${currentOrder._id}`,
              params: { orderId: currentOrder._id }
            });
      } else {
        router.push("/user/order/active-order");
      }
    } else {
      // No Live Orders
      router.push("/user/NoLiveOrder");
    }
    setNavLoading(false);
  }


  return (
    // <RootWrapper immersive={true} bottomSafeAreaColor="white" >
    <Animated.View style={[
    styles.container,
    {
      transform: [{ translateY }],
      // marginBottom: insets.bottom
    },
  ]}>
      
      {/* 1. HOME TAB */}
      <TouchableOpacity 
        style={styles.tab} 
        navigate={true}
        onPress={() => router.push("/user/dashboard/dash")}
        activeOpacity={0.7}
      >
        {/* <Ionicons 
          name="home" 
          size={24} 
          // Checks for "dashboard" or "home" in URL
          
        /> */}
        {/* <LayoutGrid size={24} color={isTabActive(["dashboard", "home"]) ? ACTIVE_COLOR : INACTIVE_COLOR}  strokeWidth={2} /> */}
        {/* <MaterialIcons name="home" size={18} color={isTabActive(["dashboard", "home"]) ? ACTIVE_COLOR : INACTIVE_COLOR}  /> */}
        <Navigation size={18} color={isTabActive(["dashboard", "home"]) ? ACTIVE_COLOR : INACTIVE_COLOR} fill={isTabActive(["dashboard", "home"]) ? ACTIVE_COLOR : INACTIVE_COLOR} />

        <AppText 
          variant="small" 
          style={[
            styles.label, 
            { color: isTabActive(["dashboard", "home"]) ? ACTIVE_COLOR : INACTIVE_COLOR }
          ]}
        >
          Home
        </AppText>
      </TouchableOpacity>

      {/* 2. ORDERS / LIVE TAB */}
      <TouchableOpacity 
        style={styles.tab}
        navigate={true}
        activeOpacity={0.7}
        onPress={handleOrderTabPress}
      >
        {navLoading ? (
          <View style={{ height: 28, justifyContent: 'center' }}>
                <ActivityIndicator size="small" color={isLive ? LIVE_COLOR : ACTIVE_COLOR} />
             </View>
        ) : (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            {isLive ? (
                 <View style={styles.liveBadgeContainer}>
                    {/* <MaterialIcons name="delivery-dining" size={28} /> */}
                    <Bike size={18} color={LIVE_COLOR} strokeWidth={2} />
                    <View style={styles.redDot} />
                 </View>
            ) : (
                  <ClipboardList size={18} color={isOrdersTabActive ? ACTIVE_COLOR : INACTIVE_COLOR}  strokeWidth={2} />

            )}
        </Animated.View>
        )}
        
        <AppText 
          variant="small" 
          style={[
            styles.label, 
            { 
              // If Live: Use Live Color (Red). If Not Live: Use Active(Orange)/Inactive(Gray) logic
              color: isLive ? LIVE_COLOR : (isOrdersTabActive ? ACTIVE_COLOR : INACTIVE_COLOR),
              fontWeight: (isLive || isOrdersTabActive) ? "bold" : "normal"
            }
          ]}
        >
            {isLive ? "Live Order" : "Orders"}
        </AppText>
      </TouchableOpacity>


      <TouchableOpacity 
        style={styles.tab} 
        navigate={true}
        onPress={() => router.push("/user/order/reorder-page")}
        activeOpacity={0.7}
      >
        {/* <FontAwesome5 
          name="user" 
          size={22} 
          
        /> */}
        <RefreshCcw 
          size={17} 
          color={isTabActive("reorder-page") ? ACTIVE_COLOR : INACTIVE_COLOR} 
        />
        <AppText 
          variant="small" 
          style={[
            styles.label, 
            { color: isTabActive("reorder-page") ? ACTIVE_COLOR : INACTIVE_COLOR }
          ]}
        >
          Reorder
        </AppText>
      </TouchableOpacity>

      {/* 3. PROFILE TAB */}
      <TouchableOpacity 
        style={styles.tab} 
        navigate={true}
        onPress={() => router.push("/user/profile/page")}
        activeOpacity={0.7}
      >
        <FontAwesome5 
          name="user" 
          size={18} 
          color={isTabActive("profile") ? ACTIVE_COLOR : INACTIVE_COLOR} 
        />
        <AppText 
          variant="small" 
          style={[
            styles.label, 
            { color: isTabActive("profile") ? ACTIVE_COLOR : INACTIVE_COLOR }
          ]}
        >
          Account
        </AppText>
      </TouchableOpacity>
      

    </Animated.View>
    // </RootWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 45, // Slightly taller for better touch area
    paddingBottom: 5, 
    borderTopWidth: 1, // Changed to Top border for cleaner look
    borderTopColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#ebebebff",
    elevation: 20, 
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // zIndex: 999,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1, // Ensures equal spacing
    marginTop: 5
    // height: "100%",
  },
  
  label: {
    fontSize: 9,
    // marginTop: 4
  },
  liveBadgeContainer: {
    position: 'relative',
  },
  redDot: {
    position: "absolute",
    top: 0,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00c51eff", 
    borderWidth: 1,
    borderColor: "#fff"
  }
});