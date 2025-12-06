import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export const loginRider = createAsyncThunk(
    "riderAuth/loginRider",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${API_BASE}/api/rider/login`, formData);
            if (!res.data.success) {
                return rejectWithValue(res.data.message);
            }

            const { rider, token } = res.data;
            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("riderId", rider._id);
            await AsyncStorage.setItem("userType", "rider");

            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            return { rider, token };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err?.message);
        }
    }
)

export const signupRider = createAsyncThunk(
    "riderAuth/signupRider",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${API_BASE}/api/rider/register`, formData);
            // console.log("rider sighup:", res.data);
             if (!res.data.success) {
                return rejectWithValue(res.data.message);
            }

            const { rider, token } = res.data;
            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("riderId", rider._id);
            await AsyncStorage.setItem("userType", "rider");

            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            return { rider, token };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Signup failed");
        }
    }
);

export const fetchRiderProfile = createAsyncThunk(
    "riderAuth/fetchRiderProfile", 
    async (_, { rejectWithValue }) => {
        try {
            const riderId = await AsyncStorage.getItem("riderId");
            const token = await AsyncStorage.getItem("token");

            if (!riderId || !token) return null;

            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const res = await axios.get(`${API_BASE}/api/rider/profile/${riderId}`);
             if (!res.data.success) {
                return rejectWithValue(res.data.message);
            }
            return {rider: res.data.rider, token};

        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
        }
    }
);


const authSlice = createSlice({
    name: "riderAuth",
    initialState: {
        rider: null,
        token: null,
        loading: false,
        error: null,
        isAuthenticated: false,
    },
    reducers: {
        logout: (state) => {
            state.rider = null;
            state.token = null;
            AsyncStorage.removeItem("token");
            AsyncStorage.removeItem("riderId");
            AsyncStorage.removeItem("userType");
            delete axios.defaults.headers.common["Authorization"];
        },
    },
    extraReducers: (builder) => {
        builder
            // login handler
            .addCase(loginRider.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginRider.fulfilled, (state, action) => {
                state.loading = false;
                state.rider = action.payload.rider;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loginRider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // signup handler
            .addCase(signupRider.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupRider.fulfilled, (state, action) => {
                state.loading = false;
                state.rider = action.payload.rider;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(signupRider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // fetch profile handler
            .addCase(fetchRiderProfile.fulfilled, (state, action) => {
                if (!action.payload) return;
            
                    state.rider = action.payload.rider;
                    state.token = action.payload.token;
                    state.isAuthenticated = true;
                })
            .addCase(fetchRiderProfile.rejected, (state) => {
                state.rider = null;
                state.token = null;
                state.isAuthenticated = false; 
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;