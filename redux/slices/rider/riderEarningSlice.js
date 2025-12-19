import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export const fetchRiderEarnings = createAsyncThunk(
    "riderEarning/fetchEarning",
    async (_, { rejectWithValue }) => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) throw new Error("No auth token");
            const res = await axios.get(`${API_BASE}/api/rider/earning`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            );
            console.log("rider eraning: ",res.data);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const riderEarningSlice = createSlice({
    name: "riderEarning",
    initialState: {
        earnings: {
            totalEarnings: 0,
            currentBalance: 0,
            totalPaidOut: 0,
        },
        payouts: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRiderEarnings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRiderEarnings.fulfilled, (state, action) => {
                state.loading = false;
                state.earnings = action.payload.earnings;
                state.payouts = action.payload.payouts;
            })
            .addCase(fetchRiderEarnings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default riderEarningSlice.reducer;