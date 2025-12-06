import { createSlice } from "@reduxjs/toolkit";



const riderTrackingSlice = createSlice({
    name: "riderTracking",
    initialState: {
        isTracking: false,
        // isOnline: false,
    },
    reducers: {
        startShift(state) {
            state.isTracking = true;
            // state.isOnline = true;
        },
        stopShift(state) {
            state.isTracking = false;
            // state.isOnline = false;
        }
    }
});



export const { startShift, stopShift } = riderTrackingSlice.actions;
export default riderTrackingSlice.reducer;