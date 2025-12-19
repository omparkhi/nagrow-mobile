import React, { useEffect, useMemo } from "react";
import { View, FlatList, StyleSheet, RefreshControl, StatusBar } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchRiderHistory } from "@/redux/slices/rider/riderHistorySlice";
import AppText from "@/components/AppText";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";

export default function OrderHistory() {
  const dispatch = useDispatch();
  const { rider } = useSelector((state) => state.riderAuth);
  const { history, loading } = useSelector((state) => state.riderHistory);

  useEffect(() => {
    if (rider?._id) {
      dispatch(fetchRiderHistory(rider._id));
    }
  }, [rider]);

  const onRefresh = () => {
    dispatch(fetchRiderHistory(rider._id));
  };

  const totalEarnings = useMemo(() => {
    return history?.reduce((acc, item) => acc + (item.status === 'delivered' ? (item.deliveryFee || 0) : 0), 0) || 0;
  }, [history]);

  const renderItem = ({ item }) => {
    const isDelivered = item.status === "delivered";
    const statusColor = isDelivered ? "#10B981" : "#EF4444"; 
    const statusIcon = isDelivered ? "checkmark-done-circle" : "alert-circle";
    
    // Format: "12 Dec • 10:30 PM"
    const dateObj = new Date(item.createdAt);
    const dateStr = `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short' })} • ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    return (
      <View style={styles.card}>
        
        {/* TOP ROW: Date & Status */}
        <View style={styles.cardHeader}>
            <AppText variant="small" style={styles.dateText}>{dateStr}</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={statusIcon} size={14} color={statusColor} style={{ marginRight: 4 }} />
                <AppText variant="small" style={[styles.statusText, { color: statusColor }]}>
                    {isDelivered ? "Delivered" : item.status}
                </AppText>
            </View>
        </View>

        {/* MIDDLE: Location & ID */}
        <View style={styles.cardBody}>
            <View style={styles.iconBox}>
                <Ionicons name="restaurant" size={20} color="#0f172a" />
            </View>
            <View style={{ marginLeft: 12 }}>
                <AppText variant="small" style={styles.restName} numberOfLines={1}>
                    {item.restaurantId?.name || "Unknown Restaurant"}
                </AppText>
                <AppText variant="small" style={styles.orderId}>{item.orderNo}</AppText>
            </View>
            
            {/* PRICE TAG (Hero) */}
            <View style={styles.priceContainer}>
                <AppText variant="small" style={styles.priceValue}>₹ {item.deliveryFee}</AppText>
                {/* <AppText variant="small" style={styles.priceValue}></AppText> */}
            </View>
        </View>

        <View style={styles.divider} />

        {/* BOTTOM: Stats Footer */}
        <View style={styles.cardFooter}>
            <View style={styles.statItem}>
                <Ionicons name="navigate-circle-outline" size={16} color="#64748b" />
                <AppText variant="small" style={styles.statLabel}>{item.distanceKm || 0} km</AppText>
            </View>
            <View style={styles.dot} />
            <View style={styles.statItem}>
                <Ionicons name="wallet-outline" size={16} color="#64748b" />
                <AppText variant="small" style={styles.statLabel}>{item.paymentType === 'cod' ? 'Cash Collected' : 'Online Payment'}</AppText>
            </View>
        </View>

      </View>
    );
  };

const ListHeader = () => (
    <View style={styles.headerContainer}>
        {/* Premium Dark Summary Card */}
        <View style={styles.summaryCard}>
            
            {/* Left: Earnings (Flex: 1) */}
            <View style={styles.statGroup}>
              <AppText variant="small" style={styles.summaryLabel}>TOTAL EARNED</AppText>
              <View style={styles.valueRow}>
                  <View style={[styles.iconCircle, { backgroundColor: "rgba(74, 222, 128, 0.15)" }]}> 
                    <MaterialIcons name="currency-rupee" size={14} color="#4ade80" />
                  </View>
                  <AppText variant="small" style={styles.summaryHero}>{totalEarnings}</AppText>
              </View>
            </View>

            {/* Divider (Placed naturally between flex items) */}
            <View style={styles.verticalDivider} />

            {/* Right: Orders (Flex: 1) */}
            <View style={styles.statGroup}>
                <AppText variant="small" style={styles.summaryLabel}>TOTAL ORDERS</AppText>
                <View style={styles.valueRow}>
                    <View style={[styles.iconCircle, { backgroundColor: "rgba(96, 165, 250, 0.15)" }]}> 
                        <Ionicons name="cube-outline" size={14} color="#60a5fa" />
                    </View>
                    <AppText variant="small" style={styles.summaryHero}>{history?.length || 0}</AppText>
                </View>
            </View>

        </View>
        <AppText variant="small" style={styles.sectionTitle}>Recent Deliveries</AppText>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <FlatList
        data={history}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={["#0f172a"]} tintColor="#0f172a"/>
        }
        ListEmptyComponent={
            <View style={styles.empty}>
                <View style={styles.emptyCircle}>
                    <Ionicons name="documents-outline" size={40} color="#94a3b8"/>
                </View>
                <AppText variant="small" style={styles.emptyTitle}>No history yet</AppText>
                <AppText variant="small" style={styles.emptySub}>Complete deliveries to see them here</AppText>
            </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC", 
  },

  summaryCard: {
    marginTop: 10,
    marginHorizontal: 15,
    backgroundColor: "#0f172a",
    borderRadius: 15,
    paddingVertical: 24,
    paddingHorizontal: 10, // Reduced padding to give more space to flex items
    flexDirection: "row",
    alignItems: "center", // Vertically center everything
    shadowColor: "#0f172a",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  // 1. Force equal width for both sides
  statGroup: {
    flex: 1, 
    alignItems: 'center', // Horizontally center text/icon
    justifyContent: 'center',
  },

  // 2. Helper for the Icon + Number row
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6, // Space between Label and Number
  },

  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 8, // Soft square
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8, // Space between icon and number
  },

  summaryLabel: { 
    color: "#94a3b8", 
    fontSize: 11, 
    letterSpacing: 1, // Uppercase looks better spaced out
  },
  
  summaryHero: { 
    color: "#fff", 
    fontSize: 26, 
    letterSpacing: -0.5
  },

  // 3. Divider logic change (No Absolute)
  verticalDivider: { 
    width: 1, 
    height: 50, // Fixed height looks cleaner than 100%
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  sectionTitle: { 
    fontSize: 18, 
    color: "#1e293b", 
    marginBottom: 10,
    marginLeft: 18 
  },


  // Card Styles
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#64748b",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  dateText: { fontSize: 12, color: "#94a3b8" },
  statusText: { fontSize: 12 },

  cardBody: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center"
  },
  restName: { fontSize: 16, color: "#1e293b" },
  orderId: {width: "100%", fontSize: 13, color: "#64748b" },
  
  priceContainer: { alignItems: "flex-end", flex: 1 },
  rupeeSymbol: { fontSize: 20, color: "#16A34A", marginBottom: -4 },
  priceValue: { fontSize: 22, color: "#16A34A" },

  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 14 },

  cardFooter: { flexDirection: "row", alignItems: "center" },
  statItem: { flexDirection: "row", alignItems: "center" },
  statLabel: { fontSize: 13, color: "#64748b", marginLeft: 6 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#cbd5e1", marginHorizontal: 12 },

  // Empty State
  empty: { alignItems: "center", marginTop: 60 },
  emptyCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 18, color: "#64748b" },
  emptySub: { fontSize: 14, color: "#94a3b8", marginTop: 6 },
});