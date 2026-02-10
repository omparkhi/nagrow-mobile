import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchTodayStats = createAsyncThunk(
    "riderStats/fetchToday",
    async (riderId) => {
        const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/rider/stats/today/${riderId}`);
        return res.data;
    }
);

const riderStatsSlice = createSlice({
    name: "riderStats",
    initialState: { earnings: 0, orders: 0, loading: false },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodayStats.fulfilled, (state, action) => {
                state.earnings = action.payload.earnings;
                state.orders = action.payload.orders;
            });
    },
});

export default riderStatsSlice.reducer;