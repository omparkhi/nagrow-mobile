import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

async function authHeader() {
    const token = await AsyncStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const addressService = {
    async getAddresses() {
        const headers = await authHeader();
        const res = await axios.get(`${API_BASE}/api/user/get-address`, { headers });
        return res.data;
    },

    async selectAddress(addressId) {
        const headers = await authHeader();
        const res = await axios.get(`${API_BASE}/api/user/get-address?addressId=${addressId}`, { headers });
        return res.data;
    },

    async saveAddress(payload) {
        const headers = await authHeader();
        const res = await axios.post(`${API_BASE}/api/user/save-address`, payload, { headers });
        return res.data;
    },

    async updateAddress(addressId, payload) {
        const headers = await authHeader();
        const res = await axios.put(`${API_BASE}/api/user/update-address/${addressId}`, payload, { headers });
        return res.data;
    },

    async deleteAddress(addressId) {
        const headers = await authHeader();
        const res = await axios.delete(`${API_BASE}/api/user/delete-address/${addressId}`, { headers });
        return res.data;
    }
};
