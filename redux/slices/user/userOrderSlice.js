import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export const fetchActiveOrders = createAsyncThunk(
    "orders/fetchActiveOrders",
    async (_, thunkAPI) => {
        try {
            const token = await AsyncStorage.getItem("token")
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_BASE}/api/user/order/active`, config);
            return res.data.activeOrders || [];
        } catch (error) {
            // Log the full error object to see details
            console.error("🔥 API Error:", error.toJSON ? error.toJSON() : error);
            
            // Check if it's a response error or a network error
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const fetchOrderHistory = createAsyncThunk(
    "order/fetchOrderHistory",
    async (_, thunkAPI) => {
        try {
            const token = await AsyncStorage.getItem("token")
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_BASE}/api/user/order/history`, config);
            return res.data.orderHistory || [];
        } catch (error) {
            // Log the full error object to see details
            console.log("🔥 API Error:", error.toJSON ? error.toJSON() : error);
            
            // Check if it's a response error or a network error
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
)

export const fetchOrderById = createAsyncThunk(
    "orders/fetchOrderById",
    async(orderId, thunkAPI) => {
        try {
            const res = await axios.get(`${API_BASE}/api/user/order/${orderId}`);
            return res.data.order;
        } catch (err) {
            console.log("error in curr user order: ", err)
            return thunkAPI.rejectWithValue(err.response?.data || err.message);
        }
    }
);


const userOrderSlice  = createSlice({
    name: "userOrder",
    initialState: {
        activeOrders: [],
        orderHistory: [], 
        currentOrder: null,
        loading: false,
        error: null,
    },
    reducers: {
        updateOrderReview: (state, action) => {
            const { orderId, reviewData } = action.payload;
            const orderIndex = state.orderHistory.findIndex((o) => o._id === orderId);

        if (orderIndex !== -1) {
            // We attach the new review data to the order object in Redux
            state.orderHistory[orderIndex].myReview = reviewData;
        }
        },
        // CALL THIS when navigating to the Tracking Page
        setCurrentOrderFromList: (state, action) => {
            const orderId = action.payload;
            const found = state.activeOrders.find(o => o._id === orderId);
            if (found) {
                state.currentOrder = found;
            }
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        // SOCKET UPDATE LOGIC - The "Brain" of multi-order handling
        updateActiveOrderStatus: (state, action) => {
            const { orderId, status, riderId, eta, riderLocation } = action.payload;

            // 1. Find the order in the list
            const index = state.activeOrders.findIndex(o => o._id === orderId);

            if (index !== -1) {
                const order = state.activeOrders[index];

                // --- STATIC UPDATES (Saved in DB) ---
                if (status) order.status = status;
                if (riderId) order.riderId = riderId;

                // --- EPHEMERAL UPDATES (Socket Only) ---
                // We inject this into Redux memory so the UI updates, 
                // even if MongoDB doesn't know about it.
                if (eta) {
                    // Safety Check: If 'live' object doesn't exist (because DB didn't send it), create it
                    if (!order.live) {
                        order.live = { etaMinutes: 0, remainingMeters: 0 };
                    }
                    order.live.etaMinutes = eta;
                }
            }
        },
    },
    extraReducers: (builder) => {
        // FETCH ORDER BY ID
        builder
            // --- Active List ---
            .addCase(fetchActiveOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchActiveOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.activeOrders = action.payload;
            })

            // single order
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true;
                // state.currentOrder = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;

            // Sync with list if it's there
                const index = state.activeOrders.findIndex(o => o._id === action.payload._id);
                if (index === -1) {
                    state.activeOrders.push(action.payload); // Add if missing
                } else {
                    state.activeOrders[index] = action.payload; // Update if exists
                }
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            })

            // order history
            .addCase(fetchOrderHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrderHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.orderHistory = action.payload;
            });
    },
});

export const { setCurrentOrderFromList, clearCurrentOrder, updateActiveOrderStatus, updateOrderReview } = userOrderSlice.actions;
export default userOrderSlice.reducer;