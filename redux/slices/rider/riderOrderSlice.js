import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

// fetch order details
export const fetchRiderOrder = createAsyncThunk(
    "riderOrder/fetch",
    async (orderId, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${API_BASE}/api/rider/order/${orderId}`);
             return res.data.order;
        } catch (err) {
            return rejectWithValue(err.response?.data || err);
        }
    }
);

// update order status
export const updateRiderOrderStatus = createAsyncThunk(
    "riderOrder/updateStatus",
    async ({ orderId, riderId, status }, { rejectWithValue }) => {
        try {
            const res = await axios.put(`${API_BASE}/api/rider/order/update/status`, 
                { orderId, riderId, status }
            );
            console.log("rider order status update:", res.data);
            return res.data.order;
        } catch (err) {
            return rejectWithValue(err.response?.data || err);
        }
    }
);

const riderOrderSlice  = createSlice({
    name: "riderOrder",
    initialState: {
        order: null,
        loading: false,
    },
    extraReducers: (builder) => {
        builder
            // fetch order
            .addCase(fetchRiderOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRiderOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
            // UPDATE ORDER STATUS
            .addCase(updateRiderOrderStatus.fulfilled, (state, action) => {
                state.order = action.payload;
            });
    }
});


export default riderOrderSlice.reducer;
