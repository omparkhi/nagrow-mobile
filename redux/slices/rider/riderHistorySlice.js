import { createAsyncThunk, createSlice, isRejected } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export const fetchRiderHistory = createAsyncThunk(
    "riderHistory/fetchHistory",
    async (riderId, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${API_BASE}/api/rider/history/${riderId}`);
            console.log("history from redux:", res.data.history)
            return res.data.history;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

const riderHistorySlice = createSlice({
    name: "riderHistory",
    initialState: {
        history: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRiderHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRiderHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload; // Make sure to add 'history: []' to initialState
            })
            .addCase(fetchRiderHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default riderHistorySlice.reducer;