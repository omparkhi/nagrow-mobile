import React, { useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  RefreshControl,
  StatusBar,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { fetchActiveOrders, setCurrentOrderFromList } from "@/redux/slices/user/userOrderSlice";
import AppText from "@/components/AppText"; 
import { LinearGradient } from "expo-linear-gradient";
import { Navigation, Cross } from "lucide-react-native";
import restaurantImage from "@/assets/restaurant.jpg";
import { TouchableOpacity } from "@/app/TouchableOpacity";
// Assuming you have a standard Text component
// import LottieView from "lottie-react-native";
// import EmptyOrderAnim from "@/assets/animations/empty-order.json"; // You'll need an animation asset

// --- HELPER COMPONENT: PROGRESS BAR ---
const StatusProgressBar = ({ status }) => {
    const steps = ["placed", "preparing", "on the way", "delivered"];
    const activeIndex = steps.indexOf(status) === -1 ? 1 : steps.indexOf(status);
    
    // Normalizing status for "picked_up_by_rider" etc.
    let displayIndex = activeIndex;
    if (status === "accepted") displayIndex = 1;
    if (status === "ready") displayIndex = 1.5;
    if (status === "pick_up_by_rider") displayIndex = 2;

    const progress = (displayIndex / (steps.length - 1)) * 100;

    return (
        <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
    );
};

export default function ActiveOrdersPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { activeOrders, loading } = useSelector((state) => state.userOrder);

    // 1. Initial Load
    useEffect(() => {
        dispatch(fetchActiveOrders());
    }, [dispatch]);

    // useEffect(() => {
    //     console.log("active order: ", activeOrders)
    // })
    // 2. Pull to Refresh Logic
    const onRefresh = useCallback(() => {
        dispatch(fetchActiveOrders());
    }, [dispatch]);

    // 3. Navigation Handler
    const handleTrackOrder = (order) => {
        // Optimistic Update: Set current order immediately
        dispatch(setCurrentOrderFromList(order._id));
        router.push({ pathname: `/user/order/${order._id}`, params: { id: order._id } });
    };

    // --- RENDER ITEM ---
    const renderOrderCard = ({ item }) => {
        // 1. Create individual Item Badges
    const itemComponents = item.items.map((i, index) => (
        <View key={index} style={styles.itemBadge}>
            <AppText variant="small" style={styles.qtyText}>{i.quantity}x</AppText> 
            <AppText variant="small" style={styles.itemName} numberOfLines={1}>
                {i.menuItemId?.name}
            </AppText>
        </View>
    ));
        
        return (
            <TouchableOpacity 
                activeOpacity={0.9} 
                style={styles.card} 
                onPress={() => handleTrackOrder(item)}
            >
                {/* Header: Restaurant Info */}
                <LinearGradient 
                    colors={['#e9ebf1ff', 'rgba(255,255,255,0)']} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.95, y: 0 }}
                    style={styles.cardHeader}
                >
                    <Image 
                        source={ restaurantImage } 
                        style={styles.restImage} 
                    />
                    <View style={styles.headerText}>
                        <AppText variant="small" style={styles.restName}>{item.restaurantId?.name}</AppText>
                        <AppText variant="light" style={styles.restLocation}>{item.restaurantId?.address?.street || "Location"}</AppText>
                    </View>
                    <View style={styles.statusBadge}>
                        <AppText style={styles.statusText}>{item.status.replace(/_/g, " ").toUpperCase()}</AppText>
                    </View>
                </LinearGradient>

                {/* Progress Bar */}
                {/* <StatusProgressBar status={item.status} /> */}

                {/* --- BODY (FIXED LAYOUT) --- */}
                <View style={styles.cardBody}>
                    
                    {/* Left Side: Items Container */}
                    {/* We give this flex: 1 so it takes all available space except Price */}
                    <View style={styles.leftColumn}>
                        
                        {/* The Wrapper for Items */}
                        <View style={styles.itemsWrapper}>
                             {itemComponents}
                        </View>

                        {/* Date/Time moved below items */}
                        <AppText variant="small" style={styles.dateText}>
                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                            {" • "} 
                            {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                        </AppText>
                    </View>

                    {/* Right Side: Price */}
                    <AppText variant="small" style={styles.priceText}>₹{item.totalAmount}</AppText>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Footer: Live Info & CTA */}
                <View style={styles.cardFooter}>
                    <View style={styles.liveInfo}>
                         {item.live?.etaMinutes > 0 ? (
                             <>
                                <Ionicons name="time" size={16} color="#16A34A" />
                                <AppText style={styles.liveText}>Arriving in {item.live.etaMinutes} mins</AppText>
                             </>
                         ) : (
                             <AppText style={[styles.liveText, {color: "#64748b"}]}>Calculating ETA...</AppText>
                         )}
                    </View>

                    <TouchableOpacity style={styles.trackBtn} onPress={() => handleTrackOrder(item)}>
                        <AppText style={styles.trackBtnText}>Track Order</AppText>
                        <MaterialIcons name="chevron-right" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    // --- EMPTY STATE ---
    if (!loading && activeOrders.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    {/* Placeholder if Lottie not available */}
                    <View style={styles.iconCircle}>
                         <FontAwesome5 name="hamburger" size={50} color="#cbd5e1" />
                    </View>
                    {/* <LottieView source={EmptyOrderAnim} autoPlay loop style={{width: 200, height: 200}} /> */}
                    
                    <AppText variant="h2" style={{marginTop: 20, color: "#334155"}}>No Active Orders</AppText>
                    <AppText variant="body" style={{textAlign: 'center', color: "#64748b", marginTop: 8, paddingHorizontal: 40}}>
                        Hungry? Place an order now and track it live here!
                    </AppText>
                    
                    <TouchableOpacity style={styles.browseBtn} onPress={() => router.push("/home")}>
                        <AppText style={styles.browseBtnText}>Browse Food</AppText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            // <View>
            //     <ActivityIndicator />
            // </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" /> */}
            
            {/* <View style={styles.}> */}
                <LinearGradient 
                    colors={['#fab082ff', '#ffffff3c']} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.99, y: 0 }}
                    style={styles.pageHeader}
                >
                    <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 16, }}>
                        <Ionicons name="arrow-back" size={25} color="#141414" />
                    </TouchableOpacity>
                    <View style={{ width: "100%", flexDirection: "column", position: "relative" }}>
                    <AppText variant="small" style={styles.pageTitle}>Live Orders</AppText> 
                    {loading && <ActivityIndicator size="small" color="#fd731d" />}
                {/* </View> */}
                    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5 , position: "absolute", marginTop: 20 }}>
                        <AppText variant="light" style={styles.pageSubtitle}>
                        {activeOrders.length === 1 
                            ? "Tracking 1 delicious order" 
                            : `Tracking ${activeOrders.length} active deliveries`}
                        </AppText>
                        <Navigation size={18} color="#fd731d" strokeWidth={2} />
                    </View>
                <LinearGradient 
                    colors={['#f67f34ff', '#ffffff3c']} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.99, y: 0 }}
                    style={ styles.subpageHeader }
                >
                    <AppText variant="light" style={{ fontSize: 12, color: "#fff" }}>Happiness is on the way</AppText> 
                </LinearGradient>
                    
                </View>
            {/* </View> */}
            </LinearGradient>

            <FlatList
                data={activeOrders}
                keyExtractor={(item) => item._id}
                renderItem={renderOrderCard}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={["#fd731d"]} />
                }
            />
        </SafeAreaView>
    );
}

