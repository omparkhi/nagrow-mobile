import React, { useEffect } from "react";
import { View, ScrollView, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AppText from "@/components/AppText";
import Header from "../header";
import { fetchOrderById, updateOrderStatus } from "@/redux/slices/restaurant/orderSlice";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { getSocket } from "@/services/connectSocket";
// import { playNewOrderSound } from "@/hooks/rest-sound-notification";
import { useToast } from "@/app/ToastContext";

export default function OrderDetails() {
  const {  showToast } = useToast();
  const navigate = useNavigation();
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const { currentOrder, loading, error } = useSelector((state) => state.orders);
  const { restaurant } = useSelector(state => state.restaurantAuth);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [id]);

  useEffect(() => {
    console.log("order in rest:", currentOrder);
  },[]);
  const statusFlow = {
    placed: "accepted",
    accepted: "preparing",
    preparing: "ready",
    ready: null,
  };

  const handleStatusChange = (nextStatus) => {
    if (!currentOrder || loading) return;
    dispatch(updateOrderStatus({ orderId: currentOrder._id, status: nextStatus }));
  };

  const statusColor = (status) => {
    switch (status) {
      case "placed":
        return "#4169E1";
      case "accepted":
        return "#008000";
      case "preparing":
        return "#FF8C00";
      case "ready":
        return "#1E90FF";
      case "cancelled":
        return "#D63031";
      default:
        return "#333";
    }
  };

  // const RiderAssigned = (riderAssigned) => {
  //   if (riderAssigned) {

  //   }
  // }

  if (loading || !currentOrder) {
    return (
      <View style={{ flex: 1 }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1 }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <AppText variant="small" style={{ color: "red" }}>{error.message || error}</AppText>
        </View>
      </View>
    );
  }

  const nextStatus = statusFlow[currentOrder.status];

  return (
    <>
    
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      

      <View style={styles.container}>
        {/* Order Info */}
        <View style={styles.card}>
          <AppText variant="small" style={styles.title}>Order #{currentOrder.orderNo}</AppText>
          <View style={[styles.statusBadge, { backgroundColor: statusColor(currentOrder.status) }]}>
            <AppText variant="small" style={styles.statusText}>{currentOrder.status.toUpperCase()}</AppText>
          </View>
        </View>

        {/* Items */}
        <View style={styles.card}>
          <AppText variant="small" style={styles.sectionTitle}>Items</AppText>
          <FlatList
            data={currentOrder.items}
            keyExtractor={(item, idx) => idx.toString()}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <AppText variant="small" style={styles.itemName}>{item.menuItemId?.name}</AppText>
                <AppText variant="small" style={styles.itemQty}>
                  x{item.quantity} · ₹{item.menuItemId?.price}
                </AppText>
              </View>
            )}
          />
        </View>

         {/* rider Assigned */}
         {currentOrder.riderAssigned && (
          <View style={styles.card}>
          <AppText variant="small" style={styles.sectionTitle}>Rider Assigned</AppText>
          <AppText variant="small" style={styles.title}>Name: {currentOrder.riderId.name}</AppText>
          <View style={[styles.statusBadge, { backgroundColor: statusColor(currentOrder.status) }]}>
            <AppText variant="small" style={styles.statusText}>{currentOrder.status.toUpperCase()}</AppText>
          </View>
        </View>
         )}

        {/* Delivery & Payment */}
        <View style={styles.card}>
          <AppText variant="small" style={styles.sectionTitle}>Delivery Address</AppText>
          <AppText variant="small">{currentOrder.deliveryAddress?.formattedAddress}</AppText>

          <AppText variant="small" style={[styles.sectionTitle, { marginTop: 10 }]}>Payment</AppText>
          <AppText variant="small">Status: {currentOrder.paymentStatus}</AppText>
          <AppText variant="small">Type: {currentOrder.paymentType}</AppText>
          <AppText variant="small">Total: ₹{currentOrder.totalAmount}</AppText>
          <AppText variant="small">User Phone: {currentOrder.userId?.phone}</AppText>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {nextStatus && (
            <TouchableOpacity style={[styles.button, { backgroundColor: "#1E90FF" }]} onPress={() => handleStatusChange(nextStatus)}>
              <AppText variant="small" style={styles.buttonText}>Mark as {nextStatus}</AppText>
            </TouchableOpacity>
          )}
          {currentOrder.status !== "cancelled" && currentOrder.status !== "delivered" && (
            <TouchableOpacity style={[styles.button, { backgroundColor: "#D63031" }]} onPress={() => handleStatusChange("cancelled")}>
              <AppText variant="small" style={styles.buttonText}>Cancel Order</AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 30 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 18,  marginBottom: 6 },
  statusBadge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { color: "#fff", fontSize: 12 },
  sectionTitle: { fontSize: 16, marginBottom: 6 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  itemName: { fontSize: 14, color: "#333" },
  itemQty: { fontSize: 14, color: "#555" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, marginHorizontal: 4, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
