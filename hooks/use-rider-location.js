import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import { Alert, Linking, AppState } from "react-native"; // Added Linking to open settings
import * as TaskManager from 'expo-task-manager';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOCATION_TASK_NAME } from "@/services/LocationTask"; 
import { useDispatch, useSelector } from "react-redux";
import { stopShift } from "@/redux/slices/rider/riderTrackingSlice";
import { useRouter } from "expo-router";

const GPS_MODES = {
    IDLE: {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 50, // Only update if moved 50m
        timeInterval: 60000, // Or every 60 seconds
        label: "Idle Mode (Battery Saver)"
    },
    ACTIVE: {
        accuracy: Location.Accuracy.High,
        distanceInterval: 15, // Update every 15m
        timeInterval: 10000,  // Or every 10 seconds
        label: "Active Delivery Mode"
    },
    URGENT: {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 5,  // Update every 5m (High Precision)
        timeInterval: 3000,   // Or every 3 seconds
        label: "Precision Mode (Navigation)"
    }
}

export default function useRiderLocation({ isTracking }) {
    const appState = useRef(AppState.currentState);
    const foregroundSubscription = useRef(null);
    const dispatch = useDispatch();
    const router = useRouter();

    

    const { order } = useSelector(state => state.riderOrder);

    const getMode = () => {
        if (!order || order.status === 'delivered' || order.status === 'cancelled') {
            return GPS_MODES.IDLE;
        }

        // If Picking Up or On the Way
        if (order.status === 'pick_up_by_rider' || order.status === 'on the way') {
            // Optional: If distance < 1km, switch to URGENT
            // For now, we assume 'on the way' is always urgent or active
            return GPS_MODES.URGENT; 
        }
        return GPS_MODES.ACTIVE; // Default for 'accepted', 'preparing'
    };

    const currentMode = getMode();

    // 🛑 Helper: The Force Stop Function
    // const forceStopSession = async () => {
    //     console.log("🚨 FORCE STOPPING SESSION");
        
    //     // 1. Kill Foreground
    //     if (foregroundSubscription.current) {
    //         foregroundSubscription.current.remove();
    //         foregroundSubscription.current = null;
    //     }

    //     // 2. Kill Background Service
    //     const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    //     if (hasStarted) await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

    //     // 3. Clean Redux & Storage
    //     const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/rider/stop/shift`, { riderId });
    //     if (res.data.success) {
    //         dispatch(stopShift()); // Updates Redux state to { isTracking: false }
    //         // await AsyncStorage.remove("riderId");
    //     }
        

    //     // 4. Alert & Redirect
    //     Alert.alert("Session Expired", "Please start shift again.");
    //     // router.replace("/auth/login"); 
    // };

    const forceStopSession = async () => {
        console.log("🚨 FORCE STOPPING SESSION");
        try {
            // 1. ✅ FIX: Fetch ID locally (It was missing before)
            const storedRiderId = await AsyncStorage.getItem("riderId");

            // 2. Kill Foreground
            if (foregroundSubscription.current) {
                foregroundSubscription.current.remove();
                foregroundSubscription.current = null;
            }

            // 3. Kill Background Service (Safely)
            // ✅ FIX: Wrap in try/catch to prevent 'TaskNotFoundException' crash
            try {
                const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
                if (hasStarted) {
                    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
                }
            } catch (e) {
                console.log("⚠️ BG Task already stopped:", e.message);
            }

            // 4. API Call (Attempt to tell server, but don't crash if it fails)
            if (storedRiderId) {
                try {
                    await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/rider/stop/shift`, { riderId: storedRiderId });
                } catch (e) { console.log("API Stop Failed (Expected on Kill):", e.message); }
            }

            // 5. Clean Redux & Storage
            dispatch(stopShift()); 
            // await AsyncStorage.removeItem("riderId"); // Optional: Keep ID for auto-login

            Alert.alert("Session Ended", "Tracking stopped.");

        } catch (error) {
            console.log("Force Stop Critical Error:", error);
        }
    };


    useEffect(() => {
        const manageService = async () => {
        const riderId = await AsyncStorage.getItem('riderId');
        console.log("🪝 Tracking Status:", isTracking);
        console.log(`🪝 Tracking: ${isTracking} | Mode: ${currentMode.label}`);

      
        if (isTracking) {
            try {
                // 1. PERMISSIONS
                const { status: fg } = await Location.getForegroundPermissionsAsync();
                const { status: bg } = await Location.getBackgroundPermissionsAsync();
            
                if (fg !== 'granted') {
                    console.log("❌ Foreground missing. Asking...");
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert("Permission Denied", "Location is needed.");
                        return;
                    }
                }

                // // 2. Check Background Permission (CRITICAL STEP)
                // console.log("🔍 Checking Background...");
                // const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
                // console.log("✅ Background Status:", bgStatus);

                if (bg !== 'granted') {
                    console.log("⚠️ Background missing. Requesting...");
                
                    // On Android 11+, this might not show a popup. 
                    // We often have to send user to settings manually.
                    Alert.alert(
                        "Background Permission Needed", 
                        "To receive orders while your phone is locked, you MUST select 'Allow all the time' in settings.",
                        [
                            { text: "Cancel", style: "cancel" },
                            { text: "Open Settings", onPress: () => Linking.openSettings() }
                        ]
                    );
                    return; // Stop here until they fix it
                }

                // // 3. Check if Task is already running
                // const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
                // console.log("🏃 Task Registered?", isRegistered);
            
                // if (isRegistered) {
                //     const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
                //     if (hasStarted) {
                //         console.log("⚠️ Service already running. Skipping start.");
                //         return;
                //     }
                // }

                // 4. Start The Service
                // console.log("🚀 Attempting to start 'startLocationUpdatesAsync'...");
                const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
                if (!hasStarted) {
                    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                        accuracy: currentMode.accuracy,
                        distanceInterval: currentMode.distanceInterval,
                        timeInterval: currentMode.timeInterval,
                        // Android Foreground Service Notification
                        foregroundService: {
                            notificationTitle: "NaGrow Rider",
                            notificationBody: isTracking ? "Online: Looking for orders..." : "Tracking Paused",
                            notificationColor: "#0f172a"
                        },
                        // iOS Battery Saving
                        pausesUpdatesAutomatically: currentMode === GPS_MODES.IDLE, 
                        activityType: Location.ActivityType.AutomotiveNavigation
                    });

                    console.log("🚀 BG Service Active");
                    console.log("✅ BG Service Updated:", currentMode.label);
                }
                
                // 3. 🔵 START FOREGROUND WATCHER (For when App is OPEN)
                // This ensures the map updates smoothly and ETA is calculated instantly
                if (!foregroundSubscription.current) {
                    console.log("👀 Starting Foreground Watcher...");
                    foregroundSubscription.current = await Location.watchPositionAsync(
                        {
                            accuracy: currentMode.accuracy,
                            distanceInterval: currentMode.distanceInterval,
                            timeInterval: currentMode.timeInterval
                        },
                        async (location) => {
                            // ⚡ DIRECT HTTP HIT (No Socket needed)
                            // We use the same API as the background service
                            try {
                                const riderId = await AsyncStorage.getItem("riderId");
                                if (riderId) {
                                    console.log("📍 FG Ping:", location.coords.latitude);
                                    await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/rider/location/update`, {
                                        riderId,
                                        lat: location.coords.latitude,
                                        lng: location.coords.longitude
                                    });
                                }
                            } catch (error) {
                                const status = error.response?.status;
                                console.log("FG Update Error:", error.message);

                                // ⚡ CHECK FOR 401/403
                                if (status === 401 || status === 403) {
                                    await forceStopSession();
                                }
                            }
                        }
                    );
                }
                

            } catch (error) {
                console.error("🔥 START ERROR:", error);
                Alert.alert("Tracking Error", error.message);
            }

        } else {
            // 🛑 STOP EVERYTHING
            console.log("🛑 Stopping All Tracking...");
        
            // Stop Background
            const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
            if (hasStarted) await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

            // Stop Foreground
            if (foregroundSubscription.current) {
                foregroundSubscription.current.remove();
                foregroundSubscription.current = null;
            }
        }
        };

        manageService();

        // Cleanup on Unmount
    return () => {
        if (foregroundSubscription.current) {
            foregroundSubscription.current.remove();
            foregroundSubscription.current = null;
        }
    };
  }, [isTracking, order?.status]);

  return {}; 
}