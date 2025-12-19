import { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, PermissionsAndroid, Alert } from "react-native";
import { saveFcmToken } from "@/services/notificationService";
import * as Notifications from 'expo-notifications';

export const usePushNotification = (roleId, role) => {
    // 1. Setup Channel (Android only) - Critical for Sound
    const createChannel = async () => {
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "Default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
    };

    // 2. Request Permission
    const requestUserPermission = async () => {
        if (Platform.OS === 'android') {
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        }

        const authStatus = await messaging().requestPermission();
        const enabled = 
            authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            await fetchToken();
        }
    };

    // 3. Get Token & Sync with Backend
    const fetchToken = async () => {
        try {
            const fcmToken = await messaging().getToken();
            if (!fcmToken) return;

            // Check if we already saved this specific token for this user
            const savedToken = await AsyncStorage.getItem(`fcmToken_${role}`);

            // If token is new OR user just logged in (we want to ensure backend has it)
            if (savedToken !== fcmToken || roleId) {
                console.log("REFRESHING FCM TOKEN...");
                await saveFcmToken(roleId, role, fcmToken);
                await AsyncStorage.setItem(`fcmToken_${role}`, fcmToken);
            }
        } catch (error) {
            console.log("Error fetching FCM token:", error);
        }
    };

    useEffect(() => {
        if (!roleId) return;

        createChannel();
        requestUserPermission();

        // A. Handle Token Refresh (Rare, but happens)
        const unsubscribeToken = messaging().onTokenRefresh(fcmToken => {
            saveFcmToken(roleId, role, fcmToken);
        });

        // B. Handle Foreground Messages
        // We intentionally DO NOTHING here because Socket.io handles the UI.
        // This prevents "Double Notifications" while using the app.
        const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
            console.log('Foreground Message received (Silenced for Socket):', remoteMessage);
        });

        return () => {
            unsubscribeToken();
            unsubscribeMessage();
        };
    }, [roleId, role]); // Re-run if user changes
};