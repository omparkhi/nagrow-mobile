import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


// export const startShift = createAsyncThunk(
//     "riderTracking/startShift", 
//     async()
// )


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