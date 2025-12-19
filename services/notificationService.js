import axios from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export const saveFcmToken = async (roleId, role, fcmToken) => {
    try {
        let endpoint = "";

        // Select the correct endpoint based on who is logged in
        if (role === "user") endpoint = "/api/user/fcm";
        if (role === "restaurant") endpoint = "/api/restaurant/fcm";
        if (role === "rider") endpoint = "/api/rider/fcm";

        if (!endpoint) return;

        await axios.post(`${API_BASE}${endpoint}`, {
            [`${role}Id`]: roleId,
            fcmToken: fcmToken,
        });
        
        console.log(`[FCM] Token saved for ${role}`);
    } catch (error) {
        console.error("[FCM] Error saving token:", error);
    }
};