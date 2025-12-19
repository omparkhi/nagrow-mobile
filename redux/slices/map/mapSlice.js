import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    routeFitted: false,
    routeFetched: false,
    routeCache: [],     // store decoded polyline here
    eta: null,
    remainingMeters: null,
    // remainingDuration: null,
};

const mapSlice = createSlice({
    name: "mapState",
    initialState,
    reducers: {
        setRouteFitted(state) {
            state.routeFitted = true;
        },
        setRouteFetched: (state) => {
            state.routeFetched = true;
        },
        setRouteCache: (state, action) => {
            state.routeCache = action.payload;
        },
        setETA: (state, action) => {
            state.eta = action.payload.etaMinutes;
            state.remainingMeters = action.payload.remainingMeters;
        },
        resetMapState: (state) => {
            state.routeFetched = false;
            state.routeFitted = false;
            state.routeCache = [];
            state.eta = null;
            state.remainingMeters = null
        },
    },
});

export const { setRouteFitted, setRouteFetched, setRouteCache, resetRouteFitted, setETA, resetMapState } = mapSlice.actions;
export default mapSlice.reducer;