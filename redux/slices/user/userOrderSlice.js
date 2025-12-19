import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export const fetchOrderById = createAsyncThunk(
    "orders/fetchOrderById",
    async(orderId, thunkAPI) => {
        try {
            const res = await axios.get(`${API_BASE}/api/user/order/${orderId}`);
            return res.data.order;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || err.message);
        }
    }
);


const userOrderSlice  = createSlice({
    name: "userOrder",
    initialState: {
        currentOrder: null,
        loading: false,
        error: null,
    },

    extraReducers: (builder) => {
        // FETCH ORDER BY ID
        builder
            .addCase(fetchOrderById.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.currentOrder = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentOrder = action.payload;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            });
    },
});


export default userOrderSlice.reducer;