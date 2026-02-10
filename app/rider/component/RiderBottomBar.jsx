import React, { useState } from "react";
import { View, ActivityIndicator, Animated, StyleSheet, Dimensions } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useBottomBarVisibility } from "@/app/context/NavBarVisibilityContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";
import { HistoryIcon, Navigation } from "lucide-react-native";
import AppText from "@/components/AppText";
import { useRiderBottomBarVisibility } from "@/app/context/RiderNavBarVisiblityContext";

const { width } = Dimensions.get("window");

export default function RiderBootomBar() {
    const insets = useSafeAreaInsets();
    const [barLoading, setBarLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { visibilityAnim } = useRiderBottomBarVisibility();
    const { order } = useSelector(s => s.riderOrder);
    const hasLiveOrder = order && ["accepted", "preparing", "ready", "pick_up_by_rider", "on the way"].includes(order.status);

    const ACTIVE_COLOR = "#0f172a";
    const INACTIVE_COLOR = "#666";

    const translateY = visibilityAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [80, 0],
    });

    const isTabActive = (keywords) => {
        if (Array.isArray(keywords)) {
            return keywords.some(k => pathname.includes(k));
        }
        return pathname.includes(keywords);
    };


    return (
        <Animated.View style={[
        styles.container,
            {
            transform: [{ translateY }],
            // marginBottom: insets.bottom
            },
        ]}>
            <TouchableOpacity 
                style={[styles.tab,{ borderBottomWidth: isTabActive(["dashboard", "home"]) ? 2 : 0, borderBottomColor: isTabActive(["dashboard", "home"]) ? ACTIVE_COLOR : "#ffffff00", paddingVertical:  3}]}
                navigate={true}
                onPress={(() => router.push("/rider/dashboard/dash"))}
                activeOpacity={0.7}
            >
                {/* <View style={{ paddingVertical: 3, paddingHorizontal: 10, borderRadius: 10, backgroundColor: isTabActive(["dashboard", "home"]) ? "#78787851" : "#ffffff00" }} > */}
                    <Navigation size={18} color={isTabActive(["dashboard", "home"]) ? ACTIVE_COLOR : INACTIVE_COLOR} fill={isTabActive(["dashboard", "home"]) ? ACTIVE_COLOR : INACTIVE_COLOR} />
                {/* </View> */}
                
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
            <TouchableOpacity 
                style={[styles.tab,{ borderBottomWidth: isTabActive("order") ? 2 : 0, borderBottomColor: isTabActive("order") ? ACTIVE_COLOR : "#ffffff00", paddingVertical: 3 }]}
                navigate={true}
                onPress={(() => router.push("/rider/delivery/order"))}
                activeOpacity={0.7}
            >
                {/* <Navigation size={18} color={isTabActive("live-order") ? ACTIVE_COLOR : INACTIVE_COLOR} fill={isTabActive(["dashboard", "home"]) ? ACTIVE_COLOR : INACTIVE_COLOR} /> */}
                <MaterialCommunityIcons name="bike" size={18}  color={isTabActive("order") ? ACTIVE_COLOR : INACTIVE_COLOR} fill={isTabActive(["dashboard", "home"]) ? ACTIVE_COLOR : INACTIVE_COLOR} /> 
                <AppText 
                    variant="small" 
                    style={[
                    styles.label, 
                    { color: isTabActive("order") ? ACTIVE_COLOR : INACTIVE_COLOR }
                    ]}
                >
                    Order
                </AppText>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab,{ borderBottomWidth: isTabActive("earning") ? 2 : 0, borderBottomColor: isTabActive("earning") ? ACTIVE_COLOR : "#ffffff00", paddingVertical:  3}]}
                navigate={true}
                onPress={(() => router.push("/rider/earning/page"))}
                activeOpacity={0.7}
            >
                <MaterialIcons name="payments" size={18} color={isTabActive("earning") ? ACTIVE_COLOR : INACTIVE_COLOR} fill={isTabActive(["dashboard", "home"]) ? ACTIVE_COLOR : INACTIVE_COLOR} />
                <AppText 
                    variant="small" 
                    style={[
                    styles.label, 
                    { color: isTabActive("earning",) ? ACTIVE_COLOR : INACTIVE_COLOR,  }
                    ]}
                >
                    Earning
                </AppText>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab,{ borderBottomWidth: isTabActive(["history"]) ? 2 : 0, borderBottomColor: isTabActive(["history"]) ? ACTIVE_COLOR : "#ffffff00", paddingVertical:  3}]}
                navigate={true}
                onPress={(() => router.push("/rider/history/page"))}
                activeOpacity={0.7}
            >
                <HistoryIcon size={18} color={isTabActive(["history"]) ? ACTIVE_COLOR : INACTIVE_COLOR} />
                <AppText 
                    variant="small" 
                    style={[
                    styles.label, 
                    { color: isTabActive(["history"]) ? ACTIVE_COLOR : INACTIVE_COLOR }
                    ]}
                >
                    History
                </AppText>
            </TouchableOpacity>
        </Animated.View>
    )
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
    zIndex: 999,
  },
    tab: {
    paddingHorizontal: 15,
    // paddingVertical: 10,
    
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    // flex: 1, // Ensures equal spacing
    // marginTop: 5
    // height: "100%",
  },

    label: {
    fontSize: 10,
    // marginTop: 4
  },
})