// --- STYLES (Swiggy/UberEats Inspired) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#f4f5f7", // Light Gray Background
    },
    pageHeader: {
        marginTop: -30,
        height: 120,
        // paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    subpageHeader: {
        position: "absolute",
        // height: 50,
        width: "80%",
        marginTop: 40,
        marginLeft: -40,
        paddingHorizontal: 10,
        paddingVertical: 4,
        flexDirection: "row",
        // gap: 10,
        alignItems: "center",
        borderRadius: 5,
    },
    pageTitle: {
        fontSize: 18,
        color: "#141414",
    },
    pageSubtitle: {
        fontSize: 12,
        color: "#141414",
    },
    // CARD STYLES
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 16,
        padding: 5,
        borderWidth: 1,
        borderColor: "#e4e1e1ff"
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 4,
        borderRadius: 10
        // marginBottom: 12,
    },
    restImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: "#e2e8f0",
    },
    headerText: {
        flex: 1,
        marginLeft: 12,
    },
    restName: {
        color: "#1e293b",
        textTransform: "capitalize"
    },
    restLocation: {
        fontSize: 11,
        color: "#242424ff",
        marginTop: -4
    },
    statusBadge: {
        backgroundColor: "#fff7ed",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#fdba74",
    },
    statusText: {
        fontSize: 10,
        color: "#c2410c", // Dark Orange
    },
    // PROGRESS BAR
    progressContainer: {
        height: 4,
        backgroundColor: "#f1f5f9",
        borderRadius: 2,
        marginBottom: 12,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#22c55e", // Green Progress
    },
    // BODY LAYOUT
    cardBody: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start", // Top align is important for wrapping
        marginBottom: 12,
        padding: 10
    },

    // 1. LEFT COLUMN (Takes available space)
    leftColumn: {
        flex: 1, 
        marginRight: 10, // Push away from price
    },

    // 2. ITEMS WRAPPER
    itemsWrapper: {
        flexDirection: "row",
        flexWrap: "wrap",    // 👈 Force wrap
        alignItems: "center",
        // Removed 'gap' as it fails on some RN versions
    },

    // 3. INDIVIDUAL BADGE (Using Margin instead of Gap)
    itemBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f5f9",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        
        // 👇 Spacing controls
        marginRight: 8, // Space to the right
        marginBottom: 6, // Space to the bottom (for when it wraps)
    },
    
    qtyText: {
        fontSize: 12,
        color: "#475569",
        marginRight: 4,
    },
    itemName: {
        fontSize: 12,
        color: "#334155",
        maxWidth: 140, // Prevent super long names from breaking layout
    },

    dateText: {
        fontSize: 11,
        color: "#94a3b8",
        marginTop: 4, 
    },
    priceText: {
        fontSize: 16,
        color: "#1e293b",
        marginTop: 2, // Align with the first row of items visually
    },
    divider: {
        height: 1,
        backgroundColor: "#f1f5f9",
        // marginVertical: 4,
    },
    // FOOTER
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 5,
    },
    liveInfo: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0fdf4", // Light Green
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 10,
    },
    liveText: {
        fontSize: 12,
        color: "#15803d",
        marginLeft: 4,
    },
    trackBtn: {
        backgroundColor: "#fd731d",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 9,
    },
    trackBtnText: {
        color: "#fff",
        fontSize: 14,
        marginRight: 4,
    },
    // EMPTY STATE
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    browseBtn: {
        marginTop: 30,
        backgroundColor: "#fd731d",
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 5,
    },
    browseBtnText: {
        color: "#fff",
    },
});