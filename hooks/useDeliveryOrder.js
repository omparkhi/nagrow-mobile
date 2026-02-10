import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRiderOrder, updateRiderOrderStatus } from "@/redux/slices/rider/riderOrderSlice";
import { saveLastRiderLocation, clearLastRiderLocation } from "@/redux/slices/rider/riderLocationSlice";
import { resetMapState } from "@/redux/slices/map/mapSlice";
import { getSocket } from "@/services/connectSocket";
import { playDeliverySuccessSound } from "./notification";
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import { Linking, Platform, Alert } from "react-native";
import { fetchTodayStats } from "@/redux/slices/rider/riderStatsSlice";

export const useDeliveryOrder = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    // selectors
    const { rider } = useSelector(state => state.riderAuth);
    const { order, loading, loadingStatus } = useSelector((state) => state.riderOrder);
    const { eta, remainingMeters } = useSelector((state) => state.mapState);

    // local state
    const [riderCoords, setRiderCoords] = useState(null);
    const [minsToPickup, setMinsToPickup] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showCodPopup, setShowCodPopup] = useState(false);

    const orderId = rider?.currentOrderId;

    // initial data fetch
    useEffect(() => {
        if (orderId) dispatch(fetchRiderOrder(orderId));
    }, [dispatch, orderId]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        // initial location
        (async() => {
            try {
                const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                const loc = { lat: coords.latitude, lng: coords.longitude };
                console.log("📍 Initial Map Location:", loc);
                setRiderCoords(loc);
                dispatch(saveLastRiderLocation(loc));
            } catch (error) {
                console.log("GPS Error:", error);
            }
        })();

        // socket handler
        const handleLocationUpdate = (data) => {
            if (data.riderLoc) {
                const loc = { lat: data.riderLoc.lat, lng: data.riderLoc.lng };
                setRiderCoords(loc);
                dispatch(saveLastRiderLocation(loc));
            }
        };

        socket.on("order:eta:update", handleLocationUpdate);
        return () => socket.off("order:eta:update", handleLocationUpdate);
    }, [dispatch]);

    // timer logic 
    useEffect(() => {
    if (!order?.targetReadyTime) return;
    const interval = setInterval(() => {
        const diff = Math.ceil((new Date(order.targetReadyTime).getTime() - Date.now()) / 60000);
        setMinsToPickup(diff);
    }, 30000); // Run every 30s is enough
    return () => clearInterval(interval);
  }, [order?.targetReadyTime]);

  const handleNavigation = useCallback(() => {
    if (!order) return;
    let lat, lng, label;
    
    if (["accepted", "preparing", "ready"].includes(order.status)) {
        lat = order.restaurantId.address.location.coordinates[1];
        lng = order.restaurantId.address.location.coordinates[0];
        label = "Restaurant";
    } else {
        lat = order.deliveryAddress.coordinates[1];
        lng = order.deliveryAddress.coordinates[0];
        label = "Customer";
    }

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`
    });
    Linking.openURL(url);
  }, [order]);

  const updateStatus = useCallback(async (status, force = false) => {
    if (!force && status === "delivered" && order?.paymentType === "cod" && order?.paymentStatus === "pending") {
        console.log("🛑 Opening COD Popup");
        setShowCodPopup(true);
        return;
    }

    // 2. Dispatch API
    console.log("🚀 Dispatching Update:", status); // Debug Log
    await dispatch(updateRiderOrderStatus({ orderId: order?._id, riderId: rider?._id, status }));

    if (status === "delivered") {
        playDeliverySuccessSound();
        setShowSuccessModal(true);
    }
  }, [dispatch, order, rider]);

  const finishDelivery = useCallback(() => {
      setShowSuccessModal(false);
      dispatch(clearLastRiderLocation());
      dispatch(resetMapState());
      dispatch(fetchTodayStats(rider._id))
      router.replace("/rider/dashboard/dash");
  }, [dispatch, router]);

  return {
    order,
    loading,
    loadingStatus,
    riderCoords,
    eta,
    remainingMeters,
    minsToPickup,
    showSuccessModal,
    showCodPopup,
    setShowCodPopup,
    handleNavigation,
    updateStatus,
    finishDelivery
  };
}