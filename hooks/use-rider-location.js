import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import axios from "axios";
import { getSocket } from "@/services/connectSocket";
import { useDispatch, useSelector } from "react-redux";
import { saveLastRiderLocation } from "@/redux/slices/rider/riderLocationSlice";
import { smartProcess, makeSimpleKalman } from "@/utils/trackingUtils";
import { fetchRiderProfile } from "@/redux/slices/rider/authSlice";

export default function useRiderLocation({ isTracking, riderId }) {
  const { rider } = useSelector(state => state.riderAuth);
  const orderIdRef = useRef(rider?.currentOrderId);
  // const orderId = rider?.currentOrderId;
  const dispatch = useDispatch();

  useEffect(() => {
    orderIdRef.current = rider?.currentOrderId;
    console.log("🔄 Tracking Hook: Order ID updated to:", orderIdRef.current);
  }, [rider?.currentOrderId]);
  
  useEffect(() => {
    fetchRiderProfile();
  }, []);

  // Refs to hold state without causing re-renders
  const kalmanInstanceRef = useRef(makeSimpleKalman(0.001, 1.5));
  const trackerStateRef = useRef({
    filtered: null,
    kalman: kalmanInstanceRef.current,
    lastRaw: null,
    uiPos: null,
  });
  
  const locationWatcher = useRef(null);

  // Helper: Haversine Distance
  function haversineDistance(c1, c2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371e3;
    const dLat = toRad(c2.lat - c1.lat);
    const dLng = toRad(c2.lng - c1.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(c1.lat)) * Math.cos(toRad(c2.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // CORE FUNCTION: Process and Emit Location
  const processAndEmit = async (rawLat, rawLng) => {
    // 1. Basic Jitter Filter
    const raw = { lat: rawLat, lng: rawLng, timestamp: Date.now() };
    // if (trackerStateRef.current.lastRaw) {
    //   const tiny = haversineDistance(trackerStateRef.current.lastRaw, raw);
    //   if (tiny < 1.5) 
    //     console.log("jitter ignore") 
    //   return; // Ignore movements < 1.5m
    // }

    // 2. Smart Process (Kalman + Snapping)
    const { uiFrames, emitPoint, newState } = smartProcess({
      lastState: trackerStateRef.current,
      rawGps: raw,
      routeCoords: [], 
      config: { alpha: 0.35, snapRadius: 30, stepMeters: 3 },
    });

    trackerStateRef.current = { ...newState, kalman: trackerStateRef.current.kalman };

    // 3. Emit to Socket
    try {
      const socket = getSocket();
      // Only emit if we have a riderId and socket is connected
      if (riderId && socket && socket.connected) {
        // console.log("📍 coords Emitted");

        const currentActiveOrderId = orderIdRef.current;

        socket.emit("rider:location", {
          riderId,
          coords: { lat: emitPoint.lat, lng: emitPoint.lng },
          orderId: currentActiveOrderId,
        });
        // console.log("🔥 EMITTED ORDER ID:", orderId);
        // console.log("🔥 EMITTED riderId:", riderId);
        // console.log("📍 Emitted:", emitPoint.lat, emitPoint.lng);
      }
    } catch (e) {
      console.log("Socket emit error:", e.message);
    }

    // //  API call
    // try {

    //     const res = await axios.post(
    //         `${process.env.EXPO_PUBLIC_API_URL}/api/rider/update/location`,
    //         { riderId, coords: emitPoint }
    //     );
    //       console.log(res.data);
    //     //  console.log("API SUCCESS:", res.data);
    // } catch (err) {
    //     console.log("API error:", err.message);
    //     if (err.response) console.log("Server response:", err.response.data);
    // }
    // 4. Update Redux (for UI)
    dispatch(saveLastRiderLocation({ lat: emitPoint.lat, lng: emitPoint.lng }));
  };

  useEffect(() => {
    let isMounted = true;

    const startTracking = async () => {
      // A. FAST START: Check permissions
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        const req = await Location.requestForegroundPermissionsAsync();
        if (req.status !== "granted") {
          Alert.alert("Permission Denied", "Enable location to start shift.");
          return;
        }
      }

      // B. INSTANT FIX: Get Last Known Location (Don't wait for GPS warm up)
      try {
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown && isMounted) {
            console.log("⚡ Instant Last Known Location");
            console.log(lastKnown);
            processAndEmit(lastKnown.coords.latitude, lastKnown.coords.longitude);
        }
      } catch (e) { console.log("No last known location"); }

      // C. REAL TIME: Start Watcher
      if (locationWatcher.current) return; // Don't restart if already running

      console.log("🛰️ Starting GPS Watcher...");
      locationWatcher.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000, // Reduced to 2s for faster initial updates
          // distanceInterval: 1, 
        },
        (location) => {
          if(!isMounted) return;
          processAndEmit(location.coords.latitude, location.coords.longitude);
        }
      );
    };

    const stopTracking = () => {
       if (locationWatcher.current) {
        locationWatcher.current.remove();
        locationWatcher.current = null;
        console.log("🛑 Stopped tracking");
      }
    };

    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      isMounted = false;
      stopTracking();
    };
  }, [isTracking, riderId]);

  // We use a ref for riderId inside the processing function so we don't restart the watcher when ID loads
  // However, since processAndEmit uses `riderId` from closure, we actually want it to just be available.
  // The trick below ensures socket emits work even if riderId arrives late without restarting GPS.
  
  return {};
}