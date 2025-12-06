import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    routeFitted: false,
    routeFetched: false,
    routeCache: [],     // store decoded polyline here
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
        resetMapState: (state) => {
            state.routeFetched = false;
            state.routeFitted = false;
            state.routeCache = [];
        },
    },
});

export const { setRouteFitted, setRouteFetched, setRouteCache, resetRouteFitted } = mapSlice.actions;
export default mapSlice.reducer;