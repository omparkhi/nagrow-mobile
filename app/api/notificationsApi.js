import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const addNotificationAPI = async (payload) => {
    try {
        const res = await axios.post(`${API_URL}/api/notifications`, payload);
        return res.data.notification;
    } catch (err) {
        console.log("Add notification error:", err.response?.data);
        return null;
    }
};

export const fetchNotificationsAPI = async (receiverId, limit = 50, skip = 0) => {
    try {
        const res = await axios.post(`${API_URL}/api/notifications`, {
            params: { receiverId, limit, skip },
        });
        return res.data.notifications;
    } catch (err) {
        console.log("Fetch notification error:", err.response?.data);
        return [];
    }
};

export const markReadAPI = async (receiverId) => {
    try {
        const res = await axios.post(`${API_URL}/api/notifications/mark-read`, { receiverId });
        return res.data;
    } catch (err) {
        console.log("Mark read error", err?.response?.data || err.message);
        return null;
    }
};



