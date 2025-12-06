import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    lastLocation: null, // { lat, lng, heading, timestamp }
};

const riderLocationSlice = createSlice({
    name: "riderLocation",
    initialState,
    reducers: {
        saveLastRiderLocation(state, action) {
            state.lastLocation = {
                ...action.payload,
                timestamp: new Date().toISOString(),
            };
        },
        clearLastRiderLocation(state) {
            state.lastLocation = null;
        },
    },
});

export const { saveLastRiderLocation, clearLastRiderLocation } = riderLocationSlice.actions;
export default riderLocationSlice.reducer;