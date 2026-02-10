import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import * as Notifications from 'expo-notifications';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async({ data, error }) => {
    
    if (error) {
        console.error("BG Location Error:", error);
        return;
    }

    if (data) {
        const { locations } = data;
        const location = locations[0]; // Get the newest location

        if (location) {
            try {
                const riderId = await AsyncStorage.getItem("riderId");
                // const { rider } = useSelector(state => state.riderAuth);
                if (riderId) {
                    // Hit the NEW HTTP Endpoint
                    await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/rider/location/update`, {
                        riderId: riderId,
                        lat: location.coords.latitude,
                        lng: location.coords.longitude,
                        // orderId: rider?.currentOrderId
                    });
                    console.log("📍 BG Ping Sent via HTTP");
                }
            } catch (error) {
                const status = error.response?.status;
                console.log(`BG API Fail (${status}):`, error.message);

                // 🛑 KILL SWITCH: If Unauthorized (401) or Forbidden (403)
                if (status === 401 || status === 403) {
                    console.log("🚫 Session Expired or Banned. KILLING SERVICE.");

                    try {
                        // 1. Check if running BEFORE stopping
                        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
                        
                        if (hasStarted) {
                            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
                            console.log("✅ Service killed successfully.");
                        } else {
                            console.log("⚠️ Service was already stopped.");
                        }

                        // 2. Clear Local Storage to prevent auto-restart loop
                        // await AsyncStorage.multiRemove(["token", "riderId", "isTracking"]);

                        // 3. Notify User
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: "Session Expired",
                                body: "Your shift has been stopped. Please log in again.",
                            },
                            trigger: null,
                        });

                    } catch (stopError) {
                        // ⚡ SILENCE THE CRASH
                        // If it fails here, it usually means the OS already killed it. 
                        // We ignore it to prevent the red screen.
                        console.log("⚠️ Safe Fail during stop:", stopError.message);
                    }
                }
            }
        }
    }
});